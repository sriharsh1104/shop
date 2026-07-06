export interface OtpRecord {
  id: string;
  email: string;
  otp: string;
  purpose: string;
  expiresAt: string;
  verified: boolean;
  createdAt: string;
}

export interface SendOtpRequest {
  email: string;
  purpose: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface NotificationRequest {
  email: string;
  subject: string;
  body: string;
}
