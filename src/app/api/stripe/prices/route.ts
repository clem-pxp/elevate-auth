import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { PLANS_CONFIG } from '@/lib/plans-config';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

export async function GET() {
  try {
    const priceIds = Object.values(PLANS_CONFIG).map(plan => plan.stripePriceId);

    const prices = await Promise.all(
      priceIds.map((id) => stripe.prices.retrieve(id, { expand: ['product'] }))
    );

    const formattedPrices = prices.map((price) => {
      const product = price.product as Stripe.Product;
      
      return {
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count,
        productName: product.name,
        productId: product.id,
      };
    });

    return NextResponse.json({ prices: formattedPrices });
  } catch (error) {
    logger.error('Error fetching prices', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' }, 
      { status: 500 }
    );
  }
}