import { z } from 'zod';
import { BEYOND_PRICING } from '@beyond/shared';

export const createAgreementDraftSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  tenantEmail: z.string().email('Invalid email'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  monthlyRent: z.coerce.number().positive('Monthly rent must be greater than 0'),
  annualRent: z.coerce.number().positive('Annual rent must be greater than 0'),
  wantsLawyerReview: z.boolean().optional().default(false),
  // Landlord may negotiate the legalization fee rate within the platform's
  // allowed band; omit to use the default rate.
  legalizationFeeRate: z.coerce
    .number()
    .min(
      BEYOND_PRICING.LEGALIZATION_FEE_MIN_RATE,
      `Rate must be at least ${BEYOND_PRICING.LEGALIZATION_FEE_MIN_RATE * 100}%`
    )
    .max(
      BEYOND_PRICING.LEGALIZATION_FEE_MAX_RATE,
      `Rate must be at most ${BEYOND_PRICING.LEGALIZATION_FEE_MAX_RATE * 100}%`
    )
    .optional(),
});

export type CreateAgreementDraftInput = z.infer<typeof createAgreementDraftSchema>;
