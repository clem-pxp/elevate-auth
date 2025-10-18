import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Client-side Stripe (pour le frontend)
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Server-side Stripe (pour les API Routes)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);