import express from 'express';
import cors from 'cors';
import { config } from './config';
import productRoutes from './routes/product.routes';
import { startGrpcServer } from './grpc/server';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

app.use('/api/products', productRoutes);

startGrpcServer();

app.listen(config.port, () => {
  console.log(`Product service REST running on http://localhost:${config.port}`);
});
