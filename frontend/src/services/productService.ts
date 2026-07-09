import { API } from './config';
import { createServiceClient } from './httpClient';
import type { Product } from '../types';

const client = createServiceClient(API.product);

export const productService = {
  getAll(category?: string) {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return client.get<{ products: Product[]; total: number }>(`/api/products${params}`);
  },

  getCategories() {
    return client.get<{ categories: string[] }>('/api/products/categories');
  },

  getById(id: string) {
    return client.get<{ product: Product }>(`/api/products/${id}`);
  },
};
