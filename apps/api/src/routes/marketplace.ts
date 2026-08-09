import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { UserRole } from '@beyond/shared';
import { providerApplySchema, submitBidSchema } from '../lib/schemas';
import {
  applyAsProvider,
  findProviderById,
  findProviderByUserAndCategory,
  verifyProvider,
  findOpenJobsForCategory,
  findJobById,
  upsertBid,
  findBidsByProvider,
} from '../db/queries/marketplace';

const router = Router();

// Providers apply from any authenticated account (a PROVIDER-role signup
// flow can be added later; for now any user can apply and is reviewed).
router.post(
  '/providers/apply',
  authenticateToken,
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = providerApplySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          errors: parsed.error.errors.map((e) => e.message),
        });
      }

      const existing = await findProviderByUserAndCategory(req.user!.id, parsed.data.category);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'You already have an application in this category',
        });
      }

      const provider = await applyAsProvider({
        userId: req.user!.id,
        category: parsed.data.category,
        licenseNumber: parsed.data.licenseNumber,
      });

      return res.status(201).json({
        success: true,
        data: provider,
        message: 'Provider application submitted — pending verification',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Admin-only license verification. There is no dedicated ADMIN role yet —
// gate on an explicit allowlist of admin emails via env until one exists,
// so this can't be called by an ordinary authenticated user.
const isAdmin = (email?: string) => {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  return !!email && admins.includes(email.toLowerCase());
};

router.post(
  '/providers/:id/verify',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isAdmin(req.user!.email)) {
        return res.status(403).json({ success: false, message: 'Forbidden: admin only' });
      }

      const provider = await findProviderById(req.params.id);
      if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider not found' });
      }

      const verified = await verifyProvider(req.params.id);

      return res.json({
        success: true,
        data: verified,
        message: 'Provider verified and activated',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/jobs/open',
  authenticateToken,
  requireRole(UserRole.PROVIDER),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.query as { category?: string };
      if (!category || !['LEGAL', 'INSURANCE'].includes(category)) {
        return res.status(400).json({ success: false, message: 'category query param is required' });
      }

      const provider = await findProviderByUserAndCategory(req.user!.id, category);
      if (!provider || provider.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'You are not an active, verified provider in this category',
        });
      }

      const jobs = await findOpenJobsForCategory(category, provider.subscription_tier);

      return res.json({
        success: true,
        data: jobs,
        message: 'Open jobs retrieved',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/jobs/:id/bids',
  authenticateToken,
  requireRole(UserRole.PROVIDER),
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = submitBidSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          errors: parsed.error.errors.map((e) => e.message),
        });
      }

      const job = await findJobById(req.params.id);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
      if (job.status !== 'OPEN' || new Date(job.bid_window_closes_at) < new Date()) {
        return res.status(400).json({ success: false, message: 'This job is no longer accepting bids' });
      }

      const provider = await findProviderByUserAndCategory(req.user!.id, job.category);
      if (!provider || provider.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'You are not an active, verified provider in this job\'s category',
        });
      }

      const { price } = parsed.data;
      if (job.min_price != null && price < job.min_price) {
        return res.status(400).json({
          success: false,
          message: `Bid must be at least ₦${job.min_price}`,
        });
      }
      if (job.max_price != null && price > job.max_price) {
        return res.status(400).json({
          success: false,
          message: `Bid must not exceed ₦${job.max_price}`,
        });
      }

      const bid = await upsertBid({
        jobId: job.id,
        providerId: provider.id,
        price,
        turnaroundHours: parsed.data.turnaroundHours,
      });

      return res.status(201).json({
        success: true,
        data: bid,
        message: 'Bid submitted',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/providers/me/bids',
  authenticateToken,
  requireRole(UserRole.PROVIDER),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider =
        (await findProviderByUserAndCategory(req.user!.id, 'LEGAL')) ||
        (await findProviderByUserAndCategory(req.user!.id, 'INSURANCE'));

      if (!provider) {
        return res.json({ success: true, data: [], message: 'No provider profile yet' });
      }

      const bids = await findBidsByProvider(provider.id);

      return res.json({
        success: true,
        data: bids,
        message: 'Bid history retrieved',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
