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
        payment_method_types: ['card'],
      },
      expand: ['latest_invoice.payment_intent'],
    });

    logger.debug('Subscription created', { subscriptionId: subscription.id });

    const invoice = subscription.latest_invoice;

    if (!invoice || typeof invoice === 'string') {
      logger.error('Latest invoice not found or not expanded');
      throw new Error('Latest invoice not found');
    }

    const expandedInvoice = invoice as Stripe.Invoice & {
      payment_intent?: Stripe.PaymentIntent | string;
    };
    const paymentIntent = expandedInvoice.payment_intent;

    if (!paymentIntent || typeof paymentIntent === 'string') {
      logger.error('PaymentIntent not found on invoice', { 
        invoiceId: expandedInvoice.id,
        subscriptionId: subscription.id 
      });
      throw new Error('PaymentIntent not created by Stripe');
    }

    const clientSecret = paymentIntent.client_secret;

    if (!clientSecret) {
      logger.error('Client secret missing from PaymentIntent', {
        paymentIntentId: paymentIntent.id
      });
      throw new Error('Failed to retrieve client secret');
    }

    logger.debug('PaymentIntent retrieved from subscription', {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
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