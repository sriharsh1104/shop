import { Response, NextFunction } from 'express';
import { config } from '../config';
import { AuthRequest } from '../middleware';

export function internalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const secret = req.headers['x-internal-secret'];
  if (secret !== config.internalSecret) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  next();
}
