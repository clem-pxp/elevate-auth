'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { Button } from '@/components/ui/button';
import { PlanCard } from '@/components/auth/Plan/PlanCard';
import { PLANS_CONFIG } from '@/lib/plans-config';
import type { StripePriceData } from '@/types';

export function Step2Plan() {
  const { completeStep, setCurrentStep, setStep2Data, accountCreated, getInscriptionData } = useInscriptionStore();
  
  // Si le compte est créé, charger le plan sélectionné
  const savedData = accountCreated ? getInscriptionData() : null;
  
  const [selectedPlan, setSelectedPlan] = useState<string>(savedData?.planId || 'annuel');
  const [openPlan, setOpenPlan] = useState<string>(savedData?.planId || 'annuel');
  const [stripePrices, setStripePrices] = useState<StripePriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stripe/prices')
      .then((res) => res.json())
      .then((data) => {
        setStripePrices(data.prices);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSelect = (planId: string) => {
    setSelectedPlan(planId);
    setOpenPlan(planId);
  };

  const handleContinue = () => {
    const config = Object.values(PLANS_CONFIG).find((c) => c.id === selectedPlan);
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
        planPrice: stripePrice.amount / 100,
        stripePriceId: stripePrice.id,
        billingPeriodMonths: durationInMonths,
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

  const plans = Object.values(PLANS_CONFIG).map((config) => {
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
        {accountCreated && (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            ℹ️ Votre compte est créé. Le plan sélectionné ne peut plus être modifié.
          </p>
        )}
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            {...plan}
            isSelected={selectedPlan === plan.id}
            isOpen={openPlan === plan.id}
            onSelect={accountCreated ? () => {} : () => handleSelect(plan.id)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
          Retour
        </Button>
        <Button onClick={handleContinue} className="flex-1" disabled={accountCreated}>
          Continuer
        </Button>
      </div>
    </motion.div>
  );
}