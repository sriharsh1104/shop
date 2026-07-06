import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils';
import { userStore } from '../services/user.service';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function validateSignup(req: Request, res: Response, next: NextFunction): void {
  const { email, username, phone, password } = req.body;

  if (!email || !username || !phone || !password) {
    res.status(400).json({ message: 'Email, username, phone, and password are required' });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters' });
    return;
  }

  if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
    res.status(400).json({ message: 'Invalid phone number' });
    return;
  }

  next();
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
}
