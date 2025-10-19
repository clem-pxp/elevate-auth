/**
 * Validation Zod côté client pour les données du formulaire
 */

import { z } from 'zod';

export const Step1Schema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  birthday: z.date({
    message: 'La date de naissance est requise',
  }),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const Step2Schema = z.object({
  planId: z.string().min(1, 'Veuillez sélectionner un plan'),
  planName: z.string().min(1),
  planPrice: z.number().positive(),
  stripePriceId: z.string().min(1),
  billingPeriodMonths: z.number().positive(),
});

export const Step3Schema = z.object({
  stripeCustomerId: z.string().min(1),
  paymentIntentId: z.string().optional(),
});

export const CompleteDataSchema = Step1Schema.merge(Step2Schema).merge(Step3Schema);

export type Step1Data = z.infer<typeof Step1Schema>;
export type Step2Data = z.infer<typeof Step2Schema>;
export type Step3Data = z.infer<typeof Step3Schema>;
export type CompleteData = z.infer<typeof CompleteDataSchema>;
