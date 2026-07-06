import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { OtpRecord } from '../types';

const otpStore = new Map<string, OtpRecord>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const otpService = {
  create(email: string, purpose: string): { record: OtpRecord; otp: string } {
    const otp = generateOtp();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.otpExpiryMinutes * 60 * 1000);

    const record: OtpRecord = {
      id: uuidv4(),
      email,
      otp,
      purpose,
      expiresAt: expiresAt.toISOString(),
      verified: false,
      createdAt: now.toISOString(),
    };

    otpStore.set(`${email}:${purpose}`, record);
    return { record, otp };
  },

  verify(email: string, otp: string): boolean {
    for (const [key, record] of otpStore.entries()) {
      if (!key.startsWith(email)) continue;
      if (record.verified) continue;
      if (new Date(record.expiresAt) < new Date()) continue;
      if (record.otp === otp) {
        record.verified = true;
        otpStore.set(key, record);
        return true;
      }
    }
    return false;
  },
};

export async function sendEmailNotification(
  email: string,
  subject: string,
  body: string
): Promise<void> {
  // In production, integrate with SendGrid, SES, etc.
  console.log(`\n📧 Email to: ${email}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Body: ${body}\n`);
}
