import { API } from './config';
import { createServiceClient } from './httpClient';
import type { Order } from '../types';

const client = createServiceClient(API.order);

export const orderService = {
  buy(productId: string, quantity = 1) {
    return client.post<{ message: string; order: Order }>(
      '/api/orders',
      { productId, quantity },
      true
    );
  },

  getMyOrders() {
    return client.get<{ orders: Order[]; total: number }>('/api/orders/mine', true);
  },
};
