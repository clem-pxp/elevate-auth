export interface PlanConfig {
  id: string;
  stripePriceId: string;
  name: string;
  variant: 'green' | 'pink' | 'gray';
  discount: string | null;
  description: string;
}

export const PLANS_CONFIG: Record<string, PlanConfig> = {
  mensuel: {
    id: 'mensuel',
    stripePriceId: 'price_1SJbhV1H0zcejTt5FrRJtZzQ',
    name: 'Plan Mensuel',
    variant: 'green',
    discount: null,
    description: 'Facturé mensuellement.',
  },
  semestriel: {
    id: 'semestriel',
    stripePriceId: 'price_1SJbjH1H0zcejTt5LCoNTjUM',
    name: 'Plan Semestriel',
    variant: 'pink',
    discount: '12% de réduction',
    description: 'Facturé semestriellement.',
  },
  annuel: {
    id: 'annuel',
    stripePriceId: 'price_1SJbjr1H0zcejTt5bnVqtmJJ',
    name: 'Plan Annuel',
    variant: 'gray',
    discount: '30% de réduction',
    description: 'Facturé annuellement.',
  },
} as const;

export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
  return Object.values(PLANS_CONFIG).find(plan => plan.stripePriceId === priceId);
}

export function getPlanById(planId: string): PlanConfig | undefined {
  return PLANS_CONFIG[planId];
}

export function isValidPriceId(priceId: string): boolean {
  return Object.values(PLANS_CONFIG).some(plan => plan.stripePriceId === priceId);
}
