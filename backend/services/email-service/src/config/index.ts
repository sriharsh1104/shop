import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27018/shop-emails',
  resendApiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'Shop <onboarding@resend.dev>',
  devLogOtp: process.env.DEV_LOG_OTP !== 'false',
};
