import Stripe from 'stripe';
import { serverEnv } from './server-env';

export const stripe = new Stripe(serverEnv.stripe.secretKey, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});
