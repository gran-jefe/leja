import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimit } from '../middleware/rateLimit';
import { signToken } from '../lib/jwt';
import { UserRole } from '@leja/shared';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['LANDLORD', 'TENANT']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post(
  '/register',
  authRateLimit,
  validate(registerSchema),
  async (req: Request, res: Response) => {
    const { email, password, name, phone, role } = req.body;

    console.log('Register endpoint - placeholder', {
      email,
      name,
      phone,
      role,
    });

    const token = signToken({
      id: 'user-id-placeholder',
      email,
      role: role as UserRole,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: 'user-id-placeholder',
        email,
        name,
        phone,
        role,
        token,
      },
      message: 'User registered successfully',
    });
  }
);

router.post(
  '/login',
  authRateLimit,
  validate(loginSchema),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    console.log('Login endpoint - placeholder', { email });

    const token = signToken({
      id: 'user-id-placeholder',
      email,
      role: 'TENANT' as UserRole,
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: 'user-id-placeholder',
          email,
          name: 'John Doe',
          role: 'TENANT',
        },
        token,
      },
      message: 'Login successful',
    });
  }
);

router.get('/me', authenticateToken, (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: req.user,
    message: 'Current user retrieved',
  });
});

export default router;
