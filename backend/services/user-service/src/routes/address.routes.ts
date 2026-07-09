import { Router } from 'express';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddressById,
} from '../controllers/address.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listAddresses);
router.post('/', createAddress);
router.get('/:id', getAddressById);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;
