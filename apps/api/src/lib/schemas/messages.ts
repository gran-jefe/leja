import { z } from 'zod';

export const startConversationSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  body: z.string().min(1, 'Message cannot be empty').max(2000, 'Keep it under 2000 characters'),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;

export const sendMessageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(2000, 'Keep it under 2000 characters'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
