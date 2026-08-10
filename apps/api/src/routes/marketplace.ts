import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { UserRole } from '@beyond/shared';
import { providerApplySchema, internalProviderSchema, submitBidSchema } from '../lib/schemas';
import {
  applyAsProvider,
  createInternalProvider,
  findProviderById,
  findProviderByUserAndCategory,
  findPendingProviders,
  verifyProvider,
  findOpenJobsForCategory,
  findJobById,
  upsertBid,
  findBidsByProvider,
  findJobByAgreement,
  effectiveSubscriptionTier,
} from '../db/queries/marketplace';
import { findAgreementById } from '../db/queries/agreements';
import { findUserByEmail } from '../db/queries/users';
import { createPendingPayment } from '../db/queries/payments';
import { initializePayment, generateReference } from '../lib/payments';
import { PaymentType, BEYOND_PRICING } from '@beyond/shared';
import { config } from '../config';
import { isAdmin } from '../lib/admin';

const router = Router();

// Public application flow — EXTERNAL providers only (currently INSURANCE;
// more categories as the marketplace expands). LEGAL is staffed in-house,
// salaried — there's no open application for it. See /providers/internal.
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

      if (parsed.data.category === 'LEGAL') {
        return res.status(400).json({
          success: false,
          message:
            'Legal review is delivered by our in-house team, not an open bid — we hire lawyers directly rather than accepting applications here. Reach out via the careers page if interested.',
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

// Admin-only onboarding for BeyondAgency's own salaried staff (e.g. a
// newly-hired in-house lawyer). Bypasses the public apply/verify flow —
// goes straight to an ACTIVE, INTERNAL provider record.
router.post(
  '/providers/internal',
  authenticateToken,
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isAdmin(req.user!.email)) {
        return res.status(403).json({ success: false, message: 'Forbidden: admin only' });
      }

      const parsed = internalProviderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          errors: parsed.error.errors.map((e) => e.message),
        });
      }

      const user = await findUserByEmail(parsed.data.email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No BeyondAgency account with that email yet — they need to sign up first',
        });
      }

      const provider = await createInternalProvider({
        userId: user.id,
        category: parsed.data.category,
        licenseNumber: parsed.data.licenseNumber,
      });

      return res.status(201).json({
        success: true,
        data: provider,
        message: 'Internal provider onboarded and active',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Lets the web admin UI check "am I even allowed to be here" once, instead
// of every admin action failing individually with a 403 the UI has to
// interpret. Returns isAdmin: false rather than a 403 for a non-admin —
// this endpoint itself is safe to call from anyone, it reveals nothing.
router.get('/admin/whoami', authenticateToken, async (req: Request, res: Response) => {
  return res.json({ success: true, data: { isAdmin: isAdmin(req.user!.email) } });
});

// Admin-only queue of external provider applications awaiting verification.
router.get(
  '/providers/pending',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isAdmin(req.user!.email)) {
        return res.status(403).json({ success: false, message: 'Forbidden: admin only' });
      }

      const providers = await findPendingProviders();

      return res.json({
        success: true,
        data: providers,
        message: 'Pending providers retrieved',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Admin-only license verification — for EXTERNAL provider applications.
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

      const jobs = await findOpenJobsForCategory(category, effectiveSubscriptionTier(provider));

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
  '/providers/me',
  authenticateToken,
  requireRole(UserRole.PROVIDER),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider =
        (await findProviderByUserAndCategory(req.user!.id, 'LEGAL')) ||
        (await findProviderByUserAndCategory(req.user!.id, 'INSURANCE'));

      if (!provider) {
        return res.json({ success: true, data: null, message: 'No provider profile yet' });
      }

      return res.json({
        success: true,
        data: { ...provider, effective_subscription_tier: effectiveSubscriptionTier(provider) },
        message: 'Provider profile retrieved',
      });
    } catch (error) {
      next(error);
    }
  }
);

// External providers pay for 30 days of PRIORITY-tier bid-pool access
// (immediate job visibility instead of the STANDARD visibility delay).
// Actual upgrade happens on payment webhook confirmation, not here.
router.post(
  '/providers/subscribe',
  authenticateToken,
  requireRole(UserRole.PROVIDER),
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider =
        (await findProviderByUserAndCategory(req.user!.id, 'LEGAL')) ||
        (await findProviderByUserAndCategory(req.user!.id, 'INSURANCE'));

      if (!provider) {
        return res.status(404).json({ success: false, message: 'No provider profile found' });
      }
      if (provider.employment_type === 'INTERNAL') {
        return res.status(400).json({
          success: false,
          message: 'Priority subscriptions are for external bidding providers only',
        });
      }

      const amount = BEYOND_PRICING.PROVIDER_PRIORITY_SUBSCRIPTION;
      const reference = generateReference('BEYOND_PROVIDER_SUB');

      const payment = await initializePayment({
        email: req.user!.email,
        amount,
        reference,
        name: req.user!.name || req.user!.email,
        redirectUrl: `${config.frontendUrl}/provider/dashboard?subscription=success`,
        meta: {
          providerId: provider.id,
          paymentType: PaymentType.PROVIDER_SUBSCRIPTION,
        },
      });

      await createPendingPayment({
        userId: req.user!.id,
        type: PaymentType.PROVIDER_SUBSCRIPTION,
        amount,
        reference,
        metadata: { providerId: provider.id },
      });

      return res.json({
        success: true,
        data: { payment, reference, amount },
        message: 'Subscription payment initiated',
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

// Lets the tenant/landlord on an agreement check whether a job (legal
// review or insurance) has been matched with a provider yet.
router.get(
  '/jobs/by-agreement/:agreementId',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = (req.query.category as string) || 'LEGAL';
      if (!['LEGAL', 'INSURANCE'].includes(category)) {
        return res.status(400).json({ success: false, message: 'category must be LEGAL or INSURANCE' });
      }

      const agreement = await findAgreementById(req.params.agreementId);
      if (!agreement) {
        return res.status(404).json({ success: false, message: 'Agreement not found' });
      }
      if (![agreement.landlord_id, agreement.tenant_id].includes(req.user!.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const job = await findJobByAgreement(req.params.agreementId, category);

      return res.json({
        success: true,
        data: job,
        message: job ? 'Job status retrieved' : 'No job yet',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
