# Elevate Auth - Next.js Authentication App

## Overview
This is a Next.js 15 application with Firebase authentication and Stripe payment integration. The app has been migrated from Vercel to Replit with security hardening and code quality improvements.

## Recent Changes

### October 19, 2025 - Stripe Webhook Integration
**WEBHOOK CONFIGURED ✅:**
- ✅ Stripe webhook endpoint implemented (`/api/webhook/stripe`)
- ✅ Handles `payment_intent.succeeded` and `invoice.payment_succeeded` events
- ✅ Robust subscription payment flow with invoice finalization
- ✅ STRIPE_WEBHOOK_SECRET configured in Replit Secrets
- ✅ Customer portal opens in new tab (fixed iframe blocking issue)

**Payment Flow:**
1. User selects a subscription plan
2. Stripe subscription created with automatic PaymentIntent generation
3. If PaymentIntent not auto-created, invoice is finalized to force creation
4. Payment confirmed via Stripe Elements
5. Webhook receives confirmation and synchronizes payment status
6. Invoice marked as paid ✅

**Webhook Configuration:**
- URL: `https://[YOUR-REPLIT-URL].replit.dev/api/webhook/stripe`
- Events listened: `payment_intent.succeeded`, `invoice.payment_succeeded`
- Secret stored as: `STRIPE_WEBHOOK_SECRET`

### October 19, 2025 - Security & Code Quality Improvements
**CRITICAL SECURITY FIXES:**
- ✅ Secured Stripe payment endpoints - server now validates all pricing (prevents payment manipulation)
- ✅ Added Zod schema validation on all API routes
- ⚠️ **TODO**: Add Firebase Admin authentication to API routes (requires FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY secrets)

**Code Quality Improvements:**
- ✅ Centralized environment variable management (src/lib/env.ts)
- ✅ Structured logging system (src/lib/logger.ts) - no more console.logs in production
- ✅ Centralized Stripe plans configuration (src/lib/plans-config.ts)
- ✅ Shared TypeScript types (src/types/index.ts)
- ✅ Constants for validation messages (src/lib/constants.ts)
- ✅ Fixed Zustand store reset bug (maxStepReached was missing)
- ✅ Eliminated all @ts-ignore with proper typing
- ✅ Improved error handling throughout the app

**Package Updates:**
- ✅ Added Zod for schema validation
- ✅ Added firebase-admin (configured but needs secrets)

### October 19, 2025 - Replit Migration
- Migrated from Vercel to Replit
- Updated package.json scripts to bind to port 5000 with host 0.0.0.0
- Removed Turbopack flags for better compatibility
- Configured deployment settings for autoscale deployment
- All environment variables configured in Replit Secrets

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15.5.6 (App Router)
- **UI**: React 19.1.0, Tailwind CSS 4, Radix UI components
- **Authentication**: Firebase Auth (client-side) + Firebase Admin (server-side - to be configured)
- **Payments**: Stripe with subscription support
- **State Management**: Zustand
- **Validation**: Zod
- **Animations**: Motion, Embla Carousel

### Key Features
- User registration and authentication flow (Google + Email/Password)
- Multi-step inscription process with payment validation
- Stripe subscription management with server-side price validation
- Firebase authentication integration
- Responsive UI with Tailwind CSS

### Directory Structure
- `/src/app` - Next.js app router pages and API routes
- `/src/components` - React components organized by feature
- `/src/lib` - Utility functions, service configurations, and shared logic
  - `env.ts` - Centralized environment variable management
  - `logger.ts` - Structured logging system
  - `plans-config.ts` - Stripe plans configuration
  - `constants.ts` - Shared constants and validation messages
  - `validation.ts` - Zod schemas for API validation
  - `firebase.ts` - Firebase client SDK
  - `firebase-admin.ts` - Firebase Admin SDK (needs configuration)
  - `auth-service.ts` - Authentication utilities
  - `auth-middleware.ts` - API authentication middleware (needs configuration)
  - `stripe.ts` - Stripe client and server setup
- `/src/types` - Shared TypeScript types
- `/public` - Static assets (fonts, images)

### Environment Variables
All secrets are configured in Replit Secrets:
- **Firebase Client** (6 keys): For client-side authentication
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID
  
- **Firebase Admin** (2 keys - OPTIONAL but RECOMMENDED for API authentication):
  - FIREBASE_CLIENT_EMAIL
  - FIREBASE_PRIVATE_KEY

- **Stripe** (3 keys):
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET

- **App Configuration**:
  - NEXT_PUBLIC_APP_URL

## Security Notes

### Current State
✅ **IMPLEMENTED:**
- Server-side Stripe price validation (cannot manipulate payment amounts)
- Zod schema validation on all API inputs
- Proper error handling with logging
- Type-safe code throughout

⚠️ **RECOMMENDED (Optional):**
- Add Firebase Admin authentication to API routes to verify user tokens
  - Requires: FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY secrets
  - Prevents: Unauthenticated users from calling payment APIs
  - Files ready: `src/lib/firebase-admin.ts` and `src/lib/auth-middleware.ts`

### To Enable Full API Authentication
1. Get Firebase Admin credentials from Firebase Console → Project Settings → Service Accounts
2. Add to Replit Secrets:
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY (must include \\n for line breaks)
3. Uncomment authentication checks in API routes (marked with // TODO: Add auth)

## Development

### Running Locally
```bash
npm run dev
```
Server runs on http://0.0.0.0:5000

### Building for Production
```bash
npm run build
npm run start
```

## Deployment
Configured for autoscale deployment on Replit. The app will automatically build and deploy when published.

## Code Quality Standards
- ✅ No console.log in production (use logger instead)
- ✅ All constants centralized
- ✅ Proper TypeScript typing (no any, no @ts-ignore)
- ✅ Server-side validation with Zod
- ✅ Environment variables managed centrally
- ✅ Error handling with structured logging
