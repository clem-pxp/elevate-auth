import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { priceId, email } = await request.json();

    console.log('📧 Creating subscription for:', email);
    console.log('🔑 Price ID:', priceId);

    // 1. Créer un Customer Stripe
    const customer = await stripe.customers.create({
      email: email,
    });

    console.log('✅ Customer created:', customer.id);

    // 2. Créer une Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('✅ Subscription created:', subscription.id);

    // 3. Récupérer l'invoice
    const invoice = subscription.latest_invoice;

    if (!invoice || typeof invoice === 'string') {
      throw new Error('Latest invoice not found');
    }

    // 4. Créer manuellement le Payment Intent si pas encore créé
    let clientSecret: string;

    // @ts-ignore - L'invoice peut avoir payment_intent
    if (invoice.payment_intent && typeof invoice.payment_intent !== 'string') {
      // @ts-ignore
      clientSecret = invoice.payment_intent.client_secret;
    } else {
      // Créer un Payment Intent manuellement
      const paymentIntent = await stripe.paymentIntents.create({
        amount: invoice.amount_due,
        currency: invoice.currency,
        customer: customer.id,
        metadata: {
          subscription_id: subscription.id,
          invoice_id: invoice.id,
        },
      });

      clientSecret = paymentIntent.client_secret!;
      console.log('✅ Payment Intent créé manuellement:', paymentIntent.id);
    }

    console.log('✅ Client Secret récupéré');

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error('❌ Subscription error:', error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création de l'abonnement" },
      { status: 500 }
    );
  }
}