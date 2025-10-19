import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    logger.error('Webhook signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info('PaymentIntent succeeded', { 
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount 
        });

        const subscriptionId = paymentIntent.metadata.subscription_id;
        const invoiceId = paymentIntent.metadata.invoice_id;

        if (subscriptionId && invoiceId) {
          const invoice = await stripe.invoices.retrieve(invoiceId);
          
          if (invoice.status !== 'paid') {
            await stripe.invoices.pay(invoiceId, {
              paid_out_of_band: true,
            });
            logger.info('Invoice marked as paid', { invoiceId });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        logger.info('Invoice payment succeeded', { 
          invoiceId: invoice.id
        });
        break;
      }

      default:
        logger.debug('Unhandled event type', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
