import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';

const router = Router();

router.post(
  '/',
  authenticateToken,
  agreementRateLimit,
  (req: Request, res: Response) => {
    const {
      propertyId,
      tenantId,
      startDate,
      endDate,
      monthlyRent,
      annualRent,
    } = req.body;

    console.log('Create agreement - placeholder', {
      propertyId,
      tenantId,
      startDate,
      endDate,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: 'agreement-id-placeholder',
        propertyId,
        landlordId: req.user?.id,
        tenantId,
        startDate,
        endDate,
        monthlyRent,
        annualRent,
        status: 'DRAFT',
        lawyerReviewStatus: 'NOT_REQUESTED',
        paymentLink: 'https://paystack.co/pay/placeholder',
      },
      message: 'Agreement created',
    });
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
  (req: Request, res: Response) => {
    const { id } = req.params;

    console.log('Request lawyer review - placeholder', { id });

    return res.json({
      success: true,
      data: {
        id,
        lawyerReviewStatus: 'PENDING',
        paymentLink: 'https://paystack.co/pay/placeholder',
      },
      message: 'Lawyer review requested',
    });
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
