import { Response } from 'express';
import { userStore } from '../services/user.service';
import { sendOtp, verifyOtp } from '../services/email.client';
import { comparePassword, generateToken, sanitizeUser } from '../utils';
import { SignupRequest, LoginRequest, ProfileUpdate, User } from '../types';
import { AuthRequest } from '../middleware';

function issueToken(user: User): string {
  return generateToken({
    userId: user.id,
    email: user.email,
    tokenVersion: user.tokenVersion ?? 0,
  });
}

export async function signup(req: AuthRequest, res: Response): Promise<void> {
  const data: SignupRequest = req.body;

  const existingByEmail = await userStore.findByEmail(data.email);

  // Unverified account → resend OTP and continue verification instead of blocking
  if (existingByEmail && !existingByEmail.isVerified) {
    if (!(await comparePassword(data.password, existingByEmail.passwordHash))) {
      res.status(401).json({ message: 'Email already registered. Enter the correct password to continue verification.' });
      return;
    }

    try {
      await sendOtp(existingByEmail.email, 'resend');
      console.log(`OTP resent for unverified user ${existingByEmail.email} via Kafka`);
    } catch (err) {
      console.error('Failed to send OTP:', err);
      res.status(503).json({ message: 'Failed to send verification email. Please try again.' });
      return;
    }

    const token = issueToken(existingByEmail);
    res.status(200).json({
      message: 'Account already exists but is not verified. OTP sent to your email.',
      token,
      requiresOtp: true,
      user: sanitizeUser(existingByEmail),
    });
    return;
  }

  if (existingByEmail) {
    res.status(409).json({ message: 'Email already registered. Please sign in.' });
    return;
  }

  if (await userStore.findByUsername(data.username)) {
    res.status(409).json({ message: 'Username already taken' });
    return;
  }

  const user = await userStore.create(data);

  try {
    await sendOtp(user.email, 'signup');
    console.log(`OTP requested for ${user.email} via Kafka`);
  } catch (err) {
    console.error('Failed to send OTP:', err);
    await userStore.deleteById(user.id);
    res.status(503).json({
      message: 'Failed to send verification email. Is Kafka running? Try: docker compose up -d kafka',
    });
    return;
  }

  const token = issueToken(user);

  res.status(201).json({
    message: 'Account created. Please verify your email with the OTP sent.',
    token,
    requiresOtp: true,
    user: sanitizeUser(user),
  });
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { email, password }: LoginRequest = req.body;

  const user = await userStore.findByEmail(email);
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  if (!user.isVerified) {
    try {
      await sendOtp(user.email, 'login');
    } catch (err) {
      console.error('Failed to send OTP:', err);
      res.status(503).json({ message: 'Failed to send OTP. Please try again.' });
      return;
    }

    const token = issueToken(user);
    res.status(200).json({
      message: 'Account not verified. OTP sent to your email.',
      token,
      requiresOtp: true,
      user: sanitizeUser(user),
    });
    return;
  }

  const token = issueToken(user);
  res.json({
    message: 'Login successful',
    token,
    user: sanitizeUser(user),
  });
}

export async function verifyOtpHandler(req: AuthRequest, res: Response): Promise<void> {
  const { otp } = req.body;
  const userId = req.userId!;

  const user = await userStore.findById(userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const verified = await verifyOtp(user.email, otp);
  if (!verified) {
    res.status(400).json({ message: 'Invalid or expired OTP' });
    return;
  }

  const updated = await userStore.markVerified(userId);
  if (!updated) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({
    message: 'Email verified successfully. Registration complete.',
    user: sanitizeUser(updated),
  });
}

export async function resendOtp(req: AuthRequest, res: Response): Promise<void> {
  const user = await userStore.findById(req.userId!);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  try {
    await sendOtp(user.email, 'resend');
    res.json({ message: 'OTP resent successfully' });
  } catch {
    res.status(503).json({ message: 'Failed to resend OTP. Is Kafka running?' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await userStore.findById(req.userId!);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  await userStore.incrementTokenVersion(req.userId!);
  res.json({ message: 'Logged out successfully' });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const data: ProfileUpdate = req.body;
  const { username, phone } = data;

  if (!username?.trim() && !phone?.trim()) {
    res.status(400).json({ message: 'Username or phone is required' });
    return;
  }

  if (phone && !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
    res.status(400).json({ message: 'Invalid phone number' });
    return;
  }

  if (username) {
    const existing = await userStore.findByUsername(username.trim());
    if (existing && existing.id !== req.userId) {
      res.status(409).json({ message: 'Username already taken' });
      return;
    }
  }

  const updated = await userStore.updateProfile(req.userId!, {
    ...(username ? { username: username.trim() } : {}),
    ...(phone ? { phone: phone.trim() } : {}),
  });

  if (!updated) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({ message: 'Profile updated', user: sanitizeUser(updated) });
}
