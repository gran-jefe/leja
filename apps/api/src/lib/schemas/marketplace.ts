import { z } from 'zod';

export const providerApplySchema = z.object({
  category: z.enum(['LEGAL', 'INSURANCE']),
  licenseNumber: z.string().min(3, 'License number is required'),
});

export type ProviderApplyInput = z.infer<typeof providerApplySchema>;

// Admin-only onboarding of BeyondAgency's own salaried staff — unlike
// providerApplySchema, this names the user being onboarded (by email, not
// raw ID — friendlier for an admin typing this into a form) rather than
// inferring it from the authenticated caller.
export const internalProviderSchema = z.object({
  email: z.string().email('Invalid email'),
  category: z.enum(['LEGAL', 'INSURANCE']),
  licenseNumber: z.string().min(3, 'License number is required'),
});

export type InternalProviderInput = z.infer<typeof internalProviderSchema>;

export const submitBidSchema = z.object({
  price: z.number().positive('Price must be positive'),
  turnaroundHours: z.number().int().positive('Turnaround must be a positive number of hours'),
});

export type SubmitBidInput = z.infer<typeof submitBidSchema>;
