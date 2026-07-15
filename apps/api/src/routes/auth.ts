import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { UserRole } from '@leja/shared';
import { createUser, findUserByEmail, findUserById } from '../db/queries/users';
import { signToken } from '../lib/jwt';
import { registerSchema, loginSchema } from '../lib/schemas';
import { authenticateToken } from '../middleware/auth';
import { authRateLimit } from '../middleware/rateLimit';

const router = Router();

router.use(authRateLimit);

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const { password, name, phone, role } = parsed.data;
    const email = parsed.data.email.toLowerCase().trim();

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser({ email, passwordHash, name, phone, role: role as UserRole });

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: (user as any).is_verified,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const { password } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: (user as any).is_verified,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
