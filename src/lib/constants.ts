export const PASSWORD_MIN_LENGTH = 6;

export const VALIDATION_MESSAGES = {
  REQUIRED: {
    nom: 'Nom requis',
    prenom: 'Prénom requis',
    email: 'Email requis',
    phone: 'Téléphone requis',
    birthday: 'Date de naissance requise',
    password: 'Mot de passe requis',
  },
  PASSWORD_TOO_SHORT: `Minimum ${PASSWORD_MIN_LENGTH} caractères`,
  EMAIL_EXISTS: 'Cet email est déjà utilisé',
  EMAIL_EXISTS_LOGIN: 'Cet email est déjà utilisé. Connectez-vous plutôt.',
  GOOGLE_ERROR: 'Erreur lors de la connexion Google',
} as const;

export const FIREBASE_ERROR_CODES = {
  EMAIL_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  INVALID_EMAIL: 'auth/invalid-email',
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  ACCOUNT_EXISTS: 'auth/account-exists-with-different-credential',
} as const;

export const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#1a2e2c',
    colorBackground: '#ffffff',
    colorText: '#0a0a0a',
    colorDanger: '#ef4444',
    fontFamily: 'Geist, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '10px',
    fontSizeBase: '16px',
  },
  rules: {
    '.Input': {
      border: '0.5px solid #e5e7eb',
      boxShadow: '0px 0px 0px 1px rgba(9, 23, 78, 0.04), 0px 1px 1px -0.5px rgba(9, 23, 78, 0.04)',
      padding: '12px',
    },
    '.Input:focus': {
      border: '1px solid #1a2e2c',
      boxShadow: '0 0 0 3px rgba(26, 46, 44, 0.1)',
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    '.Tab': {
      border: 'none',
      padding: '12px',
    },
    '.TabLabel': {
      fontWeight: '500',
    },
  },
} as const;
