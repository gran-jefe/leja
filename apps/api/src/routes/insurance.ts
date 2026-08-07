import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { UserRole } from '@beyond/shared';
import { insuranceInterestSchema } from '../lib/schemas';
import { createInsuranceInterest, findInsuranceInterestsByTenant } from '../db/queries/insurance';
import { findAgreementById } from '../db/queries/agreements';

const router = Router();

router.post(
  '/interest',
  authenticateToken,
  requireRole(UserRole.TENANT),
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = insuranceInterestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          errors: parsed.error.errors.map((e) => e.message),
        });
      }

      const { agreementId, productType } = parsed.data;

      const agreement = await findAgreementById(agreementId);
      if (!agreement) {
        return res.status(404).json({ success: false, message: 'Agreement not found' });
      }
      if (agreement.tenant_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'This agreement is not addressed to you',
        });
      }

      const interest = await createInsuranceInterest({
        agreementId,
        tenantId: req.user!.id,
        productType,
      });

      return res.status(201).json({
        success: true,
        data: interest,
        message: 'Insurance interest recorded',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/interest',
  authenticateToken,
  requireRole(UserRole.TENANT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const interests = await findInsuranceInterestsByTenant(req.user!.id);

      return res.json({
        success: true,
        data: interests,
        message: 'Insurance interests retrieved',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
