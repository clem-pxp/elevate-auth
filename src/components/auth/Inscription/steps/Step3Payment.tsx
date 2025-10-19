'use client';

import { useCallback } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe-client';

export function Step3Payment() {
  const { getInscriptionData, setStep3Data } = useInscriptionStore();

  // Fonction pour récupérer le client secret
  const fetchClientSecret = useCallback(async () => {
    const data = getInscriptionData();

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: data.stripePriceId,
        email: data.email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const responseData = await response.json();
    
    // Sauvegarder le customer ID
    if (responseData.customerId) {
      setStep3Data({
        stripeCustomerId: responseData.customerId,
        paymentIntentId: '',
      });
    }

    return responseData.clientSecret;
  }, [getInscriptionData, setStep3Data]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="sub-h4">Paiement sécurisé</h1>
        <p className="text-sm text-pretty text-gray-600">
          Votre paiement est sécurisé par Stripe. Vos données bancaires ne sont jamais stockées sur nos serveurs.
        </p>
      </div>

      {/* Embedded Checkout */}
      <div id="checkout" className="min-h-[500px]">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </motion.div>
  );
}
