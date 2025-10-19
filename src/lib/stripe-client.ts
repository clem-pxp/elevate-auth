import { loadStripe } from '@stripe/stripe-js';
import { clientEnv } from './env';

export const stripePromise = loadStripe(clientEnv.stripe.publishableKey);
