import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum(['LANDLORD', 'TENANT', 'INVESTOR', 'OTHER'], {
    errorMap: () => ({ message: 'Role must be LANDLORD, TENANT, INVESTOR, or OTHER' }),
  }),
  message: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
