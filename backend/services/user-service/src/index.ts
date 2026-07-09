import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import addressRoutes from './routes/address.routes';
import internalRoutes from './routes/internal.routes';
import { errorHandler } from './middleware';
import { connectDatabase } from './db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users/addresses', addressRoutes);
app.use('/internal', internalRoutes);
app.use(errorHandler);

async function main(): Promise<void> {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`User service running on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start user service:', err);
  process.exit(1);
});
