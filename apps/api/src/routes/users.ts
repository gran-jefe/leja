import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { findUserById, updateUser } from '../db/queries/users';
import { updateProfileSchema } from '../lib/schemas';

const router = Router();

router.get('/profile', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({
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

router.patch('/profile', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const updated = await updateUser(req.user!.id, parsed.data);

    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id/rental-history',
  authenticateToken,
  (req: Request, res: Response) => {
    const { id } = req.params;
    console.log('Get rental history - placeholder', { userId: id });

    return res.json({
      success: true,
      data: [],
      message: 'Rental history retrieved',
    });
  }
);

export default router;
