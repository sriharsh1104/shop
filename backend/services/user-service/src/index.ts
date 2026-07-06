import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`User service running on http://localhost:${config.port}`);
});
