import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import { env, clientEnv } from './env';

export const stripePromise = loadStripe(clientEnv.stripe.publishableKey);

export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});