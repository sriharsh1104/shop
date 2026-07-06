import { Response } from 'express';
import { otpService, sendEmailNotification } from '../services/otp.service';
import { SendOtpRequest, VerifyOtpRequest, NotificationRequest } from '../types';

export async function sendOtp(req: { body: SendOtpRequest }, res: Response): Promise<void> {
  const { email, purpose } = req.body;

  if (!email || !purpose) {
    res.status(400).json({ message: 'Email and purpose are required' });
    return;
  }

  const { otp } = otpService.create(email, purpose);

  await sendEmailNotification(
    email,
    'Your Verification Code',
    `Your OTP for ${purpose} is: ${otp}. It expires in 10 minutes.`
  );

  res.json({ message: 'OTP sent successfully', otp });
}

export function verifyOtp(req: { body: VerifyOtpRequest }, res: Response): void {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ message: 'Email and OTP are required' });
    return;
  }

  const verified = otpService.verify(email, otp);
  if (!verified) {
    res.status(400).json({ message: 'Invalid or expired OTP', verified: false });
    return;
  }

  res.json({ message: 'OTP verified successfully', verified: true });
}

export async function sendNotification(
  req: { body: NotificationRequest },
  res: Response
): Promise<void> {
  const { email, subject, body } = req.body;

  if (!email || !subject || !body) {
    res.status(400).json({ message: 'Email, subject, and body are required' });
    return;
  }

  await sendEmailNotification(email, subject, body);
  res.json({ message: 'Notification sent successfully' });
}
