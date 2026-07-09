export type OrderStatus = 'pending_payment' | 'paid' | 'failed' | 'cancelled';

export interface ShippingAddress {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  addressId: string;
  shippingAddress: ShippingAddress;
  paymentId: string | null;
  razorpayOrderId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  tokenVersion: number;
}

export interface PlaceOrderRequest {
  productId: string;
  quantity: number;
  addressId: string;
}

export interface ConfirmOrderRequest {
  paymentId?: string;
  razorpayOrderId?: string;
}
