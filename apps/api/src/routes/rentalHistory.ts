import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireCapability } from '../middleware/auth';
import { Capability, BEYOND_PRICING } from '@beyond/shared';
import { findRentalHistoryByTenant } from '../db/queries/rentalHistory';

const router = Router();

router.get(
  '/mine',
  authenticateToken,
  requireCapability(Capability.TENANT),
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
  requireCapability(Capability.TENANT),
  (req: Request, res: Response) => {
    console.log('Export rental history - placeholder', { userId: req.user?.id });

    return res.json({
      success: true,
      data: {
        // TODO: not yet wired to lib/payments — this endpoint predates the
        // eTranzact integration and still returns a placeholder rather than
        // an actual initializePayment() call.
        payment: null,
        amount: BEYOND_PRICING.RENTAL_HISTORY_EXPORT,
      },
      message: 'Rental history export initiated',
    });
  }
);

export default router;
