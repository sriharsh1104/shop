import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const response = await fetch(`${config.userServiceUrl}/internal/validate-token`, {
      headers: { Authorization: header },
    });
    if (!response.ok) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
    const data = (await response.json()) as { userId: string; email: string };
    req.userId = data.userId;
    req.userEmail = data.email;
    next();
  } catch {
    res.status(401).json({ message: 'Authentication failed' });
  }
}

export function errorHandler(err: Error, _req: AuthRequest, res: Response, _next: NextFunction): void {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
}
