export interface User {
  id: string;
  email: string;
  username: string;
  phone: string;
  passwordHash: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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
}
