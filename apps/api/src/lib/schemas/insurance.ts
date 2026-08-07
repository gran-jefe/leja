import { z } from 'zod';

export const insuranceInterestSchema = z.object({
  agreementId: z.string().uuid('Invalid agreement ID'),
  productType: z.enum(['RENT_PROTECTION']).optional().default('RENT_PROTECTION'),
});

export type InsuranceInterestInput = z.infer<typeof insuranceInterestSchema>;
