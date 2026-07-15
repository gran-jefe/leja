import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { initializePayment, generateReference } from '../lib/flutterwave';

const router = Router();

router.post(
  '/',
  authenticateToken,
  agreementRateLimit,
  async (req: Request, res: Response) => {
    try {
      const {
        propertyId,
        tenantId,
        startDate,
        endDate,
        monthlyRent,
        annualRent,
        withLawyerReview,
      } = req.body;

      console.log('Create agreement - placeholder', {
        propertyId,
        tenantId,
        startDate,
        endDate,
      });

      const agreementId = 'agreement-id-placeholder';
      const amount = withLawyerReview ? 12000 : 3500;

      const { paymentLink } = await initializePayment({
        email: req.user!.email,
        amount,
        reference: generateReference('AGR'),
        name: req.user!.email,
        redirectUrl: `https://leja.ng/agreement/${agreementId}/callback`,
        meta: { propertyId, tenantId, agreementId },
      });

      return res.status(201).json({
        success: true,
        data: {
          id: agreementId,
          propertyId,
          landlordId: req.user?.id,
          tenantId,
          startDate,
          endDate,
          monthlyRent,
          annualRent,
          status: 'DRAFT',
          lawyerReviewStatus: 'NOT_REQUESTED',
          paymentLink,
        },
        message: 'Agreement created',
      });
    } catch (error) {
      console.error('Create agreement error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create agreement',
      });
    }
  }
);

router.get('/', authenticateToken, (req: Request, res: Response) => {
  console.log('List agreements - placeholder', { userId: req.user?.id });

  return res.json({
    success: true,
    data: [],
    message: 'Agreements retrieved',
  });
});

router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;

  console.log('Get agreement - placeholder', { id });

  return res.json({
    success: true,
    data: {
      id,
      propertyId: 'property-id',
      landlordId: 'landlord-id',
      tenantId: 'tenant-id',
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      status: 'ACTIVE',
      lawyerReviewStatus: 'NOT_REQUESTED',
    },
    message: 'Agreement retrieved',
  });
});

router.post(
  '/:id/request-lawyer-review',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      console.log('Request lawyer review - placeholder', { id });

      const { paymentLink } = await initializePayment({
        email: req.user!.email,
        amount: 12000,
        reference: generateReference('REV'),
        name: req.user!.email,
        redirectUrl: `https://leja.ng/agreement/${id}/callback`,
        meta: { agreementId: id },
      });

      return res.json({
        success: true,
        data: {
          id,
          lawyerReviewStatus: 'PENDING',
          paymentLink,
        },
        message: 'Lawyer review requested',
      });
    } catch (error) {
      console.error('Request lawyer review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to request lawyer review',
      });
    }
  }
);

router.patch('/:id/status', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log('Update agreement status - placeholder', { id, status });

  return res.json({
    success: true,
    data: { id, status },
    message: 'Agreement status updated',
  });
});

export default router;
