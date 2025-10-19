# Elevate Auth - Next.js Authentication App

## Overview
This is a Next.js 15 application with Firebase authentication and Stripe payment integration. The app has been migrated from Vercel to Replit and is configured to run on the Replit platform.

## Recent Changes
**Date: October 19, 2025**
- Migrated from Vercel to Replit
- Updated package.json scripts to bind to port 5000 with host 0.0.0.0 (Replit requirement)
- Removed Turbopack flags for better compatibility
- Configured deployment settings for autoscale deployment
- All environment variables configured in Replit Secrets

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15.5.6 (App Router)
- **UI**: React 19.1.0, Tailwind CSS 4, Radix UI components
- **Authentication**: Firebase Auth
- **Payments**: Stripe with subscription support
- **State Management**: Zustand
- **Animations**: Motion, Embla Carousel

### Key Features
- User registration and authentication flow
- Multi-step inscription process with payment
- Stripe subscription management
- Firebase authentication integration
- Responsive UI with Tailwind CSS

### Directory Structure
- `/src/app` - Next.js app router pages and API routes
- `/src/components` - React components organized by feature
- `/src/lib` - Utility functions and service configurations
- `/public` - Static assets (fonts, images)

### Environment Variables
All secrets are configured in Replit Secrets:
- Firebase configuration (6 keys)
- Stripe keys (publishable and secret)
- App URL for redirects

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
