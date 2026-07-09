import { Response } from 'express';
import { verifyToken } from '../utils';
import { userStore } from '../services/user.service';
import { addressStore } from '../services/address.service';
import { AuthRequest } from '../middleware';

export async function validateToken(req: AuthRequest, res: Response): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ valid: false, message: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await userStore.findById(payload.userId);
    if (!user || user.tokenVersion !== (payload.tokenVersion ?? 0)) {
      res.status(401).json({ valid: false, message: 'Invalid or expired token' });
      return;
    }
    res.json({ valid: true, userId: user.id, email: user.email });
  } catch {
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
}

export async function getAddressInternal(req: AuthRequest, res: Response): Promise<void> {
  const { userId, addressId } = req.params;
  const address = await addressStore.findByIdForUser(addressId, userId);
  if (!address) {
    res.status(404).json({ message: 'Address not found' });
    return;
  }
  res.json({ address });
}
