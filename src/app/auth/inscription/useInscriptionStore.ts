import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { InscriptionData } from '@/types';
import { isLocalStorageAvailable, cleanupCorruptedStorage } from '@/lib/storage-utils';

interface InscriptionStore {
  currentStep: number;
  completedSteps: number[];
  maxStepReached: number;
  accountCreated: boolean; // Flag pour savoir si le compte Firebase est créé
  inscriptionData: InscriptionData;
  
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  setAccountCreated: (created: boolean) => void;
  
  // Nouvelles méthodes
  setStep1Data: (data: Partial<InscriptionData>) => void;
  setStep2Data: (data: Partial<InscriptionData>) => void;
  setStep3Data: (data: Partial<InscriptionData>) => void;
  getInscriptionData: () => InscriptionData;
  resetStore: () => void;
}

const initialData: InscriptionData = {
  nom: '',
  prenom: '',
  email: '',
  phone: '',
  birthday: undefined,
  password: '',
  planId: '',
  planName: '',
  planPrice: 0,
  paymentIntentId: '',
  stripePriceId: '',
  billingPeriodMonths: 0,
  stripeCustomerId: '',
};

// Nettoyer les données corrompues au démarrage
if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
  cleanupCorruptedStorage(['inscription-storage']);
}

export const useInscriptionStore = create<InscriptionStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      completedSteps: [],
      maxStepReached: 1,
      accountCreated: false,
      inscriptionData: initialData,
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      completeStep: (step) => set((state) => {
        if (!state.completedSteps.includes(step)) {
          return {
            completedSteps: [...state.completedSteps, step],
            currentStep: step + 1,
            maxStepReached: Math.max(state.maxStepReached, step + 1),
          };
        }
        return { currentStep: step + 1 };
      }),
      
      setAccountCreated: (created) => set({ accountCreated: created }),
      
      setStep1Data: (data) => set((state) => ({
        inscriptionData: { ...state.inscriptionData, ...data }
      })),
      
      setStep2Data: (data) => set((state) => ({
        inscriptionData: { ...state.inscriptionData, ...data }
      })),
      
      setStep3Data: (data) => set((state) => ({
        inscriptionData: { ...state.inscriptionData, ...data }
      })),
      
      getInscriptionData: () => get().inscriptionData,
      
      resetStore: () => set({
        currentStep: 1,
        completedSteps: [],
        maxStepReached: 1,
        accountCreated: false,
        inscriptionData: initialData,
      }),
    }),
    {
      name: 'inscription-storage',
      storage: createJSONStorage(() => {
        if (!isLocalStorageAvailable()) {
          console.warn('localStorage not available, using fallback');
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Store hydrated successfully');
        }
      },
    }
  )
);