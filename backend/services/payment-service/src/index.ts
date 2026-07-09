import express from 'express';
import cors from 'cors';
import { config } from './config';
import paymentRoutes from './routes/payment.routes';
import { paymentWebhook } from './controllers/payment.controller';
import { errorHandler } from './middleware';
import { connectDatabase } from './db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'payment-service' });
});

app.post('/api/payments/webhook', paymentWebhook);
app.use('/api/payments', paymentRoutes);

app.use(errorHandler);

async function main(): Promise<void> {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`Payment service running on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start payment service:', err);
  process.exit(1);
});
