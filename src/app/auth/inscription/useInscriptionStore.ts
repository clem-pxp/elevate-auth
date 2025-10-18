import { create } from 'zustand';

interface InscriptionData {
  // Step 1
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  birthday: Date | undefined;
  password: string;
  
  // Step 2
  planId: string;
  planName: string;
  planPrice: number;
  stripePriceId: string;
  billingPeriodMonths: number;
  // Step 3
  paymentIntentId: string;
  stripeCustomerId: string;
}

interface InscriptionStore {
  currentStep: number;
  completedSteps: number[];
  maxStepReached: number; // ⬅️ AJOUTER
  inscriptionData: InscriptionData;
  
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  
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

export const useInscriptionStore = create<InscriptionStore>((set, get) => ({
  currentStep: 1,
  completedSteps: [],
  maxStepReached: 1, // ⬅️ AJOUTER
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
    inscriptionData: initialData,
  }),
}));