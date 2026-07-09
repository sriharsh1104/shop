import { API } from './config';
import { createServiceClient } from './httpClient';
import type { PaymentCreateResponse } from '../types';

const client = createServiceClient(API.payment);

export const paymentService = {
  create(orderId: string) {
    return client.post<PaymentCreateResponse>('/api/payments/create', { orderId }, true);
  },

  verify(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return client.post<{ message: string }>('/api/payments/verify', data, true);
  },
};
