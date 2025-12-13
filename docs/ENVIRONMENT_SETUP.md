# Environment Setup Guide

This guide details how to configure the environment variables required to run LifeHub in development and production.

## Overview

LifeHub uses environment variables to manage configuration and secrets.
- **Frontend**: Variables prefixed with `VITE_` are exposed to the browser.
- **Backend**: Variables are kept private on the server.

> [!WARNING]
> Never commit `.env` files to version control. Use `.env.example` as a template.

## Frontend Configuration

Create a `.env` file in the root directory (same level as `package.json`).

### 1. Firebase Configuration (Required)

You need a Firebase project. Go to [Firebase Console](https://console.firebase.google.com/), create a project, and add a Web App.

From the Project Settings > General > Your apps > SDK setup and configuration:

```ini
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Backend Connection (Required)

Point the frontend to your backend API.

```ini
# Local Development
VITE_API_URL=http://localhost:5000/api

# Production
# VITE_API_URL=https://your-backend-url.com/api
```

### 3. Stripe Payments (Optional for Dev, Required for Prod)

Get your Publishable Key from [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys).

```ini
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Backend Configuration

Create a `.env` file in the `backend/` directory.

### 1. Server Basics

```ini
PORT=5000
NODE_ENV=development # or production
```

### 2. Firebase Admin SDK (Required)

To interact with Firebase from the backend safely.
Go to Project Settings > Service accounts > Generate new private key.

**Option A (Recommended for Local Dev):**
Save the JSON file as `backend/config/firebase-service-account.json`.

```ini
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**Option B (Cloud Deployment):**
Stringify the JSON content and use an environment variable.

```ini
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

### 3. Google Gemini AI (Required for AI features)

Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

```ini
GEMINI_API_KEY=AIzaSy...
```

### 4. Stripe Secrets (Required for Payments)

Get Secret Key and Webhook Secret from Stripe Dashboard.

```ini
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. JWT Configuration (Required)

Generate a secure random string for signing tokens.

```ini
# Generate with: openssl rand -base64 32
JWT_SECRET=your-secure-random-secret
JWT_EXPIRES_IN=7d
```

## Troubleshooting

### "Firebase configuration incomplete" error
Ensure all `VITE_FIREBASE_*` variables are present in your root `.env` file. Restart the Vite server after changing `.env` variables.

### CORS Errors
Ensure `CORS_ORIGINS` in backend `.env` matches your frontend URL.

```ini
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```
