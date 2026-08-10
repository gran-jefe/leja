import { z } from 'zod';

export const verifyTier1Schema = z.object({
  phone: z.string().min(10, 'Enter a valid phone number'),
  bvnOrNin: z.string().min(10, 'Enter a valid BVN or NIN').max(11, 'Enter a valid BVN or NIN'),
});

export type VerifyTier1Input = z.infer<typeof verifyTier1Schema>;

export const verifyTier2Schema = z.object({
  livenessImageRef: z.string().min(1, 'Liveness image is required'),
  documentImageRef: z.string().min(1, 'Document image is required'),
  documentType: z.enum(['NIN_SLIP', 'DRIVERS_LICENSE', 'PASSPORT', 'VOTERS_CARD']),
});

export type VerifyTier2Input = z.infer<typeof verifyTier2Schema>;
