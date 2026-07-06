import express from 'express';
import cors from 'cors';
import { config } from './config';
import orderRoutes from './routes/order.routes';
import { errorHandler } from './middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

app.use('/api/orders', orderRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Order service running on http://localhost:${config.port}`);
});
