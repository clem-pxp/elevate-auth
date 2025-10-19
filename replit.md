# Elevate Auth - Next.js Authentication App

## Overview
This project is a Next.js 15 application designed for robust user authentication and subscription management. It integrates Firebase for user authentication and Stripe for payment processing, specifically using `Embedded Checkout` for a streamlined user experience. The primary goal is to provide a secure, efficient, and user-friendly platform for managing user accounts and subscriptions, with a focus on stability and code quality.

## User Preferences
I prefer iterative development with small, testable changes. Please ask for confirmation before making any major architectural changes or refactoring large portions of the codebase. I value clear and concise communication, focusing on the impact of changes and proposed solutions. When implementing new features or fixing bugs, prioritize solutions that enhance security and maintainability.

## System Architecture

### UI/UX Decisions
The application utilizes React 19.1.0 with Tailwind CSS 4 and Radix UI components for a responsive and modern user interface. The payment flow is designed as a multi-step inscription process, leveraging Stripe's Embedded Checkout for a seamless, on-site payment experience without redirection.

### Technical Implementations
- **Framework**: Next.js 15.5.6 (App Router)
- **State Management**: Zustand for client-side state.
- **Validation**: Zod for both client-side and server-side schema validation.
- **Error Handling**: Implemented robust error handling with structured logging.
- **Security**: Server-side Stripe price validation prevents payment manipulation.
- **Performance**: Client-side caching for Stripe prices, optimized fetch with retry mechanisms, and race condition protection using `useAsyncLock`.
- **Deployment**: Configured for autoscale deployment on Replit.

### Feature Specifications
- User registration and authentication (Google and Email/Password) via Firebase Auth.
- Multi-step inscription process culminating in payment and account creation.
- Stripe subscription management with server-side price validation.
- Intelligent handling of hard refreshes, resetting the flow to Step 1 to prevent inconsistent states.
- Adaptive behavior for mobile connections, including timeouts for email existence checks to prevent infinite loading.

### System Design Choices
- **Centralized Configuration**: Environment variables, Stripe plans, and constants are centrally managed.
- **Modular Structure**: Code is organized into logical directories (e.g., `app`, `components`, `lib`, `hooks`, `types`) to enhance maintainability.
- **Code Quality**: Emphasis on TypeScript typing, structured logging, and Zod validation across the application to ensure robust and type-safe code.

## External Dependencies
- **Firebase**:
  - Firebase Auth (client-side for user authentication)
  - Firebase Admin (server-side, optional but recommended for API authentication)
- **Stripe**:
  - Stripe Embedded Checkout (for payment processing and subscription management)
  - Stripe Webhooks (for backend synchronization of `checkout.session.completed`, `invoice.paid`, `customer.subscription.*` events)
- **Zod**: Schema validation library.
- **Radix UI**: UI component library.
- **Motion**: Animation library.
- **Embla Carousel**: Carousel component.

## Recent Changes

### October 19, 2025 - Account Linking Automatique pour Google Sign-In ✅
**FEATURE : Permettre la connexion Google pour les comptes email/password existants**

**Besoin Utilisateur** :
- Inscription uniquement avec email/password (pour collecter toutes les infos : nom, prénom, téléphone, date de naissance)
- Connexion possible avec email/password **OU** Google (pour la facilité)
- Pas de doublons Firebase Auth

**Solution - Account Linking Automatique** :

**Flux Utilisateur** :
1. **Inscription** : `clem@pxperfect.studio` + password → UID: `ABC123` → Paie ✅
2. **1ère connexion Google** avec le même email :
   - Détection : UID Google ≠ UID inscrit
   - **Modal apparaît** : "Lier votre compte Google"
   - Demande le mot de passe pour vérifier l'identité
   - Entre mot de passe → **Google lié au compte existant** ✅
3. **Prochaines connexions** : Peut utiliser Google **sans mot de passe** ! 🎉

**Implémentation Technique** :

