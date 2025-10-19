export interface UserData {
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  birthday: Date | undefined;
  planId: string;
  planName: string;
  planPrice: number;
  paymentIntentId: string;
}

export interface InscriptionData extends UserData {
  password: string;
  stripePriceId: string;
  billingPeriodMonths: number;
  stripeCustomerId: string;
}

export interface StripePriceData {
  id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  productName: string;
  productId: string;
}

export interface AuthResult {
  success: boolean;
  user?: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  credential?: any;
  error?: string;
}

export interface CreateAccountResult {
  success: boolean;
  userId?: string;
  error?: string;
}
