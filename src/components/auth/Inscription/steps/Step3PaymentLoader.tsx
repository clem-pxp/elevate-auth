'use client';

import { lazy, Suspense } from 'react';
import { EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';

// Lazy load du composant EmbeddedCheckout
const LazyEmbeddedCheckout = lazy(() => 
  import('@stripe/react-stripe-js').then(module => ({
    default: module.EmbeddedCheckout
  }))
);

interface Step3PaymentLoaderProps {
  fetchClientSecret: () => Promise<string>;
  stripePromise: Promise<any>;
}

export function Step3PaymentLoader({ fetchClientSecret, stripePromise }: Step3PaymentLoaderProps) {
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
        <LazyEmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </Suspense>
  );
}
