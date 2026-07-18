import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth';
import { UserRole } from '@leja/shared';
import {
  createProperty,
  findPropertiesByLandlord,
  findAvailableProperties,
  findPropertyById,
  updateProperty,
  softDeleteProperty,
} from '../db/queries/properties';

const router = Router();

router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.LANDLORD),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { address, city, state, propertyType, bedrooms, bathrooms, monthlyRent } = req.body;
      const annualRent = Number(monthlyRent) * 12;

      const property = await createProperty({
        landlordId: req.user!.id,
        address,
        city,
        state,
        propertyType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        monthlyRent: Number(monthlyRent),
        annualRent,
      });

      return res.status(201).json({
        success: true,
        data: property,
        message: 'Property created',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role === UserRole.LANDLORD) {
      const properties = await findPropertiesByLandlord(req.user.id);

      return res.json({
        success: true,
        data: properties,
        message: 'Properties retrieved',
      });
    }

    // Tenants and unauthenticated visitors browse the available listings.
    const {
      city,
      state,
      property_type,
      min_rent,
      max_rent,
      bedrooms,
      min_bedrooms,
      search,
      page,
      limit,
    } = req.query;

    const { properties, pagination } = await findAvailableProperties({
      city: city as string | undefined,
      state: state as string | undefined,
      propertyType: property_type as string | undefined,
      minRent: min_rent !== undefined ? Number(min_rent) : undefined,
      maxRent: max_rent !== undefined ? Number(max_rent) : undefined,
      bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
      minBedrooms: min_bedrooms !== undefined ? Number(min_bedrooms) : undefined,
      search: search as string | undefined,
      page: page !== undefined ? Number(page) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
    });

    return res.json({
      success: true,
      data: properties,
      pagination,
      message: 'Properties retrieved',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const property = await findPropertyById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    return res.json({
      success: true,
      data: property,
      message: 'Property retrieved',
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/:id',
  authenticateToken,
  requireRole(UserRole.LANDLORD),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { address, city, state, bedrooms, bathrooms, monthlyRent, annualRent, isAvailable } =
        req.body;

      const property = await updateProperty(id, {
        address,
        city,
        state,
        bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
        bathrooms: bathrooms !== undefined ? Number(bathrooms) : undefined,
        monthlyRent: monthlyRent !== undefined ? Number(monthlyRent) : undefined,
        annualRent: annualRent !== undefined ? Number(annualRent) : undefined,
        isAvailable,
      });

      return res.json({
        success: true,
        data: property,
        message: 'Property updated',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.LANDLORD),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await softDeleteProperty(id);

      return res.json({
        success: true,
        message: 'Property deleted',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
