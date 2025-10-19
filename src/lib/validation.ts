import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
});

export const createSubscriptionSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  email: z.string().email('Invalid email address'),
});

export const createPortalSessionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CreatePortalSessionInput = z.infer<typeof createPortalSessionSchema>;
