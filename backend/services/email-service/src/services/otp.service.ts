import { config } from '../config';
import { OtpModel } from '../models/otp.model';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const otpService = {
  async create(email: string, purpose: string): Promise<{ otp: string }> {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000);

    await OtpModel.findOneAndUpdate(
      { email: email.toLowerCase(), purpose },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    return { otp };
  },

  async verify(email: string, otp: string): Promise<boolean> {
    const record = await OtpModel.findOne({
      email: email.toLowerCase(),
      otp,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) return false;

    record.verified = true;
    await record.save();
    return true;
  },
};
