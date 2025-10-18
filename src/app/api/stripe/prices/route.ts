import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    // IDs des prices à récupérer
    const priceIds = [
      'price_1SJbhV1H0zcejTt5FrRJtZzQ', // Mensuel
      'price_1SJbjH1H0zcejTt5LCoNTjUM', // Semestriel
      'price_1SJbjr1H0zcejTt5bnVqtmJJ', // Annuel
    ];

    // Récupérer tous les prices en parallèle
    const prices = await Promise.all(
      priceIds.map((id) => stripe.prices.retrieve(id, { expand: ['product'] }))
    );

    // Formater les données
    const formattedPrices = prices.map((price: any) => ({
      id: price.id,
      amount: price.unit_amount, // en centimes
      currency: price.currency,
      interval: price.recurring?.interval, // 'month' ou 'year'
      intervalCount: price.recurring?.interval_count, // 1, 6, 12, etc.
      productName: price.product.name,
      productId: price.product.id,
    }));

    return NextResponse.json({ prices: formattedPrices });
  } catch (error) {
    console.error('❌ Error fetching prices:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}