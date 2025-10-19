'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { StepIndicator } from './StepIndicator';
import { Step1Informations } from './steps/Step1Informations';
import { Step2Plan } from './steps/Step2Plan';
import { Step3Payment } from './steps/Step3Payment';
import { Step4Confirmation } from './steps/Step4Confirmation';

export function InscriptionTabs() {
  const { currentStep, completeStep, setStep3Data, setCurrentStep } = useInscriptionStore();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Vérifier si on revient de Stripe AVANT tout rendu
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      setIsProcessingPayment(true);
      
      // Nettoyer l'URL IMMÉDIATEMENT
      window.history.replaceState({}, '', window.location.pathname);
      
      // Récupérer le statut de la session
      fetch(`/api/checkout-status?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'complete') {
            setStep3Data({
              stripeCustomerId: data.customer_id || '',
              paymentIntentId: data.subscription_id || sessionId,
            });
            completeStep(3);
            // Important : désactiver le loader pour afficher Step 4
            setIsProcessingPayment(false);
          } else {
            setIsProcessingPayment(false);
          }
        })
        .catch((error) => {
          console.error('Error checking session status:', error);
          setIsProcessingPayment(false);
        });
    }
  }, [completeStep, setStep3Data]);

  // Si on traite le paiement, afficher un loader au lieu des steps
  if (isProcessingPayment) {
    return (
      <div className="w-full space-y-8 my-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            <p className="text-sm text-gray-600">Finalisation de votre inscription...</p>
          </div>
        </div>
      </div>
    );
  }

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
