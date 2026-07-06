import { Router } from 'express';
import { verifyOtp } from '../controllers/otp.controller';

const router = Router();

// OTP send is handled via Kafka (otp.requested topic), not HTTP.
router.post('/verify', verifyOtp);

export default router;
