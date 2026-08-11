import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, optionalAuth, requireCapability } from '../middleware/auth';
import { Capability } from '@beyond/shared';
import { grantCapability } from '../db/queries/capabilities';
import {
  createProperty,
  findPropertiesByLandlord,
  findAvailableProperties,
  findPropertyById,
  updateProperty,
  softDeleteProperty,
} from '../db/queries/properties';

const router = Router();

// GRANT POINT — no LANDLORD gate here. Listing your first property is what
// makes you a landlord; requiring the capability would make it unreachable.
router.post(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        address,
        city,
        state,
        propertyType,
        bedrooms,
        bathrooms,
        monthlyRent,
        requiresInsurance,
        description,
        images,
        amenities,
      } = req.body;
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
        requiresInsurance: Boolean(requiresInsurance),
        description: typeof description === 'string' ? description.trim().slice(0, 2000) : undefined,
        images: Array.isArray(images)
          ? images.filter((u: unknown) => typeof u === 'string' && u.trim()).slice(0, 12)
          : undefined,
        amenities: Array.isArray(amenities)
          ? amenities.filter((a: unknown) => typeof a === 'string' && a.trim()).slice(0, 30)
          : undefined,
      });

      // Listing a property is what makes you a landlord. Idempotent, and
      // non-fatal: a capability hiccup must never lose the listing itself.
      try {
        await grantCapability(req.user!.id, Capability.LANDLORD, 'listed_property');
      } catch (err) {
        console.error('[CAPABILITY] Failed to grant LANDLORD to', req.user!.id, err);
      }

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
    // A landlord asking for "/properties" means their own listings. Someone
    // who is also a tenant still browses via /properties?browse=1 or the
    // dedicated browse screen.
    if (req.user?.capabilities?.includes(Capability.LANDLORD) && req.query.browse !== '1') {
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
  requireCapability(Capability.LANDLORD),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const existing = await findPropertyById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      if (existing.landlord_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not own this property',
        });
      }

      const {
        address,
        city,
        state,
        bedrooms,
        bathrooms,
        monthlyRent,
        annualRent,
        isAvailable,
        requiresInsurance,
        description,
        images,
        amenities,
      } = req.body;

      const property = await updateProperty(id, {
        address,
        city,
        state,
        bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
        bathrooms: bathrooms !== undefined ? Number(bathrooms) : undefined,
        monthlyRent: monthlyRent !== undefined ? Number(monthlyRent) : undefined,
        annualRent: annualRent !== undefined ? Number(annualRent) : undefined,
        isAvailable,
        requiresInsurance,
        description: typeof description === 'string' ? description.trim().slice(0, 2000) : undefined,
        images: Array.isArray(images)
          ? images.filter((u: unknown) => typeof u === 'string' && u.trim()).slice(0, 12)
          : undefined,
        amenities: Array.isArray(amenities)
          ? amenities.filter((a: unknown) => typeof a === 'string' && a.trim()).slice(0, 30)
          : undefined,
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
  requireCapability(Capability.LANDLORD),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const existing = await findPropertyById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      if (existing.landlord_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not own this property',
        });
      }

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
