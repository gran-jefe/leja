import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireCapability } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { initializePayment, generateReference } from '../lib/payments';
import { createPendingPayment } from '../db/queries/payments';
import { Capability, PaymentType, BEYOND_PRICING } from '@beyond/shared';
import { config } from '../config';
import { createAgreementDraftSchema } from '../lib/schemas';
import { generateAndSaveAgreementPDF } from '../lib/pdf';
import { createInsuranceJob } from '../db/queries/marketplace';
import {
  createAgreementDraft,
  wantsLawyerReview,
  findAgreementsForUser,
  findAgreementById,
  getAgreementWithDetails,
  updateAgreementStatus,
  updateAgreementLawyerReview,
} from '../db/queries/agreements';
import { grantCapability } from '../db/queries/capabilities';

// Don't await — let it run in the background so the accept endpoint responds
// fast. Mirrors the webhook's own PDF trigger in routes/payments.ts.
const triggerAgreementPDF = (agreementId: string) => {
  generateAndSaveAgreementPDF(agreementId)
    .then((pdfUrl) => {
      console.log(`[PDF] Agreement ${agreementId} PDF generated: ${pdfUrl}`);
    })
    .catch((err) => {
      console.error(`[PDF] Failed to generate PDF for agreement ${agreementId}:`, err.message);
    });
};

const router = Router();

// Landlord creates a free draft agreement. No payment at this step, and none
// when the tenant accepts either — accepting is always free and goes ACTIVE
// immediately. The only tenant-side payment anywhere in this flow is the
// *optional* lawyer-review add-on (see /accept below), which never blocks
// or gates acceptance.
router.post(
  '/',
  authenticateToken,
  requireCapability(Capability.LANDLORD),
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createAgreementDraftSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          errors: parsed.error.errors.map((e) => e.message),
        });
      }

      const {
        propertyId,
        tenantEmail,
        startDate,
        endDate,
        monthlyRent,
        annualRent,
        wantsLawyerReview: wantsReviewFlag,
        legalizationFeeRate,
      } = parsed.data;

      const agreement = await createAgreementDraft({
        landlordId: req.user!.id,
        propertyId,
        tenantEmail,
        startDate,
        endDate,
        monthlyRent,
        annualRent,
        wantsLawyerReview: !!wantsReviewFlag,
        legalizationFeeRate,
      });

      return res.status(201).json({
        success: true,
        data: { agreement },
        message: 'Agreement draft created',
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
);

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Returns both sides — someone letting one flat while renting another
    // sees all their agreements, not just the half matching a single role.
    const status = req.query.status as string | undefined;
    const agreements = await findAgreementsForUser(req.user!.id, status);

    return res.json({
      success: true,
      data: agreements,
      message: 'Agreements retrieved',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const agreement = await findAgreementById(id);

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
      });
    }

    // Agreement visibility: only the two parties involved may view it
    if (agreement.landlord_id !== req.user!.id && agreement.tenant_id !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this agreement',
      });
    }

    return res.json({
      success: true,
      data: agreement,
      message: 'Agreement retrieved',
    });
  } catch (error) {
    next(error);
  }
});

