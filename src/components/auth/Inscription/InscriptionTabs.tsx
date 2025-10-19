'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { StepIndicator } from './StepIndicator';
import { Step1Informations } from './steps/Step1Informations';
import { Step2Plan } from './steps/Step2Plan';
import { Step3Payment } from './steps/Step3Payment';
import { Step4Confirmation } from './steps/Step4Confirmation';

export function InscriptionTabs() {
  const { currentStep, completeStep, setStep3Data, setCurrentStep } = useInscriptionStore();

  // Vérifier si on revient de Stripe (session_id dans l'URL) - UNE SEULE FOIS
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // Nettoyer l'URL IMMÉDIATEMENT
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      
      // Récupérer le statut de la session
      fetch(`/api/checkout-status?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'complete') {
            // Paiement réussi !
            setStep3Data({
              stripeCustomerId: data.customer_id || '',
              paymentIntentId: data.subscription_id || sessionId,
            });
            completeStep(3);
          }
        })
        .catch((error) => {
          console.error('Error checking session status:', error);
        });
    }
  }, [completeStep, setStep3Data]);

  return (
    <div className="w-full space-y-8 my-8">
      {/* Step Indicator */}
      <StepIndicator />

      {/* Step Content - Simple fade */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {currentStep === 1 && <Step1Informations />}
          {currentStep === 2 && <Step2Plan />}
          {currentStep === 3 && <Step3Payment />}
          {currentStep === 4 && <Step4Confirmation />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
