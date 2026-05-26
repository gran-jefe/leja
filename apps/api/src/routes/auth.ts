import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimit } from '../middleware/rateLimit';
import { signToken } from '../lib/jwt';
import { registerSchema, loginSchema } from '../lib/schemas/auth.schemas';
import { createUser, findUserByEmail, findUserById } from '../db/queries/users';

const router = Router();

router.post(
  '/register',
  authRateLimit,
  validate(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password, name, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
      }

      // Hash password
      const passwordHash = await bcryptjs.hash(password, 12);

      // Create user
      const user = await createUser({
        email,
        passwordHash,
        name,
        phone,
        role,
      });

      // Sign token
      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
          },
          token,
        },
        message: 'User registered successfully',
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to register user',
      });
    }
  }
);

router.post(
  '/login',
  authRateLimit,
  validate(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Compare password
      const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Sign token
      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
          },
          token,
        },
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to login',
      });
    }
  }
);

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: {
        user,
      },
      message: 'Current user retrieved',
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
    });
  }
});

export default router;
