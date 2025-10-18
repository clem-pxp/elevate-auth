import { 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';




import { auth, db } from './firebase';

interface UserData {
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

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // Vérifier dans Firestore au lieu de Auth
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    const exists = !querySnapshot.empty;
    console.log(`🔍 Email ${email} existe dans Firestore ?`, exists);
    
    return exists;
  } catch (error) {
    console.error('❌ Erreur vérification email:', error);
    return false;
  }
}

export async function createUserAccount(data: UserData, password?: string) {
  try {
    let userId: string;
    
    // Si pas de mot de passe, l'utilisateur vient de Google (déjà connecté)
    if (!password) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }
      userId = currentUser.uid;
      console.log('✅ Utilisateur Google déjà connecté:', userId);
    } else {
      // Créer le compte avec email/password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        password
      );
      userId = userCredential.user.uid;
      console.log('✅ Compte Firebase créé:', userId);
    }

    // Sauvegarder les données dans Firestore
    await setDoc(doc(db, 'users', userId), {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      phone: data.phone,
      birthday: data.birthday?.toISOString() || null,
      planId: data.planId,
      planName: data.planName,
      planPrice: data.planPrice,
      paymentIntentId: data.paymentIntentId,
      authProvider: password ? 'email' : 'google', // ⬅️ AJOUTER
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Données sauvegardées dans Firestore');
    return { success: true, userId };
  } catch (error: any) {
    console.error('❌ Erreur création compte:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Cet email est déjà utilisé';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Le mot de passe est trop faible';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    }

    return { success: false, error: errorMessage };
  }
}


export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    console.log('✅ Google Sign-In réussi:', result.user.uid);
    
    return {
      success: true,
      user: result.user,
    };
  } catch (error: any) {
    console.error('❌ Google Sign-In error:', error);
    
    let errorMessage = 'Erreur lors de la connexion';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Connexion annulée';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'Un compte existe déjà avec cet email';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}