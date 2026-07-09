import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3004', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  productGrpcUrl: process.env.PRODUCT_GRPC_URL || 'localhost:50051',
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27018/shop-orders',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  internalSecret: process.env.INTERNAL_SECRET || 'dev-internal-secret',
};
