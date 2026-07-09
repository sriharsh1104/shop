import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  email: string;
  username: string;
  phone: string;
  passwordHash: string;
  isVerified: boolean;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDoc>('User', userSchema);
