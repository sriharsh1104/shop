import { API } from './config';
import { createServiceClient } from './httpClient';
import type { AuthResponse, User, SignupData, LoginData } from '../types';

const client = createServiceClient(API.user);

export const userService = {
  signup(data: SignupData) {
    return client.post<AuthResponse>('/api/auth/signup', data);
  },

  login(data: LoginData) {
    return client.post<AuthResponse>('/api/auth/login', data);
  },

  verifyOtp(otp: string) {
    return client.post<{ message: string; user: User }>('/api/auth/verify-otp', { otp }, true);
  },

  resendOtp() {
    return client.post<{ message: string }>('/api/auth/resend-otp', undefined, true);
  },

  getMe() {
    return client.get<{ user: User }>('/api/auth/me', true);
  },
};
