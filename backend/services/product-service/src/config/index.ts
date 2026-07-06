import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  grpcPort: parseInt(process.env.GRPC_PORT || '50051', 10),
};
