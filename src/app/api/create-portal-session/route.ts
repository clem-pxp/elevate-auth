import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID requis' },
        { status: 400 }
      );
    }

    // Créer une session Customer Portal
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/inscription?success=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('❌ Portal session error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}