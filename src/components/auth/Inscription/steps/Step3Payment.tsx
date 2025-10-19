'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { Button } from '@/components/ui/button';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { STRIPE_APPEARANCE } from '@/lib/constants';

// Composant form
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { completeStep, setCurrentStep, setStep3Data } = useInscriptionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/auth/inscription`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Une erreur est survenue');
      setIsLoading(false);
    } else {
      setStep3Data({
        paymentIntentId: paymentIntent.id,
      });

      completeStep(3);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element - Full width */}
      <PaymentElement
        options={{
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
          },
          paymentMethodOrder: ['card', 'apple_pay'],
        }}
      />

      {errorMessage && <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{errorMessage}</div>}

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="flex-1" disabled={isLoading}>
          Retour
        </Button>
        <Button type="submit" className="flex-1" disabled={!stripe || isLoading}>
          {isLoading ? 'Traitement...' : 'Payer 16,99€'}
        </Button>
      </div>
    </form>
  );
}

// Composant parent
export function Step3Payment() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { getInscriptionData, setStep3Data } = useInscriptionStore();

  useEffect(() => {
    const data = getInscriptionData();
    
    if (!data.stripePriceId) {
      return;
    }
    
    fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: data.stripePriceId,
        email: data.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        
        if (data.customerId) {
          setStep3Data({
            paymentIntentId: '',
            stripeCustomerId: data.customerId,
          });
        }
      })
      .catch(() => {});
  }, [getInscriptionData, setStep3Data]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          <p className="text-sm text-gray-600">Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="sub-h4">Paiement sécurisé</h1>
        <p className="text-sm text-pretty text-gray-600">Votre paiement est sécurisé par Stripe. Vos données bancaires ne sont jamais stockées sur nos serveurs.</p>
      </div>

      {/* Stripe Elements */}
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: STRIPE_APPEARANCE,
        }}
      >
        <CheckoutForm />
      </Elements>
    </motion.div>
  );
}
