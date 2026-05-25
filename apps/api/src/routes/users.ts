import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@leja/shared';

const router = Router();

router.get('/profile', authenticateToken, (req: Request, res: Response) => {
  console.log('Get profile - placeholder');
  return res.json({
    success: true,
    data: {
      id: req.user?.id,
      email: req.user?.email,
      name: 'John Doe',
      phone: '+2348012345678',
      role: req.user?.role,
    },
    message: 'Profile retrieved',
  });
});

router.patch('/profile', authenticateToken, (req: Request, res: Response) => {
  const { name, phone } = req.body;
  console.log('Update profile - placeholder', { name, phone });

  return res.json({
    success: true,
    data: {
      id: req.user?.id,
      email: req.user?.email,
      name: name || 'John Doe',
      phone: phone || '+2348012345678',
    },
    message: 'Profile updated',
  });
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
