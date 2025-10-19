/**
 * Cache client-side pour les prix Stripe
 */

import type { StripePriceData } from '@/types';

const CACHE_KEY = 'stripe-prices-cache';
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

interface CacheData {
  prices: StripePriceData[];
  timestamp: number;
}

/**
 * Sauvegarder les prix dans le cache
 */
export function cachePrices(prices: StripePriceData[]): void {
  try {
    const cacheData: CacheData = {
      prices,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    // Ignorer les erreurs de storage (quota dépassé, etc.)
    console.warn('Failed to cache prices:', error);
  }
}

/**
 * Récupérer les prix depuis le cache
 */
export function getCachedPrices(): StripePriceData[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);

    // Vérifier si le cache est expiré
    if (Date.now() - cacheData.timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return cacheData.prices;
  } catch (error) {
    // En cas d'erreur, nettoyer le cache
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/**
 * Invalider le cache
 */
export function invalidatePricesCache(): void {
  sessionStorage.removeItem(CACHE_KEY);
}
