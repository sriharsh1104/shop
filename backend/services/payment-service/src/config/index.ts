import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27018/shop-payments',
  orderServiceUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  internalSecret: process.env.INTERNAL_SECRET || 'dev-internal-secret',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
};
