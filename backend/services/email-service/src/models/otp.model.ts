import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpDoc extends Document {
  email: string;
  otp: string;
  purpose: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOtpDoc>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    purpose: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, purpose: 1 });

export const OtpModel = mongoose.model<IOtpDoc>('Otp', otpSchema);
