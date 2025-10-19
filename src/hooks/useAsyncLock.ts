/**
 * Hook pour éviter les race conditions sur les opérations async
 */

import { useRef, useCallback } from 'react';

export function useAsyncLock() {
  const lockRef = useRef(false);

  const acquire = useCallback((): boolean => {
    if (lockRef.current) {
      return false; // Déjà verrouillé
    }
    lockRef.current = true;
    return true;
  }, []);

  const release = useCallback(() => {
    lockRef.current = false;
  }, []);

  const isLocked = useCallback(() => {
    return lockRef.current;
  }, []);

  const runExclusive = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    if (!acquire()) {
      console.warn('Operation already in progress, skipping...');
      return null;
    }

    try {
      return await fn();
    } finally {
      release();
    }
  }, [acquire, release]);

  return { acquire, release, isLocked, runExclusive };
}
