import { Router } from 'express';
import { validateToken, getAddressInternal } from '../controllers/internal.controller';

const router = Router();

router.get('/validate-token', validateToken);
router.get('/users/:userId/addresses/:addressId', getAddressInternal);

export default router;
