'use client';

import { Suspense } from 'react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

interface Step3PaymentLoaderProps {
  fetchClientSecret: () => Promise<string>;
  stripePromise: Promise<any>;
}

export function Step3PaymentLoader({ fetchClientSecret, stripePromise }: Step3PaymentLoaderProps) {
  console.log('🎨 Step3PaymentLoader rendered');
  
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            <p className="text-sm text-gray-600">Chargement du paiement sécurisé...</p>
          </div>
        </div>
      }
    >
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </Suspense>
  );
}
