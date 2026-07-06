import { config } from '../config';
import { publishOtpRequested } from '../kafka/producer';

export async function sendOtp(email: string, purpose: string): Promise<void> {
  await publishOtpRequested({ email, purpose });
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const response = await fetch(`${config.emailServiceUrl}/api/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) return false;
  const data = (await response.json()) as { verified: boolean };
  return data.verified;
}
