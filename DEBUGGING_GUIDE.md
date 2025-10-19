# Guide de Debugging - Portail Stripe

## Problème : Le bouton "Gérer mon abonnement" ne redirige pas

### 🔍 Étapes de Diagnostic

#### 1. Vérifier les Logs Console du Navigateur

Ouvrez la console (F12 → Console) et cliquez sur "Gérer mon abonnement". Vous devriez voir :

```
🔍 handleManageSubscription called
📦 userData: {nom: "...", prenom: "...", stripeCustomerId: "cus_...", ...}
🎫 stripeCustomerId: cus_xxxxxxxxxxxxx
📡 Calling /api/create-portal-session with customerId: cus_xxxxxxxxxxxxx
✅ Portal session response: {url: "https://billing.stripe.com/..."}
🚀 Opening portal URL: https://billing.stripe.com/...
```

#### 2. Identifier le Problème

**Cas A : `stripeCustomerId` est manquant**
```
🔍 handleManageSubscription called
📦 userData: {...}
🎫 stripeCustomerId: undefined  ❌
❌ Missing stripeCustomerId in userData
```

**Solution :** Le `stripeCustomerId` n'a pas été sauvegardé après le paiement.
- Vérifiez les logs lors du retour de Stripe (après Step 3)
- Cherchez : `✅ Checkout session complete: {customer_id: "cus_xxx"}`
- Si absent, le problème vient de l'API `/api/checkout-status`

---

**Cas B : Erreur API**
```
🔍 handleManageSubscription called
📦 userData: {...}
🎫 stripeCustomerId: cus_xxxxxxxxxxxxx
📡 Calling /api/create-portal-session with customerId: cus_xxxxxxxxxxxxx
❌ Portal session error: FetchError: 500 Internal Server Error
```

**Solution :** Erreur côté serveur.
- Allez dans les logs Vercel (Deployments → Votre déploiement → Functions)
- Cherchez les erreurs dans `/api/create-portal-session`
- Vérifiez que `STRIPE_SECRET_KEY` est configurée dans Vercel

---

**Cas C : Pop-up bloquée**
```
🔍 handleManageSubscription called
📦 userData: {...}
🎫 stripeCustomerId: cus_xxxxxxxxxxxxx
📡 Calling /api/create-portal-session with customerId: cus_xxxxxxxxxxxxx
✅ Portal session response: {url: "https://billing.stripe.com/..."}
🚀 Opening portal URL: https://billing.stripe.com/...
```

**Mais rien ne s'ouvre** → Le navigateur bloque les pop-ups.

**Solution :**
1. Vérifier la barre d'adresse du navigateur (icône pop-up bloquée)
2. Autoriser les pop-ups pour votre domaine
3. Ou modifier le code pour ouvrir dans le même onglet :
   ```typescript
   window.location.href = data.url; // Au lieu de window.open
   ```

---

**Cas D : CORS ou Network Error**
```
🔍 handleManageSubscription called
📦 userData: {...}
🎫 stripeCustomerId: cus_xxxxxxxxxxxxx
📡 Calling /api/create-portal-session with customerId: cus_xxxxxxxxxxxxx
❌ Portal session error: TypeError: Failed to fetch
```

**Solution :**
- Ouvrir F12 → Network
- Chercher la requête POST `/api/create-portal-session`
- Vérifier le statut (200, 404, 500, etc.)
- Lire la réponse pour voir l'erreur exacte

### 🛠️ Vérifications Supplémentaires

#### Vérifier les Variables d'Environnement Vercel
1. Aller sur Vercel → Votre projet → Settings → Environment Variables
2. Vérifier que ces secrets existent :
   - `STRIPE_SECRET_KEY` (commence par `sk_live_` ou `sk_test_`)
   - `NEXT_PUBLIC_APP_URL` (votre URL de production)

#### Vérifier les Logs Serveur Vercel
1. Vercel Dashboard → Deployments → [Votre déploiement]
2. Cliquer sur "Functions" ou "Runtime Logs"
3. Filtrer par `/api/create-portal-session`
4. Lire les erreurs détaillées

#### Tester l'API Directement
Utilisez cURL ou Postman pour tester l'API :

```bash
curl -X POST https://elevate-auth.vercel.app/api/create-portal-session \
  -H "Content-Type: application/json" \
  -d '{"customerId": "cus_xxxxxxxxxxxxx"}'
```

Réponse attendue :
```json
{
  "url": "https://billing.stripe.com/p/session/test_xxxxxxxxxxxxx"
}
```

### 📝 Mode Debug en Développement

En local, vous pouvez voir un panel de debug en bas de la page Step 4 :

```
Debug Info (dev only) ▼
{
  "stripeCustomerId": "cus_xxxxxxxxxxxxx",
  "paymentIntentId": "sub_xxxxxxxxxxxxx",
  "email": "user@example.com",
  "planId": "essential"
}
```

Cliquez dessus pour vérifier que toutes les données sont présentes.

### ✅ Checklist de Résolution

- [ ] Les logs console s'affichent bien
- [ ] `stripeCustomerId` est présent et valide (commence par `cus_`)
- [ ] L'API `/api/create-portal-session` retourne une URL
- [ ] Les pop-ups sont autorisées dans le navigateur
- [ ] Les variables d'environnement Vercel sont configurées
- [ ] Les logs serveur Vercel ne montrent pas d'erreurs

### 🚀 Solution Alternative

Si le problème persiste, vous pouvez ouvrir le portail dans le même onglet au lieu d'un nouvel onglet :

**Fichier :** `src/components/auth/Inscription/steps/Step4Confirmation.tsx`

```typescript
// Remplacer cette ligne :
window.open(data.url, '_blank', 'noopener,noreferrer');

// Par :
window.location.href = data.url;
```

Cela évitera les problèmes de pop-ups bloquées, mais l'utilisateur quittera temporairement votre site.