**1️⃣ auth-service.ts** :
- `signInWithGoogle()` retourne maintenant la `credential` Google
- Nouvelle fonction `linkGoogleToAccount(email, password, googleCredential)` :
  - Se connecte avec email/password (vérification identité)
  - Lie Google au compte existant avec `linkWithCredential()`
  - Gère les erreurs (mot de passe incorrect, provider déjà lié)

**2️⃣ Login.tsx** :
- Détecte quand `googleUid !== registeredUid` (compte existe avec password)
- Affiche modal animé pour demander le mot de passe
- Appelle `linkGoogleToAccount()` pour lier
- Supprime le compte Google temporaire si annulation
- Après liaison → Redirige vers `/compte`

**Fichiers Modifiés :**
- `src/types/index.ts` : AuthResult inclut credential
- `src/lib/auth-service.ts` : signInWithGoogle + linkGoogleToAccount
- `src/components/auth/Login.tsx` : Modal de liaison + gestion du flux

**Code Pattern (linkGoogleToAccount) :**
```typescript
// 1. Vérifier identité avec mot de passe
const signInResult = await signInWithEmailAndPassword(auth, email, password);
// 2. Lier Google au compte existant
const linkResult = await linkWithCredential(signInResult.user, googleCredential);
// 3. L'utilisateur peut maintenant se connecter avec Google !
```

