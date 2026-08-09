import { z } from 'zod';

export const providerApplySchema = z.object({
  category: z.enum(['LEGAL', 'INSURANCE']),
  licenseNumber: z.string().min(3, 'License number is required'),
});

export type ProviderApplyInput = z.infer<typeof providerApplySchema>;

export const submitBidSchema = z.object({
  price: z.number().positive('Price must be positive'),
  turnaroundHours: z.number().int().positive('Turnaround must be a positive number of hours'),
});

export type SubmitBidInput = z.infer<typeof submitBidSchema>;
