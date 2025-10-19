import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createPortalSessionSchema } from '@/lib/validation';
import { serverEnv } from '@/lib/server-env';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPortalSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { customerId } = validation.data;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${serverEnv.app.url}/auth/inscription?success=true`,
    });

    logger.info('Portal session created', { customerId });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error('Portal session error', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur lors de la création de la session';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}