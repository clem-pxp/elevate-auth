import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createPaymentIntentSchema } from '@/lib/validation';
import { isValidPriceId } from '@/lib/plans-config';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPaymentIntentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { priceId } = validation.data;

    if (!isValidPriceId(priceId)) {
      logger.warn('Invalid price ID attempted', { priceId });
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const price = await stripe.prices.retrieve(priceId);
    
    if (!price.unit_amount) {
      logger.error('Price has no unit_amount', { priceId });
      return NextResponse.json(
        { error: 'Invalid price configuration' },
        { status: 500 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      metadata: {
        priceId,
      },
    });

    logger.info('Payment intent created', { 
      paymentIntentId: paymentIntent.id,
      priceId 
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    logger.error('Payment Intent error', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}