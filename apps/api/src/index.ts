import 'dotenv/config';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { config, validateConfig } from './config';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import propertiesRoutes from './routes/properties';
import agreementsRoutes from './routes/agreements';
import paymentsRoutes from './routes/payments';
import rentalHistoryRoutes from './routes/rentalHistory';
import contactRoutes from './routes/contact';

// Validate config before starting
validateConfig();

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (config.cors.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check endpoints (no auth required)
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Leja API',
    docs: '/api/v1',
    health: '/health',
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '0.1.0',
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/agreements', agreementsRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/rental-history', rentalHistoryRoutes);
app.use('/api/v1/contact', contactRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Leja API running on port ${config.port} (${config.env})`);
});
