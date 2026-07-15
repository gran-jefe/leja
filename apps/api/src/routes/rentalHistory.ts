import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@leja/shared';
import { findRentalHistoryByTenant } from '../db/queries/rentalHistory';

const router = Router();

router.get(
  '/mine',
  authenticateToken,
  requireRole(UserRole.TENANT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await findRentalHistoryByTenant(req.user!.id);

      return res.json({
        success: true,
        data: history,
        message: 'Rental history retrieved',
      });
    } catch (error) {
      next(error);
    }
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
        paymentLink: 'https://flutterwave.com/pay/placeholder',
        amount: 5000,
      },
      message: 'Rental history export initiated',
    });
  }
);

export default router;
