'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe-client';

export function Step3Payment() {
  const { getInscriptionData, setStep3Data } = useInscriptionStore();
  const [isReturningFromStripe, setIsReturningFromStripe] = useState(false);

  // Vérifier si on revient de Stripe (dans ce cas, ne pas charger le checkout)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      setIsReturningFromStripe(true);
    }
  }, []);

  // Si on revient de Stripe, afficher un message de chargement
  if (isReturningFromStripe) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-6"
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            <p className="text-sm text-gray-600">Vérification du paiement...</p>
          </div>
        </div>
      </motion.div>
    );
  }

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
