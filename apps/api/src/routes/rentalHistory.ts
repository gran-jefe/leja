import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@leja/shared';

const router = Router();

router.get(
  '/mine',
  authenticateToken,
  requireRole(UserRole.TENANT),
  (req: Request, res: Response) => {
    console.log('Get own rental history - placeholder', { userId: req.user?.id });

    return res.json({
      success: true,
      data: [],
      message: 'Rental history retrieved',
    });
  }
);

router.get(
  '/export',
  authenticateToken,
  requireRole(UserRole.TENANT),
  (req: Request, res: Response) => {
    console.log('Export rental history - placeholder', { userId: req.user?.id });

    return res.json({
      success: true,
      data: {
        paymentLink: 'https://paystack.co/pay/placeholder',
        amount: 500000,
      },
      message: 'Rental history export initiated',
    });
  }
);

export default router;
