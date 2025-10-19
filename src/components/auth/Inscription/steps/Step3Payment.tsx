'use client';

import { useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe-client';

export function Step3Payment() {
  const { getInscriptionData, completeStep, setStep3Data } = useInscriptionStore();

  // Vérifier si on revient de Stripe (session_id dans l'URL)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // Récupérer le statut de la session
      fetch(`/api/checkout-status?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'complete') {
            // Paiement réussi !
            setStep3Data({
              stripeCustomerId: data.customer_id || '',
              paymentIntentId: sessionId,
            });
            completeStep(3);
            
            // Nettoyer l'URL
            window.history.replaceState({}, '', '/auth/inscription');
          }
        })
        .catch((error) => {
          console.error('Error checking session status:', error);
        });
    }
  }, [completeStep, setStep3Data]);

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
