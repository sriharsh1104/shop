import { API } from './config';
import { createServiceClient } from './httpClient';
import type { Order } from '../types';

const client = createServiceClient(API.order);

export const orderService = {
  createOrder(productId: string, quantity: number, addressId: string) {
    return client.post<{ message: string; order: Order; amount: number }>(
      '/api/orders',
      { productId, quantity, addressId },
      true
    );
  },

  getMyOrders() {
    return client.get<{ orders: Order[]; total: number }>('/api/orders/mine', true);
  },

  getOrder(id: string) {
    return client.get<{ order: Order }>(`/api/orders/${id}`, true);
  },

  cancelOrder(id: string) {
    return client.post<{ message: string; order: Order }>(`/api/orders/${id}/cancel`, undefined, true);
  },
};
