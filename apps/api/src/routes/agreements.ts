import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { agreementRateLimit } from '../middleware/rateLimit';
import { generateReference } from '../lib/flutterwave';
import { UserRole } from '@leja/shared';
import {
  createAgreementWithProperty,
  findAgreementsForUser,
  findAgreementById,
  updateAgreementLawyerReview,
} from '../db/queries/agreements';

const router = Router();

router.post(
  '/',
  authenticateToken,
  agreementRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        address,
        city,
        state,
        propertyType,
        bedrooms,
        bathrooms,
        tenantEmail,
        startDate,
        endDate,
        monthlyRent,
        annualRent,
        withLawyerReview,
        flutterwaveReference,
      } = req.body;

      const agreement = await createAgreementWithProperty({
        landlordId: req.user!.id,
        tenantEmail,
        address,
        city,
        state,
        propertyType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        startDate,
        endDate,
        monthlyRent: Number(monthlyRent),
        annualRent: Number(annualRent),
        withLawyerReview: !!withLawyerReview,
        paymentReference: flutterwaveReference || generateReference('AGR'),
      });

      return res.status(201).json({
        success: true,
        data: agreement,
        message: 'Agreement created',
      });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
);

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.user!.role === UserRole.LANDLORD ? 'LANDLORD' : 'TENANT';
    const agreements = await findAgreementsForUser(req.user!.id, role);

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
