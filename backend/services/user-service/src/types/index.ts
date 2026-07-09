export interface User {
  id: string;
  email: string;
  username: string;
  phone: string;
  passwordHash: string;
  isVerified: boolean;
  tokenVersion: number;
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

export interface ProfileUpdate {
  username?: string;
  phone?: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: Omit<User, 'passwordHash'>;
  requiresOtp?: boolean;
}

export interface JwtPayload {
  userId: string;
  email: string;
  tokenVersion: number;
}
