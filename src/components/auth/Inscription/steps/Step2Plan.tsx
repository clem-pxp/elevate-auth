'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { Button } from '@/components/ui/button';
import { PlanCard } from '@/components/auth/Plan/PlanCard';

// Configuration minimale - JUSTE le visuel
const plansConfig = [
  {
    stripePriceId: 'price_1SJbhV1H0zcejTt5FrRJtZzQ',
    id: 'mensuel',
    variant: 'green' as const,
    discount: null,
    description: 'Facturé mensuellement.',
  },
  {
    stripePriceId: 'price_1SJbjH1H0zcejTt5LCoNTjUM',
    id: 'semestriel',
    variant: 'pink' as const,
    discount: '12% de réduction',
    description: 'Facturé semestriellement.',
  },
  {
    stripePriceId: 'price_1SJbjr1H0zcejTt5bnVqtmJJ',
    id: 'annuel',
    variant: 'gray' as const,
    discount: '30% de réduction',
    description: 'Facturé annuellement.',
  },
];

interface StripePriceData {
  id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  productName: string;
  productId: string;
}

export function Step2Plan() {
  const { completeStep, setCurrentStep, setStep2Data } = useInscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<string>('annuel');
  const [openPlan, setOpenPlan] = useState<string>('annuel');
  const [stripePrices, setStripePrices] = useState<StripePriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les infos Stripe au chargement
  useEffect(() => {
    fetch('/api/stripe/prices')
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ Prices loaded:', data.prices);
        setStripePrices(data.prices);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error loading prices:', err);
        setIsLoading(false);
      });
  }, []);

  const handleSelect = (planId: string) => {
    setSelectedPlan(planId);
    setOpenPlan(planId);
  };

  const handleContinue = () => {
    const config = plansConfig.find((c) => c.id === selectedPlan);
    const stripePrice = stripePrices.find((p) => p.id === config?.stripePriceId);

    if (stripePrice && config) {
      // Calculer la durée en mois
      const durationInMonths =
        stripePrice.interval === 'year'
          ? stripePrice.intervalCount * 12
          : stripePrice.intervalCount;

      setStep2Data({
        planId: config.id,
        planName: stripePrice.productName,
        planPrice: stripePrice.amount / 100, // Total en euros
        stripePriceId: stripePrice.id,
        billingPeriodMonths: durationInMonths, // ⬅️ Changé de billingPeriod
      });
    }

    completeStep(2);
  };

  // Fonction pour calculer le prix affiché (€/mois)
  const getPriceDisplay = (priceId: string): string => {
    const stripePrice = stripePrices.find((p) => p.id === priceId);
    if (!stripePrice) return '...';

    const totalPrice = stripePrice.amount / 100;
    const durationInMonths =
      stripePrice.interval === 'year'
        ? stripePrice.intervalCount * 12
        : stripePrice.intervalCount;
    const pricePerMonth = totalPrice / durationInMonths;
    return `${pricePerMonth.toFixed(2)}€/mois`;
  };

  // Fusionner config avec les données Stripe
  const plans = plansConfig.map((config) => {
    const stripePrice = stripePrices.find((p) => p.id === config.stripePriceId);
    return {
      id: config.id,
      title: stripePrice?.productName || 'Chargement...',
      price: getPriceDisplay(config.stripePriceId),
      discount: config.discount,
      description: config.description,
      variant: config.variant,
      stripePriceId: config.stripePriceId,
    };
  });

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          <p className="text-sm text-gray-600">Chargement des plans...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="sub-h4">Choisis ton plan</h1>
        <p className="text-sm text-pretty text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            {...plan}
            isSelected={selectedPlan === plan.id}
            isOpen={openPlan === plan.id}
            onSelect={() => handleSelect(plan.id)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
          Retour
        </Button>
        <Button onClick={handleContinue} className="flex-1">
          Continuer
        </Button>
      </div>
    </motion.div>
  );
}