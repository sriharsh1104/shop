import express from 'express';
import cors from 'cors';
import { config } from './config';
import otpRoutes from './routes/otp.routes';
import { startKafkaConsumer } from './kafka/consumer';
import { connectDatabase } from './db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'email-service' });
});

app.use('/api/otp', otpRoutes);

async function main(): Promise<void> {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`Email service running on http://localhost:${config.port}`);
    startKafkaConsumer();
  });
}

main().catch((err) => {
  console.error('Failed to start email service:', err);
  process.exit(1);
});
