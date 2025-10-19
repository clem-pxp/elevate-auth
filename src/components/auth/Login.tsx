'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { deleteUser } from 'firebase/auth';
import { signInWithEmail, signInWithGoogle, getUserUidByEmail, linkGoogleToAccount } from '@/lib/auth-service';
import { auth } from '@/lib/firebase';
import { logger } from '@/lib/logger';
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
  
  // État pour le modal de liaison Google
  const [linkModal, setLinkModal] = useState<{
    show: boolean;
    email: string;
    credential: any;
    googleUid: string;
  }>({
    show: false,
    email: '',
    credential: null,
    googleUid: '',
  });
  const [linkPassword, setLinkPassword] = useState('');
  const [linkError, setLinkError] = useState('');

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
        const userEmail = result.user.email || '';
        const googleUid = result.user.uid;
        
        // Récupérer le UID du compte inscrit dans Firestore
        const registeredUid = await getUserUidByEmail(userEmail);
        
        if (!registeredUid) {
          // Aucun compte inscrit avec cet email - supprimer le compte Google créé
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              await deleteUser(currentUser);
              logger.info('Deleted Google account - no registered account found', { 
                email: userEmail,
                googleUid 
              });
            } catch (deleteError) {
              logger.error('Failed to delete Google account', deleteError);
            }
          }
          
          setErrors({ email: 'Aucun compte trouvé. Créez d\'abord un compte avec votre email.' });
          setIsLoading(false);
          return;
        }
        
        // Vérifier que le UID Google correspond au UID inscrit
        if (googleUid !== registeredUid) {
          // Compte existe avec email/password - proposer de lier Google
          logger.info('Account exists with password, prompting to link Google', {
            email: userEmail,
            googleUid,
            registeredUid
          });
          
          // Afficher le modal pour lier le compte
          setLinkModal({
            show: true,
            email: userEmail,
            credential: result.credential,
            googleUid,
          });
          
          setIsLoading(false);
          return;
        }
        
        // UID correspond - connexion autorisée
        router.push('/compte');
      } else {
        setErrors({ email: result.error || 'Erreur lors de la connexion Google' });
      }
    } catch (error) {
      setErrors({ email: 'Erreur lors de la connexion Google' });
    }
    
    setIsLoading(false);
  };
  
  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLinkError('');
    
    try {
      // Supprimer d'abord le compte Google temporaire
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === linkModal.googleUid) {
        await deleteUser(currentUser);
        logger.info('Deleted temporary Google account before linking', { uid: linkModal.googleUid });
      }
      
      // Lier Google au compte existant
      const linkResult = await linkGoogleToAccount(
        linkModal.email,
        linkPassword,
        linkModal.credential
      );
      
      if (linkResult.success) {
        logger.info('Google account linked successfully', { email: linkModal.email });
        
        // Fermer le modal et rediriger
        setLinkModal({ show: false, email: '', credential: null, googleUid: '' });
        setLinkPassword('');
        router.push('/compte');
      } else {
        setLinkError(linkResult.error || 'Erreur lors de la liaison');
      }
    } catch (error) {
      logger.error('Error in handleLinkAccount', error);
      setLinkError('Erreur lors de la liaison du compte');
    }
    
    setIsLoading(false);
  };
  
  const handleCancelLink = async () => {
    // Supprimer le compte Google créé
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === linkModal.googleUid) {
      try {
        await deleteUser(currentUser);
        logger.info('Deleted Google account - linking cancelled', { uid: linkModal.googleUid });
      } catch (error) {
        logger.error('Failed to delete Google account on cancel', error);
      }
    }
    
    setLinkModal({ show: false, email: '', credential: null, googleUid: '' });
    setLinkPassword('');
    setLinkError('');
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
      
      {/* Modal de liaison Google */}
      <AnimatePresence>
        {linkModal.show && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleCancelLink}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Lier votre compte Google</h2>
                  <p className="text-sm text-gray-600">
                    Ce compte existe déjà avec un mot de passe. Pour pouvoir vous connecter avec Google, entrez votre mot de passe pour lier les deux comptes.
                  </p>
                </div>
                
                <form onSubmit={handleLinkAccount} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link-email">Email</Label>
                    <Input
                      id="link-email"
                      type="email"
                      value={linkModal.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="link-password">Mot de passe</Label>
                    <Input
                      id="link-password"
                      type="password"
                      placeholder="Entrez votre mot de passe"
                      value={linkPassword}
                      onChange={(e) => {
                        setLinkPassword(e.target.value);
                        setLinkError('');
                      }}
                      autoFocus
                      className={linkError ? 'border-red-500' : ''}
                    />
                    {linkError && <p className="text-sm text-red-500">{linkError}</p>}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancelLink}
                      disabled={isLoading}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading || !linkPassword}
                    >
                      {isLoading ? (
                        <LoaderIcon className="size-5 animate-spin" />
                      ) : (
                        'Lier et continuer'
                      )}
                    </Button>
                  </div>
                </form>
                
                <p className="text-xs text-gray-500 text-center">
                  Après cette liaison, vous pourrez vous connecter avec Google ou votre email/mot de passe.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
