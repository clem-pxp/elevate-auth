import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

import { auth, db } from './firebase';
import { logger } from './logger';
import { FIREBASE_ERROR_CODES } from './constants';
import type { UserData, AuthResult, CreateAccountResult } from '@/types';

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    const exists = !querySnapshot.empty;
    logger.debug('Email check', { email, exists });
    
    return exists;
  } catch (error) {
    logger.error('Error checking email', error);
    return false;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    logger.info('Email Sign-In successful', { uid: result.user.uid });
    
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      },
    };
  } catch (error) {
    logger.error('Email Sign-In error', error);
    
    let errorMessage = 'Erreur lors de la connexion';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string };
      
      if (firebaseError.code === FIREBASE_ERROR_CODES.USER_NOT_FOUND || 
          firebaseError.code === FIREBASE_ERROR_CODES.WRONG_PASSWORD ||
          firebaseError.code === FIREBASE_ERROR_CODES.INVALID_CREDENTIAL) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (firebaseError.code === FIREBASE_ERROR_CODES.INVALID_EMAIL) {
        errorMessage = 'Email invalide';
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    logger.info('Google Sign-In successful', { uid: result.user.uid });
    
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      },
    };
  } catch (error) {
    logger.error('Google Sign-In error', error);
    
    let errorMessage = 'Erreur lors de la connexion';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string };
      
      if (firebaseError.code === FIREBASE_ERROR_CODES.POPUP_CLOSED) {
        errorMessage = 'Connexion annulée';
      } else if (firebaseError.code === FIREBASE_ERROR_CODES.ACCOUNT_EXISTS) {
        errorMessage = 'Un compte existe déjà avec cet email';
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function createUserAccount(
  data: UserData, 
  password?: string
): Promise<CreateAccountResult> {
  try {
    let userId: string;
    
    if (!password) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }
      userId = currentUser.uid;
      logger.debug('Google user already connected', { userId });
    } else {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        password
      );
      userId = userCredential.user.uid;
      logger.info('Firebase account created', { userId });
    }

    // Gérer birthday (peut être Date ou string depuis localStorage)
    let birthdayISO = null;
    if (data.birthday) {
      if (typeof data.birthday === 'string') {
        birthdayISO = data.birthday;
      } else if (data.birthday instanceof Date) {
        birthdayISO = data.birthday.toISOString();
      }
    }

    await setDoc(doc(db, 'users', userId), {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      phone: data.phone,
      birthday: birthdayISO,
      planId: data.planId,
      planName: data.planName,
      planPrice: data.planPrice,
      paymentIntentId: data.paymentIntentId,
      authProvider: password ? 'email' : 'google',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    logger.info('User data saved to Firestore', { userId });
    return { success: true, userId };
  } catch (error) {
    logger.error('Error creating account', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string };
      
      if (firebaseError.code === FIREBASE_ERROR_CODES.EMAIL_IN_USE) {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (firebaseError.code === FIREBASE_ERROR_CODES.WEAK_PASSWORD) {
        errorMessage = 'Le mot de passe est trop faible';
      } else if (firebaseError.code === FIREBASE_ERROR_CODES.INVALID_EMAIL) {
        errorMessage = 'Email invalide';
      }
    }

    return { success: false, error: errorMessage };
  }
}