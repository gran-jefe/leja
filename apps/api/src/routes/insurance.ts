// RETIRED — not mounted in apps/api/src/index.ts. The tenant-initiated
// "express interest in insurance" flow was retired because it made the
// tenant the requester/payer on the posted job, contradicting the
// landlord-pays model (see property.requires_insurance /
// createInsuranceJob in db/queries/marketplace.ts, which is the real
// mechanism now). Left on disk only because this environment couldn't
// delete the file — safe to delete this file, db/queries/insurance.ts, and
// lib/schemas/insurance.ts entirely whenever convenient.
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireCapability } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { Capability } from '@beyond/shared';
import { insuranceInterestSchema } from '../lib/schemas';
import { createInsuranceInterest, findInsuranceInterestsByTenant } from '../db/queries/insurance';
import { findAgreementById } from '../db/queries/agreements';
import { createInsuranceJob } from '../db/queries/marketplace';

const router = Router();

router.post(
  '/interest',
  authenticateToken,
  requireCapability(Capability.TENANT),
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

      // Actually post the job to the bid marketplace — expressing interest
      // now genuinely puts this in front of licensed insurers, it doesn't
      // just sit in a lead list. Non-fatal if this fails: the interest
      // record still exists and can be manually followed up.
      let job = null;
      try {
        job = await createInsuranceJob(agreementId, req.user!.id);
      } catch (err) {
        console.error(`[MARKETPLACE] Failed to post insurance job for agreement ${agreementId}:`, err);
      }

      return res.status(201).json({
        success: true,
        data: { interest, job },
        message: job
          ? 'Insurance interest recorded and posted for insurer bids'
          : 'Insurance interest recorded',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/interest',
  authenticateToken,
  requireCapability(Capability.TENANT),
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
