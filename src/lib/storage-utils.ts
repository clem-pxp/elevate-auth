/**
 * Utilitaires pour gérer le localStorage de manière sûre
 */

/**
 * Sauvegarder dans localStorage avec gestion d'erreurs
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Récupérer depuis localStorage avec gestion d'erreurs
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to read from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Supprimer de localStorage avec gestion d'erreurs
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Tenter de parser du JSON de manière sûre
 */
export function safeParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Vérifier si localStorage est disponible
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Nettoyer les données corrompues du localStorage
 */
export function cleanupCorruptedStorage(keys: string[]): void {
  keys.forEach((key) => {
    const value = safeGetItem(key);
    if (value) {
      try {
        JSON.parse(value);
      } catch {
        console.warn(`Removing corrupted data for key: ${key}`);
        safeRemoveItem(key);
      }
    }
  });
}
