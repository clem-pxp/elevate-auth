import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createSubscriptionSchema } from '@/lib/validation';
import { isValidPriceId } from '@/lib/plans-config';
import { logger } from '@/lib/logger';

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

    logger.info('Creating Embedded Checkout session', { email, priceId });

    // Chercher un customer existant ou en créer un nouveau
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    const customer = existingCustomers.data.length > 0
      ? existingCustomers.data[0]
      : await stripe.customers.create({ email });

    logger.debug('Customer retrieved/created', { 
      customerId: customer.id,
      isNew: existingCustomers.data.length === 0 
    });

    // Récupérer l'URL de base depuis la requête
    const origin = request.headers.get('origin') || request.headers.get('referer')?.split('/').slice(0, 3).join('/') || process.env.NEXT_PUBLIC_APP_URL;
    
    // Créer la session Checkout en mode embedded
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      return_url: `${origin}/auth/inscription?session_id={CHECKOUT_SESSION_ID}`,
    });

    logger.info('Checkout session created', { 
      sessionId: session.id,
      customerId: customer.id 
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      customerId: customer.id,
    });
  } catch (error) {
    logger.error('Checkout session error', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to create checkout session';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
