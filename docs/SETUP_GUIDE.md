# LifeHub Complete Setup Guide

This guide provides step-by-step instructions to set up LifeHub from scratch, including subscription model and deployment to production.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Firebase Configuration](#firebase-configuration)
3. [Stripe Setup](#stripe-setup)
4. [Local Development](#local-development)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Mobile App Setup](#mobile-app-setup)
8. [Production Checklist](#production-checklist)

---

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/yourusername/lifehub.git
cd lifehub

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
# We'll fill this in as we go through each service
```

---

## Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Project name: **LifeHub**
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable sign-in methods:
   - ✅ Email/Password
   - ✅ Google (optional)
4. Click "Save"

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose location (closest to your users)
5. Click "Enable"

### 4. Get Firebase Config (Frontend)

1. Go to **Project settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon (</>) to add web app
4. App nickname: **LifeHub Web**
5. Copy the config object

Add to `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=lifehub-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lifehub-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=lifehub-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 5. Generate Service Account (Backend)

1. Go to **Project settings** → **Service accounts**
2. Click "Generate new private key"
3. Save as `backend/config/firebase-service-account.json`
4. **NEVER commit this file to Git!**

Add to `.env`:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
FIREBASE_PROJECT_ID=lifehub-xxxxx
```

### 6. Deploy Security Rules

Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{collection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

---

## Stripe Setup

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for account
3. Complete business verification

### 2. Create Products

1. In Stripe Dashboard, go to **Products**
2. Click "Add product"
3. Create **LifeHub Pro Monthly**:
   - Name: LifeHub Pro
   - Price: $9.99/month
   - Copy Price ID: `price_xxxxx`
4. Create **LifeHub Pro Yearly**:
   - Price: $99.99/year
   - Copy Price ID: `price_yyyyy`

### 3. Get API Keys

1. Go to **Developers** → **API keys**
2. Copy **Publishable key** (pk_test_...)
3. Reveal and copy **Secret key** (sk_test_...)

Add to `.env`:
```env
# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Backend
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRICE_ID_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_PRO_YEARLY=price_yyyyy
```

### 4. Set Up Webhooks (Local Development)

```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:5000/api/webhook/stripe
```

Copy the webhook signing secret and add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Local Development

### 1. Set Remaining Environment Variables

Add to `.env`:
```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# Backend
NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:3000,capacitor://localhost

# Frontend
VITE_API_URL=http://localhost:5000/api
```

### 2. Start Development Servers

**Option A: Docker Compose**

```bash
docker-compose up
```

**Option B: Manual**

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Stripe webhooks
stripe listen --forward-to localhost:5000/api/webhook/stripe
```

### 3. Test the Application

1. Open http://localhost:3000
2. Sign up for account
3. Create a task
4. Test subscription flow with test card: `4242 4242 4242 4242`
5. Verify webhook events in Stripe CLI

---

## Backend Deployment

### Option 1: Google Cloud Run

```bash
# Install Google Cloud SDK
# Follow instructions at: https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_FIREBASE_PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/lifehub-backend
gcloud run deploy lifehub-backend \
  --image gcr.io/YOUR_PROJECT_ID/lifehub-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,GEMINI_API_KEY=$GEMINI_API_KEY,STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,JWT_SECRET=$JWT_SECRET"

# Get backend URL
gcloud run services describe lifehub-backend --region us-central1 --format 'value(status.url)'
```

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select backend directory
4. Add environment variables
5. Deploy automatically

### Set Up Production Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-backend-url.com/api/webhook/stripe`
3. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
4. Copy signing secret and add to production environment

---

## Frontend Deployment

### Option 1: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or connect GitHub repository in Vercel dashboard.

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Update Environment Variables

In your deployment platform (Vercel/Netlify):

1. Add all `VITE_*` variables
2. Update `VITE_API_URL` to production backend URL
3. Use production Firebase config
4. Use production Stripe publishable key

---

## Mobile App Setup

### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

### 2. Initialize Capacitor

```bash
npx cap init
```

Enter:
- App name: **LifeHub**
- App ID: **com.lifehub.app** (use your domain)
- Web directory: **dist**

### 3. Add Platforms

```bash
# Build web app first
npm run build

# Add platforms
npx cap add ios
npx cap add android
```

### 4. Configure for Mobile

Update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifehub.app',
  appName: 'LifeHub',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
};

export default config;
```

### 5. Build and Open

**iOS:**
```bash
npm run build:ios
# Opens Xcode
```

**Android:**
```bash
npm run build:android
# Opens Android Studio
```

See [docs/MOBILE_DEPLOYMENT.md](./docs/MOBILE_DEPLOYMENT.md) for app store submission.

---

## Production Checklist

### Security

- [ ] Change all default secrets (JWT_SECRET, etc.)
- [ ] Use production API keys (Stripe, Firebase)
- [ ] Enable HTTPS everywhere
- [ ] Set up CORS properly
- [ ] Review Firestore security rules
- [ ] Enable rate limiting

### Monitoring

- [ ] Set up Sentry for error tracking
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Enable Firebase Analytics
- [ ] Monitor Stripe dashboard

### Testing

- [ ] Test signup/login flow
- [ ] Test subscription creation
- [ ] Test webhook events
- [ ] Test mobile apps on real devices
- [ ] Test payment failure scenarios
- [ ] Load test API endpoints

### Legal & Compliance

- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Add Refund Policy
- [ ] GDPR compliance (if applicable)
- [ ] Cookie consent (if applicable)

### Documentation

- [ ] Update README with production URLs
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Write troubleshooting guide
- [ ] Document deployment process

### App Store Preparation

- [ ] Prepare app icons (all sizes)
- [ ] Create screenshots
- [ ] Write app descriptions
- [ ] Set up in-app purchases
- [ ] Create demo account
- [ ] Submit for review

---

## Next Steps

1. **Launch Beta**: Deploy to production and invite beta testers
2. **Collect Feedback**: Use Firebase Analytics and user feedback
3. **Iterate**: Fix bugs and add features based on feedback
4. **Marketing**: Prepare launch campaign
5. **App Store Launch**: Submit to iOS App Store and Google Play
6. **Monitor**: Watch metrics and respond to issues
7. **Scale**: Optimize performance as user base grows

---

## Common Issues

### "Firebase not initialized"
- Check service account JSON path
- Verify environment variables are set

### "Stripe webhook signature verification failed"
- Ensure webhook secret matches
- Check raw body parsing in Express

### "CORS error"
- Add frontend URL to CORS_ORIGINS
- Include capacitor:// scheme for mobile

### "JWT token expired"
- Implement token refresh logic
- Check JWT_EXPIRES_IN setting

---

## Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@lifehub.app

---

**Congratulations!** You now have a production-ready, subscription-based mobile application! 🎉
