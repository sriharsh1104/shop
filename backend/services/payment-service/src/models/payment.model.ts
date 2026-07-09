import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 'created' | 'paid' | 'failed';

export interface IPaymentDoc extends Document {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDoc>(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: null },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.model<IPaymentDoc>('Payment', paymentSchema);
