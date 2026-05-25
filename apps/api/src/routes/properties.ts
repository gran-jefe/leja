import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@leja/shared';

const router = Router();

router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.LANDLORD),
  (req: Request, res: Response) => {
    const {
      address,
      city,
      state,
      propertyType,
      bedrooms,
      bathrooms,
      monthlyRent,
      annualRent,
    } = req.body;

    console.log('Create property - placeholder', {
      address,
      city,
      state,
      propertyType,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: 'property-id-placeholder',
        landlordId: req.user?.id,
        address,
        city,
        state,
        propertyType,
        bedrooms,
        bathrooms,
        monthlyRent,
        annualRent,
        isAvailable: true,
      },
      message: 'Property created',
    });
  }
);

router.get('/', (req: Request, res: Response) => {
  const { city, state, type, page = 1, limit = 10 } = req.query;

  console.log('List properties - placeholder', { city, state, type, page, limit });

  return res.json({
    success: true,
    data: [],
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total: 0,
      totalPages: 0,
    },
    message: 'Properties retrieved',
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  console.log('Get property - placeholder', { id });

  return res.json({
    success: true,
    data: {
      id,
      landlordId: 'landlord-id',
      address: '123 Main St',
      city: 'Lagos',
      state: 'Lagos',
      propertyType: 'TWO_BEDROOM',
      bedrooms: 2,
      bathrooms: 2,
      monthlyRent: 500000,
      annualRent: 6000000,
      isAvailable: true,
    },
    message: 'Property retrieved',
  });
});

router.patch(
  '/:id',
  authenticateToken,
  requireRole(UserRole.LANDLORD),
  (req: Request, res: Response) => {
    const { id } = req.params;
    const { address, city, state, bedrooms, bathrooms, monthlyRent, annualRent } =
      req.body;

    console.log('Update property - placeholder', { id, address });

    return res.json({
      success: true,
      data: {
        id,
        landlordId: req.user?.id,
        address,
        city,
        state,
        bedrooms,
        bathrooms,
        monthlyRent,
        annualRent,
      },
      message: 'Property updated',
    });
  }
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.LANDLORD),
  (req: Request, res: Response) => {
    const { id } = req.params;

    console.log('Delete property - placeholder', { id });

    return res.json({
      success: true,
      message: 'Property deleted',
    });
  }
);

export default router;
