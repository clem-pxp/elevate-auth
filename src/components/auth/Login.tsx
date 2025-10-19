'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { signInWithEmail, signInWithGoogle, checkEmailExists } from '@/lib/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ArrowRightIcon from '@/components/Icons/ArrowRightIcon';
import LoaderIcon from '@/components/Icons/LoaderIcon';
import { LoginSchema } from '@/lib/client-validation';

export function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = LoginSchema.safeParse(formData);
    
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
    const result = await signInWithEmail(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      router.push('/compte');
    } else {
      setErrors({ email: result.error || 'Erreur lors de la connexion' });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success && result.user) {
        // Vérifier que le compte existe dans Firestore
        const accountExists = await checkEmailExists(result.user.email || '');
        
        if (!accountExists) {
          setErrors({ email: 'Aucun compte trouvé. Créez d\'abord un compte avec votre email.' });
          setIsLoading(false);
          return;
        }
        
        router.push('/compte');
      } else {
        setErrors({ email: result.error || 'Erreur lors de la connexion Google' });
      }
    } catch (error) {
      setErrors({ email: 'Erreur lors de la connexion Google' });
    }
    
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="sub-h4">Bon retour parmi nous !</h1>
        <p className="text-pretty text-sm text-gray-600">Entrez vos identifiants pour accéder à votre compte.</p>
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
          <span className="bg-white px-4 text-gray-500">ou</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            placeholder="exemple@email.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setErrors({ ...errors, email: '' });
            }}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setErrors({ ...errors, password: '' });
            }}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <LoaderIcon className="size-5 animate-spin" />
          ) : (
            <>
              Se connecter
              <ArrowRightIcon className="ml-2 size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Link to Registration */}
      <div className="text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <a href="/auth/inscription" className="font-medium text-primary hover:underline">
          Créer un compte
        </a>
      </div>
    </motion.div>
  );
}
