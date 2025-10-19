import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    logger.info('Retrieving checkout session status', { sessionId });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    logger.debug('Session retrieved', {
      sessionId: session.id,
      status: session.status,
      customerId: session.customer,
      subscriptionId: session.subscription
    });

    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      customer_id: session.customer,
      subscription_id: session.subscription,
    });
  } catch (error) {
    logger.error('Checkout status error', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to retrieve checkout status';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
