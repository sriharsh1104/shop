import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'pending_payment' | 'paid' | 'failed' | 'cancelled';

export interface IShippingAddress {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface IOrderDoc extends Document {
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  addressId: string;
  shippingAddress: IShippingAddress;
  paymentId: string | null;
  razorpayOrderId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    label: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDoc>(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, default: '' },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'failed', 'cancelled'],
      default: 'pending_payment',
    },
    addressId: { type: String, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentId: { type: String, default: null },
    razorpayOrderId: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrderDoc>('Order', orderSchema);
