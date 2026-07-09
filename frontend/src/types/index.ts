export interface User {
  id: string;
  email: string;
  username: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
}

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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  requiresOtp?: boolean;
}

export interface SignupData {
  email: string;
  username: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
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

export interface PaymentCreateResponse {
  message: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderId: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: Record<string, string>) => void) => void;
    };
  }
}
