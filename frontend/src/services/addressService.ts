import { API } from './config';
import { createServiceClient } from './httpClient';
import type { Address, AddressInput } from '../types';

const client = createServiceClient(API.user);

export const addressService = {
  list() {
    return client.get<{ addresses: Address[] }>('/api/users/addresses', true);
  },

  create(data: AddressInput) {
    return client.post<{ message: string; address: Address }>('/api/users/addresses', data, true);
  },

  update(id: string, data: AddressInput) {
    return client.put<{ message: string; address: Address }>(`/api/users/addresses/${id}`, data, true);
  },

  delete(id: string) {
    return client.delete<{ message: string }>(`/api/users/addresses/${id}`, true);
  },

  setDefault(id: string) {
    return client.patch<{ message: string; address: Address }>(
      `/api/users/addresses/${id}/default`,
      undefined,
      true
    );
  },
};