// Pre-payment review screen — accessible to both parties on the agreement.
router.get(
  '/:id/preview',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const agreement = await getAgreementWithDetails(id);

      if (!agreement) {
        return res.status(404).json({ success: false, message: 'Agreement not found' });
      }

      if (agreement.landlord_id !== req.user!.id && agreement.tenant_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this agreement',
        });
      }

      const includesLawyerReview = wantsLawyerReview(agreement);
      const lawyerReviewFee = includesLawyerReview ? BEYOND_PRICING.LAWYER_REVIEW_ADDON : 0;
      const totalSavings = BEYOND_PRICING.TYPICAL_AGENT_FEE + BEYOND_PRICING.TYPICAL_LEGAL_FEE;

      return res.json({
        success: true,
        data: {
          agreement,
          pricing: {
            baseFee: BEYOND_PRICING.BASE_LEGALIZATION_FEE,
            lawyerReviewFee,
            total: lawyerReviewFee,
            savings: {
              vsAgentFee: BEYOND_PRICING.TYPICAL_AGENT_FEE,
              vsLegalFee: BEYOND_PRICING.TYPICAL_LEGAL_FEE,
              totalSavings,
            },
          },
        },
        message: 'Agreement preview retrieved',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Tenant accepts the agreement. Connecting and the standardized agreement
// are free — the agreement goes ACTIVE immediately, no payment required.
// The only thing that can cost the tenant anything is an optional lawyer
// review add-on, which — if requested — is posted to the bid marketplace
// and paid separately (at whatever a provider's winning bid is, capped at
// LAWYER_REVIEW_ADDON), without blocking the agreement from being active.
router.post(
  '/:id/accept',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const agreement = await findAgreementById(id);

      if (!agreement) {
        return res.status(404).json({ success: false, message: 'Agreement not found' });
      }

      if (agreement.tenant_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'This agreement is not addressed to you',
        });
      }

      if (agreement.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          message: 'This agreement has already been accepted',
        });
      }

      const includesLawyerReview = wantsLawyerReview(agreement);

      const activated = await updateAgreementStatus(id, 'ACTIVE');
      triggerAgreementPDF(id);

      // Accepting an agreement is what makes you a tenant. Authorisation for
      // this route is the tenant_id check above, not a capability — gating it
      // on TENANT would make a first-time tenant unable to ever accept.
      try {
        await grantCapability(req.user!.id, Capability.TENANT, 'accepted_agreement');
      } catch (err) {
        console.error('[CAPABILITY] Failed to grant TENANT to', req.user!.id, err);
      }

      // Landlord-required insurance is a condition of tenancy the landlord
      // set on the property (not a tenant opt-in) — post the job the
      // moment the agreement goes active, with the landlord as requester
      // since this product protects their asset and they're the payer.
      // Non-fatal: never let a marketplace hiccup block acceptance.
      if (agreement.property?.requires_insurance) {
        try {
          await createInsuranceJob(id, agreement.landlord_id);
        } catch (err) {
          console.error(`[MARKETPLACE] Failed to post required insurance job for agreement ${id}:`, err);
        }
      }

      if (!includesLawyerReview) {
        return res.json({
          success: true,
          data: { agreement: activated, paymentLink: null, total: 0 },
          message: 'Agreement accepted — free, no payment required',
        });
      }

      const lawyerReviewFee = BEYOND_PRICING.LAWYER_REVIEW_ADDON;
      const reference = generateReference('BEYOND_LAWYER_REVIEW');

      const payment = await initializePayment({
        email: req.user!.email,
        amount: lawyerReviewFee,
        reference,
        name: req.user!.name || req.user!.email,
        redirectUrl: `${config.frontendUrl}/agreement/${id}?payment=success`,
        meta: {
          agreementId: id,
          paymentType: PaymentType.TENANT_LAWYER_REVIEW,
          tenantId: req.user!.id,
        },
      });

      await createPendingPayment({
        userId: req.user!.id,
        agreementId: id,
        type: PaymentType.TENANT_LAWYER_REVIEW,
        amount: lawyerReviewFee,
        reference,
        metadata: {},
      });

      return res.json({
        success: true,
        data: {
          agreement: activated,
          // `payment` carries whichever shape the active provider returns —
          // a redirect link or (with eTranzact today) an account_transfer
          // instruction. See @beyond/shared PaymentInitiationResult.
          payment,
          reference,
          total: lawyerReviewFee,
          breakdown: { lawyerReviewFee, total: lawyerReviewFee },
        },
        message: 'Agreement active. Optional lawyer review payment initiated.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Tenant declines to proceed (either straight from DRAFT, or backing out of
// an initiated-but-unpaid PENDING_PAYMENT) — resets the agreement to DRAFT
// so the landlord can follow up before the tenant reconsiders.
router.post(
  '/:id/decline',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const agreement = await findAgreementById(id);

      if (!agreement) {
        return res.status(404).json({ success: false, message: 'Agreement not found' });
      }

      if (agreement.tenant_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'This agreement is not addressed to you',
        });
      }

      if (agreement.status === 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'This agreement is already active and can no longer be declined',
        });
      }

      const updated = await updateAgreementStatus(id, 'DRAFT');

      return res.json({
        success: true,
        data: updated,
        message: 'Agreement declined',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/request-lawyer-review',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const agreement = await updateAgreementLawyerReview(id, 'PENDING');

      return res.json({
        success: true,
        data: agreement,
        message: 'Lawyer review requested',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
