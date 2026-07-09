export type PaymentStatus = 'created' | 'paid' | 'failed';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  id: string;
  userId: string;
  totalPrice: number;
  status: string;
}
