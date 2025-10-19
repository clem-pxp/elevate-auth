'use client';

import { useCallback } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { stripePromise } from '@/lib/stripe-client';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { postJSON, FetchError } from '@/lib/fetch-utils';

export function Step3Payment() {
  const { getInscriptionData, setStep3Data } = useInscriptionStore();

  // Fonction pour récupérer le client secret
  const fetchClientSecret = useCallback(async () => {
    console.log('🔍 fetchClientSecret called');
    const data = getInscriptionData();
    console.log('📦 Inscription data:', { email: data.email, stripePriceId: data.stripePriceId });

    if (!data.email || !data.stripePriceId) {
      console.error('❌ Missing email or stripePriceId');
      throw new Error('Données manquantes pour créer la session de paiement');
    }

    try {
      console.log('📡 Calling /api/create-checkout-session...');
      const responseData = await postJSON<{ clientSecret: string; customerId: string }>(
        '/api/create-checkout-session',
        {
          priceId: data.stripePriceId,
          email: data.email,
        },
        {
          timeout: 15000,
          retries: 2,
        }
      );

      console.log('✅ Checkout session created:', { customerId: responseData.customerId });

      // Sauvegarder le customer ID
      if (responseData.customerId) {
        setStep3Data({
          stripeCustomerId: responseData.customerId,
          paymentIntentId: '',
        });
      }

      return responseData.clientSecret;
    } catch (error) {
      console.error('❌ Checkout session error:', error);
      if (error instanceof FetchError) {
        throw new Error(
          `Impossible de créer la session de paiement: ${error.message}`
        );
      }
      throw error;
    }
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
