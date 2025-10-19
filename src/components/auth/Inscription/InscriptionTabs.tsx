'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAsyncLock } from '@/hooks/useAsyncLock';
import { StepIndicator } from './StepIndicator';
import { Step1Informations } from './steps/Step1Informations';
import { Step2Plan } from './steps/Step2Plan';
import { Step3Payment } from './steps/Step3Payment';
import { Step4Confirmation } from './steps/Step4Confirmation';

export function InscriptionTabs() {
  const { currentStep, completeStep, setStep3Data, setCurrentStep } = useInscriptionStore();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const isOnline = useNetworkStatus();
  const { runExclusive } = useAsyncLock();
  const processedSessionRef = useRef<string | null>(null);

  // Vérifier si on revient de Stripe AVANT tout rendu - avec protection race condition
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    // Éviter de traiter 2x la même session
    if (sessionId && processedSessionRef.current !== sessionId) {
      processedSessionRef.current = sessionId;
      
      runExclusive(async () => {
        setIsProcessingPayment(true);
        setPaymentError(null);
        
        // Nettoyer l'URL IMMÉDIATEMENT
        window.history.replaceState({}, '', window.location.pathname);
        
        try {
          // Récupérer le statut de la session avec retry et timeout
          const { fetchJSON } = await import('@/lib/fetch-utils');
          const data = await fetchJSON<{ status: string; customer_id: string; subscription_id: string }>(
            `/api/checkout-status?session_id=${sessionId}`,
            {
              timeout: 10000,
              retries: 3,
            }
          );

          if (data.status === 'complete') {
            setStep3Data({
              stripeCustomerId: data.customer_id || '',
              paymentIntentId: data.subscription_id || sessionId,
            });
            completeStep(3);
          } else {
            setPaymentError('Le paiement n\'a pas été confirmé. Veuillez réessayer.');
          }
        } catch (error) {
          console.error('Error checking session status:', error);
          setPaymentError('Impossible de vérifier le statut du paiement. Veuillez contacter le support.');
        } finally {
          setIsProcessingPayment(false);
        }
      });
    }
  }, [completeStep, setStep3Data, runExclusive]);

  // Afficher un avertissement si hors ligne
  if (!isOnline) {
    return (
      <div className="w-full space-y-8 my-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="font-semibold text-lg">Pas de connexion Internet</h3>
            <p className="text-sm text-gray-600 max-w-md">
              Veuillez vérifier votre connexion Internet pour continuer l'inscription.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher une erreur de paiement si nécessaire
  if (paymentError) {
    return (
      <div className="w-full space-y-8 my-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="font-semibold text-lg">Erreur de paiement</h3>
            <p className="text-sm text-gray-600 max-w-md">{paymentError}</p>
            <button
              onClick={() => {
                setPaymentError(null);
                setCurrentStep(3);
              }}
              className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

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
