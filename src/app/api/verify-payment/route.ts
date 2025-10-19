import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID required' },
        { status: 400 }
      );
    }

    logger.info('Verifying payment', { paymentIntentId });

    // Récupérer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['invoice']
    }) as Stripe.PaymentIntent & { invoice?: Stripe.Invoice | string };

    if (paymentIntent.status !== 'succeeded') {
      logger.warn('Payment not succeeded', { 
        paymentIntentId, 
        status: paymentIntent.status 
      });
      return NextResponse.json({
        success: false,
        status: paymentIntent.status,
      });
    }

    // Récupérer la facture depuis les metadata ou l'invoice
    const invoiceId = typeof paymentIntent.invoice === 'string' 
      ? paymentIntent.invoice 
      : paymentIntent.invoice?.id;
    
    if (!invoiceId) {
      logger.warn('No invoice found on payment intent', { paymentIntentId });
      return NextResponse.json({
        success: true,
        status: 'succeeded',
        message: 'Payment succeeded but no invoice to update'
      });
    }

    // Récupérer la facture avec expand
    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ['subscription']
    }) as Stripe.Invoice & { subscription?: Stripe.Subscription | string };
    
    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription?.id;
    
    logger.debug('Invoice retrieved', {
      invoiceId: invoice.id,
      status: invoice.status,
      subscriptionId
    });

    // Si la facture n'est pas encore payée, la payer
    if (invoice.status === 'open') {
      await stripe.invoices.pay(invoiceId, {
        paid_out_of_band: true
      });
      
      logger.info('Invoice marked as paid', { 
        invoiceId,
        subscriptionId 
      });
    }

    // Récupérer la subscription pour vérifier son statut
    const subscription = subscriptionId 
      ? await stripe.subscriptions.retrieve(subscriptionId)
      : null;

    return NextResponse.json({
      success: true,
      status: 'succeeded',
      invoice: {
        id: invoice.id,
        status: invoice.status,
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
      } : null,
    });

  } catch (error) {
    logger.error('Payment verification error', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to verify payment';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