**Avantages** :
- ✅ **Inscription complète** : Toutes les données collectées via email/password
- ✅ **Connexion flexible** : Google OU email/password au choix
- ✅ **Pas de doublons** : Un seul compte par email
- ✅ **Sécurité** : Mot de passe requis pour lier (preuve d'identité)
- ✅ **UX fluide** : Liaison en une seule fois, ensuite Google fonctionne directement

### October 19, 2025 - Protection contre les Comptes Firebase Auth en Double ✅
**FIX CRITIQUE : Empêcher les doublons et l'accès non autorisé via Google Sign-In**

**Problème Principal - Accès gratuit via Google** :
- Utilisateur s'inscrit avec `email@example.com` + password → UID: `ABC123` → **Paie** ✅
- Quelqu'un clique "Connexion avec Google" avec `email@example.com`
- Firebase Auth crée un **NOUVEAU** compte Google → UID: `XYZ789` (différent!)
- Ancien code vérifiait juste si email existe → Trouvait le compte payé
- Donnait accès au **mauvais UID** → **Accès gratuit sans payer** 💥

**Problème Secondaire - Race Condition** :
- Race condition entre Step1 (vérification Firestore) et Step4 (création compte Firebase Auth)
- Firebase Auth peut créer des doublons même avec vérification

**Solution Complète** :

**1️⃣ Protection Connexion Google (Login.tsx)** :
- ✅ Fonction `getUserUidByEmail()` : Récupère le UID Firestore d'un email
- ✅ Après Google Sign-In, compare `UID Google` avec `UID Firestore`
- ✅ Si UID différent → **Supprime compte Google** + Erreur "Ce compte existe avec un mot de passe"
- ✅ Si pas de compte → **Supprime compte Google** + Erreur "Aucun compte trouvé"
- ✅ Si UID identique → Connexion autorisée ✅

**2️⃣ Protection Inscription (Step1 + createUserAccount)** :
- ✅ Fonction `checkEmailExistsInAuth()` : Vérifie Firebase Auth via `fetchSignInMethodsForEmail`
- ✅ Double vérification : Step1 (UX) + createUserAccount() (avant création)
- ✅ Élimination race condition : Vérification JUSTE AVANT `createUserWithEmailAndPassword()`

**Fichiers Modifiés :**
- `src/lib/auth-service.ts` : Ajout getUserUidByEmail, checkEmailExistsInAuth
- `src/components/auth/Login.tsx` : Vérification UID + suppression doublons Google
- `src/components/auth/Inscription/steps/Step1Informations.tsx` : Utilise checkEmailExistsInAuth

**Code Pattern (Login.tsx) :**
```typescript
const googleUid = result.user.uid;
const registeredUid = await getUserUidByEmail(userEmail);

if (googleUid !== registeredUid) {
  // Doublon détecté - Supprimer et bloquer
  await deleteUser(auth.currentUser);
  setErrors({ email: 'Ce compte existe avec un mot de passe.' });
  return;
}
// UID correspond - Accès autorisé
router.push('/compte');
```

**Sécurité** : Seul le UID inscrit (qui a payé) peut accéder à `/compte`.

### October 19, 2025 - Séparation Inscription/Connexion Google ✅
**MODIFICATION : Google Sign-In uniquement pour la connexion, pas l'inscription**

**Changements :**
- ❌ **Suppression Google Sign-In de l'inscription** : Seul email/password reste disponible pour l'inscription
- ✅ **Google Sign-In conservé pour la connexion** : Mais avec vérification que le compte existe déjà
- ✅ **Vérification Firestore** : Avant de permettre la connexion Google, on vérifie que l'utilisateur existe dans Firestore
- ✅ **Message d'erreur clair** : "Aucun compte trouvé. Créez d'abord un compte avec votre email."

**Fichiers Modifiés :**
- `src/components/auth/Inscription/steps/Step1Informations.tsx` : Suppression bouton Google + fonction handleGoogleSignIn
- `src/components/auth/Login.tsx` : Ajout checkEmailExists avant connexion Google

**Code Pattern (Login.tsx) :**
```typescript
const result = await signInWithGoogle();
if (result.success && result.user) {
  const accountExists = await checkEmailExists(result.user.email || '');
  if (!accountExists) {
    setErrors({ email: 'Aucun compte trouvé. Créez d\'abord un compte avec votre email.' });
    return;
  }
  router.push('/compte');
}
```

**Avantages :**
- ✅ **Données complètes** : Tous les comptes ont nom, prénom, téléphone, date de naissance
- ✅ **Pas de doublons** : Un seul compte par email
- ✅ **Google = méthode alternative** : Connexion rapide pour utilisateurs existants
- ✅ **Pas de comptes incomplets** : Inscription force la collecte de toutes les infos

### October 19, 2025 - Login/Connexion Implementation ✅
**AJOUT : Page de connexion complète avec email/password et Google Sign-In**

**Fonctionnalités Ajoutées :**
- ✅ **Fonction signInWithEmail** dans auth-service.ts pour connexion email/password
- ✅ **LoginSchema** Zod pour validation du formulaire de connexion
- ✅ **Composant Login** avec le même style que Step1Informations
- ✅ **Google Sign-In** pour connexion rapide
- ✅ **Gestion d'erreurs** Firebase avec messages français appropriés
- ✅ **Redirection automatique** vers /compte après connexion réussie

**Fichiers Créés/Modifiés :**
- `src/lib/constants.ts` : Ajout codes erreur Firebase (USER_NOT_FOUND, WRONG_PASSWORD, INVALID_CREDENTIAL)
- `src/lib/auth-service.ts` : Fonction signInWithEmail avec gestion erreurs
- `src/lib/client-validation.ts` : LoginSchema pour validation formulaire
- `src/components/auth/Login.tsx` : Composant de connexion complet
- `src/app/auth/connexion/page.tsx` : Intégration du composant Login

**Code Pattern (Login.tsx) :**
```typescript
const result = await signInWithEmail(formData.email, formData.password);
if (result.success) {
  router.push('/compte');
} else {
  setErrors({ email: result.error || 'Erreur lors de la connexion' });
}
```

**Avantages :**
- ✅ **UX cohérente** : Même style que le formulaire d'inscription
- ✅ **Sécurisé** : Validation Zod + gestion erreurs Firebase
- ✅ **Accessible** : Email/password + Google Sign-In
- ✅ **Mobile-friendly** : Responsive design avec Motion animations