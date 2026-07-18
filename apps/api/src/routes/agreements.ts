import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { initializePayment, generateReference } from '../lib/flutterwave';
import { createPendingPayment } from '../db/queries/payments';
import { UserRole, PaymentType, LEJA_PRICING } from '@leja/shared';
import { config } from '../config';
import {
  createAgreementDraft,
  wantsLawyerReview,
  findAgreementsForUser,
  findAgreementById,
  getAgreementWithDetails,
  updateAgreementStatus,
  updateAgreementPendingPayment,
  updateAgreementLawyerReview,
} from '../db/queries/agreements';

const router = Router();

// Landlord creates a free draft agreement. No payment at this step — the
// tenant pays the move-in fee later, when they accept.
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.LANDLORD),
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { propertyId, tenantEmail, startDate, endDate, monthlyRent, annualRent, wantsLawyerReview: wantsReviewFlag } =
        req.body;

      const agreement = await createAgreementDraft({
        landlordId: req.user!.id,
        propertyId,
        tenantEmail,
        startDate,
        endDate,
        monthlyRent: Number(monthlyRent),
        annualRent: Number(annualRent),
        wantsLawyerReview: !!wantsReviewFlag,
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
    const role = req.user!.role === UserRole.LANDLORD ? 'LANDLORD' : 'TENANT';
    const status = req.query.status as string | undefined;
    const agreements = await findAgreementsForUser(req.user!.id, role, status);

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
      const moveInFee = LEJA_PRICING.TENANT_MOVE_IN_FEE;
      const lawyerReviewFee = includesLawyerReview ? LEJA_PRICING.TENANT_LAWYER_REVIEW : 0;
      const total = moveInFee + lawyerReviewFee;
      const totalSavings = includesLawyerReview
        ? LEJA_PRICING.TYPICAL_AGENT_FEE + LEJA_PRICING.TYPICAL_LEGAL_FEE - moveInFee - lawyerReviewFee
        : LEJA_PRICING.TYPICAL_AGENT_FEE + LEJA_PRICING.TYPICAL_LEGAL_FEE - moveInFee;

      return res.json({
        success: true,
        data: {
          agreement,
          pricing: {
            moveInFee,
            lawyerReviewFee,
            total,
            savings: {
              vsAgentFee: LEJA_PRICING.TYPICAL_AGENT_FEE,
              vsLegalFee: LEJA_PRICING.TYPICAL_LEGAL_FEE,
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

// Tenant accepts the agreement and initiates the move-in fee payment.
router.post(
  '/:id/accept',
  authenticateToken,
  requireRole(UserRole.TENANT),
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
          message: 'This agreement has already been accepted or paid for',
        });
      }

      const includesLawyerReview = wantsLawyerReview(agreement);
      const moveInFee = LEJA_PRICING.TENANT_MOVE_IN_FEE;
      const lawyerReviewFee = includesLawyerReview ? LEJA_PRICING.TENANT_LAWYER_REVIEW : 0;
      const total = moveInFee + lawyerReviewFee;
      const reference = generateReference('LEJA_TENANT');

      const { paymentLink } = await initializePayment({
        email: req.user!.email,
        amount: total,
        reference,
        name: req.user!.name || req.user!.email,
        redirectUrl: `${config.frontendUrl}/agreement/${id}?payment=success`,
        meta: {
          agreementId: id,
          paymentType: PaymentType.TENANT_MOVE_IN_FEE,
          tenantId: req.user!.id,
          wantsLawyerReview: includesLawyerReview,
        },
      });

      await createPendingPayment({
        userId: req.user!.id,
        agreementId: id,
        type: PaymentType.TENANT_MOVE_IN_FEE,
        amount: total,
        reference,
        metadata: { wantsLawyerReview: includesLawyerReview },
      });

      await updateAgreementPendingPayment(id, reference);

      return res.json({
        success: true,
        data: {
          paymentLink,
          reference,
          total,
          breakdown: { moveInFee, lawyerReviewFee, total },
        },
        message: 'Payment initiated',
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
  requireRole(UserRole.TENANT),
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
