'use client';

import { useCallback, memo } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { stripePromise } from '@/lib/stripe-client';
import { postJSON, FetchError } from '@/lib/fetch-utils';
import { Step3PaymentLoader } from './Step3PaymentLoader';

export const Step3Payment = memo(function Step3Payment() {
  const { getInscriptionData, setStep3Data } = useInscriptionStore();

  // Fonction pour récupérer le client secret avec retry et timeout
  const fetchClientSecret = useCallback(async () => {
    const data = getInscriptionData();

    if (!data.email || !data.stripePriceId) {
      throw new Error('Données manquantes pour créer la session de paiement');
    }

    try {
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

      // Sauvegarder le customer ID
      if (responseData.customerId) {
        setStep3Data({
          stripeCustomerId: responseData.customerId,
          paymentIntentId: '',
        });
      }

      return responseData.clientSecret;
    } catch (error) {
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

      {/* Embedded Checkout - Lazy loaded */}
      <div id="checkout" className="min-h-[500px]">
        <Step3PaymentLoader
          fetchClientSecret={fetchClientSecret}
          stripePromise={stripePromise}
        />
      </div>
    </motion.div>
  );
});
