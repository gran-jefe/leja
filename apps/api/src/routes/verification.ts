import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { verifyTier1Schema, verifyTier2Schema } from '../lib/schemas';
import { verifyTier1, verifyTier2 } from '../lib/identity';
import {
  createVerificationAttempt,
  bumpUserVerificationTier,
  getUserVerificationStatus,
} from '../db/queries/verifications';

// Phase 2 groundwork — single, category-agnostic in-app verification flow.
// No real KYC provider is wired up yet (see lib/identity/stub.ts); this
// exercises the full route/DB shape so a real provider is a drop-in swap
// later, not a route rewrite.
const router = Router();

router.get('/status', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await getUserVerificationStatus(req.user!.id);
    return res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

// Tier 1 — phone + BVN/NIN. Fast, unlocks low-stakes activity.
router.post(
  '/tier1',
  authenticateToken,
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = verifyTier1Schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error.errors.map((e) => e.message) });
      }

      const result = await verifyTier1({ userId: req.user!.id, ...parsed.data });

      await createVerificationAttempt({
        userId: req.user!.id,
        tier: 1,
        method: 'PHONE_BVN_NIN',
        status: result.status,
        providerReference: result.providerReference,
      });

      if (result.status === 'APPROVED') {
        await bumpUserVerificationTier(req.user!.id, 1);
      }

      return res.json({
        success: result.status === 'APPROVED',
        data: result,
        message:
          result.status === 'APPROVED'
            ? 'Tier 1 verification approved'
            : result.status === 'PENDING'
              ? 'Tier 1 verification pending review'
              : 'Tier 1 verification rejected',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Tier 2 — liveness + document. Required before escrow-backed activity.
// Callers are expected to have already uploaded the liveness selfie and
// document image (no upload pipeline exists in this route — see the same
// gap flagged for property images/title documents) and pass references.
router.post(
  '/tier2',
  authenticateToken,
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = verifyTier2Schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error.errors.map((e) => e.message) });
      }

      const result = await verifyTier2({ userId: req.user!.id, ...parsed.data });

      await createVerificationAttempt({
        userId: req.user!.id,
        tier: 2,
        method: `LIVENESS_${parsed.data.documentType}`,
        status: result.status,
        providerReference: result.providerReference,
        metadata: { documentType: parsed.data.documentType },
      });

      if (result.status === 'APPROVED') {
        await bumpUserVerificationTier(req.user!.id, 2);
      }

      return res.json({
        success: result.status === 'APPROVED',
        data: result,
        message:
          result.status === 'APPROVED'
            ? 'Tier 2 verification approved'
            : result.status === 'PENDING'
              ? 'Tier 2 verification pending review'
              : 'Tier 2 verification rejected',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
