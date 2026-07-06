import { Response } from 'express';
import { otpService } from '../services/otp.service';
import { VerifyOtpRequest } from '../types';

export async function verifyOtp(req: { body: VerifyOtpRequest }, res: Response): Promise<void> {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ message: 'Email and OTP are required' });
    return;
  }

  const verified = await otpService.verify(email, otp);
  if (!verified) {
    res.status(400).json({ message: 'Invalid or expired OTP', verified: false });
    return;
  }

  res.json({ message: 'OTP verified successfully', verified: true });
}
