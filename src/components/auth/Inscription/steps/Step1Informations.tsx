'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import { signInWithGoogle, checkEmailExists } from '@/lib/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import ArrowRightIcon from '@/components/Icons/ArrowRightIcon';
import LoaderIcon from '@/components/Icons/LoaderIcon';

import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export function Step1Informations() {
  const { completeStep, setStep1Data } = useInscriptionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    birthday: undefined as Date | undefined,
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.nom) newErrors.nom = 'Nom requis';
    if (!formData.prenom) newErrors.prenom = 'Prénom requis';
    if (!formData.email) newErrors.email = 'Email requis';
    if (!formData.phone) newErrors.phone = 'Téléphone requis';
    if (!formData.birthday) newErrors.birthday = 'Date de naissance requise';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('🔍 Vérification email:', formData.email); // ⬅️ AJOUTER

    // Vérifier si l'email existe déjà
    setIsLoading(true);
    const emailExists = await checkEmailExists(formData.email);
    setIsLoading(false);

    console.log('📧 Email existe ?', emailExists); // ⬅️ AJOUTER

    if (emailExists) {
      console.log('❌ Email déjà utilisé, blocage'); // ⬅️ AJOUTER
      setErrors({ email: 'Cet email est déjà utilisé' });
      return;
    }

    console.log('✅ Email OK, passage à step 2'); // ⬅️ AJOUTER

    // Sauvegarder dans le store
    setStep1Data({
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      phone: formData.phone,
      birthday: formData.birthday,
      password: formData.password,
    });

    console.log('✅ Step 1 data saved');
    completeStep(1);
  };

  const handleGoogleSignIn = async () => {
  setIsLoading(true);
  
  try {
    const result = await signInWithGoogle();
    
    if (result.success && result.user) {
      // ⬅️ AJOUTER : Vérifier si l'email existe déjà
      const emailExists = await checkEmailExists(result.user.email || '');
      
      if (emailExists) {
        setErrors({ email: 'Cet email est déjà utilisé. Connectez-vous plutôt.' });
        setIsLoading(false);
        return;
      }
      
      // Remplir automatiquement les données
      const nameParts = result.user.displayName?.split(' ') || ['', ''];
      
      setStep1Data({
        nom: nameParts[nameParts.length - 1] || '',
        prenom: nameParts[0] || '',
        email: result.user.email || '',
        phone: '',
        birthday: undefined,
        password: '', // Pas de mot de passe pour Google
      });
      
      console.log('✅ Données Google sauvegardées');
      completeStep(1);
    } else {
      setErrors({ email: result.error || 'Erreur lors de la connexion Google' });
    }
  } catch (error) {
    console.error('❌ Google Sign-In error:', error);
    setErrors({ email: 'Erreur lors de la connexion Google' });
  }
  
  setIsLoading(false);
};

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="sub-h4">Démarre ton aventure</h1>
        <p className="text-pretty text-sm text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.</p>
      </div>
      {/* Google Sign-In Button */}
      <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
        <svg className="size-5 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuer avec Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou avec email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom + Prénom */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input id="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} placeholder="John" />
            {errors.nom && <p className="text-xs text-red-600">{errors.nom}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input id="prenom" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} placeholder="Doe" />
            {errors.prenom && <p className="text-xs text-red-600">{errors.prenom}</p>}
          </div>
        </div>

        {/* Email + Téléphone */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="johndoe@gmail.com" />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+336911065" />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>
        </div>

        {/* Date de naissance */}
        <div className="space-y-2">
          <Label>Date de naissance</Label>
          <DatePicker date={formData.birthday} onDateChange={(date) => setFormData({ ...formData, birthday: date })} placeholder="Sélectionner votre date de naissance" />
          {errors.birthday && <p className="text-xs text-red-600">{errors.birthday}</p>}
        </div>

        {/* Mot de passe */}
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="****************" />
          <p className="text-xs text-gray-500">Minimum 6 caractères</p>
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        {/* Submit Button */}
        <Button type="submit" className="w-full shadow-btn rounded-full flex items-center justify-center gap-2" size="lg" variant="default" disabled={isLoading}>
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
