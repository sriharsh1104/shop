import { Router } from 'express';
import {
  signup,
  login,
  verifyOtpHandler,
  resendOtp,
  getMe,
} from '../controllers/auth.controller';
import { authMiddleware, validateSignup } from '../middleware';

const router = Router();

router.post('/signup', validateSignup, signup);
router.post('/login', login);
router.post('/verify-otp', authMiddleware, verifyOtpHandler);
router.post('/resend-otp', authMiddleware, resendOtp);
router.get('/me', authMiddleware, getMe);

export default router;
