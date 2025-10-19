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