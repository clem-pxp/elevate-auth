'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { checkEmailExists } from '@/lib/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import ArrowRightIcon from '@/components/Icons/ArrowRightIcon';
import LoaderIcon from '@/components/Icons/LoaderIcon';
import { VALIDATION_MESSAGES, PASSWORD_MIN_LENGTH } from '@/lib/constants';
import { Step1Schema } from '@/lib/client-validation';


export function Step1Informations() {
  const { completeStep, setStep1Data, accountCreated, getInscriptionData } = useInscriptionStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Si le compte est créé, charger les données du store
  const savedData = accountCreated ? getInscriptionData() : null;
  
  const [formData, setFormData] = useState({
    nom: savedData?.nom || '',
    prenom: savedData?.prenom || '',
    email: savedData?.email || '',
    phone: savedData?.phone || '',
    birthday: savedData?.birthday || (undefined as Date | undefined),
    password: savedData?.password || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation avec Zod
    const validation = Step1Schema.safeParse(formData);
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const emailExists = await checkEmailExists(formData.email);
    setIsLoading(false);

    if (emailExists) {
      setErrors({ email: VALIDATION_MESSAGES.EMAIL_EXISTS });
      return;
    }

    setStep1Data({
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      phone: formData.phone,
      birthday: formData.birthday,
      password: formData.password,
    });

    completeStep(1);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="sub-h4">Démarre ton aventure</h1>
        <p className="text-pretty text-sm text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.</p>
        {accountCreated && (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            ℹ️ Votre compte est créé. Ces informations ne peuvent plus être modifiées.
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom + Prénom */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input id="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} placeholder="John" disabled={accountCreated} />
            {errors.nom && <p className="text-xs text-red-600">{errors.nom}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input id="prenom" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} placeholder="Doe" disabled={accountCreated} />
            {errors.prenom && <p className="text-xs text-red-600">{errors.prenom}</p>}
          </div>
        </div>

        {/* Email + Téléphone */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="johndoe@gmail.com" disabled={accountCreated} />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+336911065" disabled={accountCreated} />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>
        </div>

        {/* Date de naissance */}
        <div className="space-y-2">
          <Label>Date de naissance</Label>
          <DatePicker date={formData.birthday} onDateChange={(date) => setFormData({ ...formData, birthday: date })} placeholder="Sélectionner votre date de naissance" disabled={accountCreated} />
          {errors.birthday && <p className="text-xs text-red-600">{errors.birthday}</p>}
        </div>

        {/* Mot de passe */}
        {!accountCreated && (
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="****************" />
            <p className="text-xs text-gray-500">Minimum {PASSWORD_MIN_LENGTH} caractères</p>
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          </div>
        )}

        {/* Submit Button */}
        {/* Submit Button */}
        <Button type="submit" className="w-full shadow-btn rounded-full flex items-center justify-center gap-2" size="lg" variant="default" disabled={isLoading || accountCreated}>
          {isLoading ? (
            <>
              <LoaderIcon className="size-4 animate-spin" />
              <span className="font-450 text-lg leading-tight">Vérification...</span>
            </>
          ) : (
            <>
              <span className="font-450 text-lg leading-tight">Créer mon compte</span>
              <ArrowRightIcon className="size-4 mt-0.5" />
            </>
          )}
        </Button>

        {/* Lien connexion */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <a href="/auth/connexion" className="font-bold text-violet-600 hover:underline">
              Connexion
            </a>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
