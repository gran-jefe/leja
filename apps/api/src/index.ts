import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import propertiesRoutes from './routes/properties';
import agreementsRoutes from './routes/agreements';
import paymentsRoutes from './routes/payments';
import rentalHistoryRoutes from './routes/rentalHistory';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/agreements', agreementsRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/rental-history', rentalHistoryRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Leja API running on port ${PORT}`);
});
