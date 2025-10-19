import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createSubscriptionSchema } from '@/lib/validation';
import { isValidPriceId } from '@/lib/plans-config';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createSubscriptionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { priceId, email } = validation.data;

    if (!isValidPriceId(priceId)) {
      logger.warn('Invalid price ID attempted', { priceId, email });
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    logger.info('Creating subscription', { email, priceId });

    const customer = await stripe.customers.create({
      email,
    });

    logger.debug('Customer created', { customerId: customer.id });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.confirmation_secret'],
    });

    logger.debug('Subscription created', { subscriptionId: subscription.id });

    const invoice = subscription.latest_invoice;

    if (!invoice || typeof invoice === 'string') {
      logger.error('Latest invoice not found or not expanded');
      throw new Error('Latest invoice not found');
    }

    const expandedInvoice = invoice as Stripe.Invoice & {
      confirmation_secret?: { client_secret: string };
    };

    const clientSecret = expandedInvoice.confirmation_secret?.client_secret;

    if (!clientSecret) {
      logger.error('Client secret missing from confirmation_secret');
      throw new Error('Failed to retrieve client secret');
    }

    logger.debug('Client secret retrieved from confirmation_secret', {
      subscriptionId: subscription.id
    });

    logger.info('Subscription completed', { 
      subscriptionId: subscription.id,
      customerId: customer.id 
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
      customerId: customer.id,
    });
  } catch (error) {
    logger.error('Subscription error', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Erreur lors de la création de l'abonnement";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}