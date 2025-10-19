'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { createUserAccount } from '@/lib/auth-service';
import { AppDownloadBadges } from '@/components/global/AppDownloadBadges';
import { useAsyncLock } from '@/hooks/useAsyncLock';
import { postJSON, FetchError } from '@/lib/fetch-utils';

// Afficher le label de la période de facturation
function getBillingPeriodLabel(months: number): string {
  if (months === 1) return '/mois';
  if (months === 6) return '/6 mois';
  if (months === 12) return '/an';
  return `/${months} mois`;
}

// Calculer la date du prochain paiement
function getNextPaymentDate(billingPeriodInMonths: number): string {
  const now = new Date();
  const nextDate = new Date();
  nextDate.setMonth(now.getMonth() + billingPeriodInMonths);
  return nextDate.toLocaleDateString('fr-FR');
}

export function Step4Confirmation() {
  const { getInscriptionData, accountCreated, setAccountCreated } = useInscriptionStore();
  const [isCreating, setIsCreating] = useState(!accountCreated);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { runExclusive } = useAsyncLock();

  // Gérer l'accès au portail Stripe avec protection race condition
  const handleManageSubscription = async () => {
    console.log('🔍 handleManageSubscription called');
    console.log('📦 userData:', userData);
    console.log('🎫 stripeCustomerId:', userData?.stripeCustomerId);

    // Vérifier que le customerId existe
    if (!userData?.stripeCustomerId) {
      setError('ID client Stripe manquant. Veuillez contacter le support.');
      console.error('❌ Missing stripeCustomerId in userData');
      return;
    }

    const result = await runExclusive(async () => {
      setIsRedirecting(true);
      setError(null);

      // 🔑 SOLUTION MOBILE : Ouvrir une fenêtre vide IMMÉDIATEMENT au clic
      // avant l'appel async, pour éviter le blocage popup sur mobile
      const portalWindow = window.open('', '_blank', 'noopener,noreferrer');
      
      if (!portalWindow) {
        console.error('❌ Popup bloqué par le navigateur');
        setError('Popup bloqué. Autorisez les popups pour ce site ou désactivez votre bloqueur de publicités.');
        setIsRedirecting(false);
        return;
      }

      try {
        console.log('📡 Calling /api/create-portal-session with customerId:', userData.stripeCustomerId);
        
        const data = await postJSON<{ url: string }>(
          '/api/create-portal-session',
          {
            customerId: userData.stripeCustomerId,
          },
          {
            timeout: 10000,
            retries: 2,
          }
        );

        console.log('✅ Portal session response:', data);

        if (data.url) {
          console.log('🚀 Redirecting portal window to:', data.url);
          // Rediriger la fenêtre déjà ouverte vers l'URL Stripe
          portalWindow.location.href = data.url;
        } else {
          // Fermer la fenêtre en cas d'erreur
          portalWindow.close();
          setError('Impossible de charger le portail Stripe');
          console.error('❌ No URL in response');
        }
      } catch (error) {
        // Fermer la fenêtre en cas d'erreur
        portalWindow.close();
        console.error('❌ Portal session error:', error);
        if (error instanceof FetchError) {
          setError(`Erreur: ${error.message}`);
        } else {
          setError('Erreur lors de la redirection vers le portail');
        }
      } finally {
        setIsRedirecting(false);
      }
    });

    if (result === null) {
      console.warn('⚠️ Portal session already being created');
    }
  };

  useEffect(() => {
    const createAccount = async () => {
      const data = getInscriptionData();

      // Si le compte est déjà créé, ne pas recréer
      if (accountCreated) {
        setUserData(data);
        setIsCreating(false);
        return;
      }

      // Vérifier que toutes les données sont présentes
      if (!data || !data.email || !data.planId || !data.stripePriceId) {
        setError('Données manquantes. Veuillez recommencer le processus.');
        setIsCreating(false);
        return;
      }

      // Pour Google Sign-In, le mot de passe peut être vide
      const password = data.password || undefined;

      const result = await createUserAccount(
        {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          phone: data.phone,
          birthday: data.birthday,
          planId: data.planId,
          planName: data.planName,
          planPrice: data.planPrice,
          paymentIntentId: data.paymentIntentId,
        },
        password
      );

      if (result.success) {
        setUserData(data);
        setAccountCreated(true); // Marquer le compte comme créé
        setIsCreating(false);
      } else {
        setError(result.error || 'Une erreur est survenue');
        setIsCreating(false);
      }
    };

    createAccount();
  }, [getInscriptionData, accountCreated, setAccountCreated]);

  // État de chargement
  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
        <p className="text-gray-600">Création de votre compte...</p>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-12">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-4xl">❌</span>
        </div>
        <div className="space-y-2">
          <h1 className="sub-h4">Une erreur est survenue</h1>
          <p className="text-red-600">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  // État de succès
  if (!userData) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-8 py-12">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
      >
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
            <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
          </motion.div>
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        <h1 className="sub-h4">Bienvenue {userData.prenom} ! 🎉</h1>
        <p className="text-gray-600 max-w-md">
          Votre compte a été créé avec succès et votre paiement a été confirmé. Un email de confirmation vous a été envoyé à <strong>{userData.email}</strong>.
        </p>
      </motion.div>

      {/* Plan Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-50 rounded-xl p-6 w-full max-w-md space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Plan sélectionné</span>
          <span className="font-semibold">{userData.planName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Montant</span>
          <span className="font-semibold">
            {userData.planPrice.toFixed(2)}€{getBillingPeriodLabel(userData.billingPeriodMonths)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm text-gray-600">Prochain paiement</span>
          <span className="text-sm">{getNextPaymentDate(userData.billingPeriodMonths)}</span>
        </div>
      </motion.div>

      {/* App Download Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">Téléchargez l'application mobile</p>
          <AppDownloadBadges />
        </div>
      </motion.div>

      {/* CTA Button */}
      <Button className="w-full" size="lg" onClick={handleManageSubscription} disabled={isRedirecting}>
        {isRedirecting ? 'Redirection...' : 'Gérer mon abonnement'}
      </Button>

      {/* Afficher l'erreur si présente */}
      {error && (
        <div className="w-full max-w-md p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          <p className="text-xs text-red-600 mt-2">
            Vérifiez la console du navigateur (F12) pour plus de détails.
          </p>
        </div>
      )}

      {/* Debug Info - afficher uniquement en dev */}
      {process.env.NODE_ENV === 'development' && (
        <details className="w-full max-w-md text-left">
          <summary className="cursor-pointer text-xs text-gray-500">Debug Info (dev only)</summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
            {JSON.stringify({
              stripeCustomerId: userData?.stripeCustomerId,
              paymentIntentId: userData?.paymentIntentId,
              email: userData?.email,
              planId: userData?.planId,
            }, null, 2)}
          </pre>
        </details>
      )}

      {/* Help Text */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-sm text-gray-500">
        Besoin d'aide ?{' '}
        <a href="/support" className="text-violet-600 hover:underline font-medium">
          Contactez le support
        </a>
      </motion.p>
    </motion.div>
  );
}
