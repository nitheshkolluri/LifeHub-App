# LifeHub Deployment Guide

This comprehensive guide covers deploying all components of LifeHub to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Firebase project created
- [ ] Stripe account set up (see [PAYMENT_SETUP.md](./PAYMENT_SETUP.md))
- [ ] Gemini API key
- [ ] Domain name (optional but recommended)
- [ ] Git repository

---

## Backend Deployment

The backend can be deployed to various platforms. Choose one based on your needs:

### Option 1: Google Cloud Run (Recommended)

**Pros**: Serverless, auto-scaling, pay-per-use, Firebase integration
**Cost**: Free tier available, ~$5-20/month for small apps

#### Setup Steps

1. **Install Google Cloud SDK**

```bash
# Windows (PowerShell)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# Mac
brew install --cask google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
```

2. **Initialize and Login**

```bash
gcloud init
gcloud auth login
```

3. **Set Project**

```bash
gcloud config set project YOUR_FIREBASE_PROJECT_ID
```

4. **Enable Required APIs**

```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

5. **Build and Deploy**

```bash
cd backend

# Build container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/lifehub-backend

# Deploy to Cloud Run
gcloud run deploy lifehub-backend \
  --image gcr.io/YOUR_PROJECT_ID/lifehub-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="GEMINI_API_KEY=your_key" \
  --set-env-vars="STRIPE_SECRET_KEY=your_key" \
  --set-env-vars="JWT_SECRET=your_secret"
```

6. **Get Backend URL**

After deployment, Cloud Run will provide a URL like:
```
https://lifehub-backend-xxxxx-uc.a.run.app
```

Save this URL - you'll need it for frontend configuration.

---

### Option 2: Railway (Easiest)

**Pros**: Simple deployment, automatic HTTPS, generous free tier
**Cost**: Free tier available, ~$5/month for small apps

#### Setup Steps

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your LifeHub repository

3. **Configure Build**
   - Root Directory: `/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Add Environment Variables**
   
   In Railway dashboard, go to Variables and add:
   ```
   NODE_ENV=production
   PORT=5000
   GEMINI_API_KEY=your_key
   STRIPE_SECRET_KEY=your_key
   JWT_SECRET=your_secret
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   CORS_ORIGINS=https://your-frontend-domain.com
   ```

5. **Deploy**
   - Railway will automatically deploy on push to main branch
   - Get your backend URL from Railway dashboard

---

### Option 3: Heroku

**Pros**: Easy deployment, good documentation
**Cost**: ~$7/month minimum

#### Setup Steps

1. **Install Heroku CLI**

```bash
# Windows
winget install Heroku.HerokuCLI

# Mac
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login and Create App**

```bash
heroku login
heroku create lifehub-backend
```

3. **Set Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set GEMINI_API_KEY=your_key
heroku config:set STRIPE_SECRET_KEY=your_key
heroku config:set JWT_SECRET=your_secret
# ... add all other variables
```

4. **Deploy**

```bash
cd backend
git init
heroku git:remote -a lifehub-backend
git add .
git commit -m "Initial deployment"
git push heroku main
```

---

### Option 4: AWS ECS (Advanced)

**Pros**: Full control, scalable, AWS ecosystem integration
**Cost**: ~$10-30/month minimum

See [AWS ECS Deployment Guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/getting-started.html) for detailed steps.

---

## Frontend Deployment

### Option 1: Vercel (Recommended for React)

**Pros**: Optimized for React, automatic deployments, free tier
**Cost**: Free for personal projects

#### Setup Steps

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Login**

```bash
vercel login
```

3. **Configure Environment Variables**

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://your-backend-url.com/api",
    "VITE_FIREBASE_API_KEY": "your_key",
    "VITE_FIREBASE_AUTH_DOMAIN": "your-project.firebaseapp.com",
    "VITE_FIREBASE_PROJECT_ID": "your-project-id",
    "VITE_STRIPE_PUBLISHABLE_KEY": "pk_live_xxxxx"
  }
}
```

4. **Deploy**

```bash
vercel --prod
```

Or connect GitHub repository in Vercel dashboard for automatic deployments.

---

### Option 2: Netlify

**Pros**: Simple, good for static sites, free tier
**Cost**: Free for personal projects

#### Setup Steps

1. **Install Netlify CLI**

```bash
npm install -g netlify-cli
```

2. **Login**

```bash
netlify login
```

3. **Deploy**

```bash
netlify deploy --prod
```

4. **Configure Environment Variables**

In Netlify dashboard:
- Go to Site settings → Build & deploy → Environment
- Add all `VITE_*` variables

---

### Option 3: Firebase Hosting

**Pros**: Integrated with Firebase, CDN, free tier
**Cost**: Free for most use cases

#### Setup Steps

1. **Install Firebase CLI**

```bash
npm install -g firebase-tools
```

2. **Login**

```bash
firebase login
```

3. **Initialize Hosting**

```bash
firebase init hosting
```

Select:
- Public directory: `dist`
- Single-page app: Yes
- GitHub integration: Optional

4. **Build and Deploy**

```bash
npm run build
firebase deploy --only hosting
```

---

## Database Setup

### Firebase Firestore

1. **Create Firestore Database**

   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Firestore Database
   - Click "Create database"
   - Choose production mode
   - Select region (choose closest to your users)

2. **Set Security Rules**

   Create `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - only accessible by the user
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's tasks
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User's habits
      match /habits/{habitId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User's finance items
      match /finance/{financeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User's reports
      match /reports/{reportId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Only backend can write
      }
      
      // User's payments (read-only for user)
      match /payments/{paymentId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Only backend can write
      }
    }
  }
}
```

3. **Deploy Security Rules**

```bash
firebase deploy --only firestore:rules
```

4. **Create Indexes**

   Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "dueDate", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

---

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file (DO NOT commit this):

```env
# Frontend
VITE_API_URL=https://your-backend-url.com/api
VITE_APP_ENV=production
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# Backend
NODE_ENV=production
PORT=5000
CORS_ORIGINS=https://your-frontend-domain.com,capacitor://localhost
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GEMINI_API_KEY=your_production_key
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_ID_PRO_MONTHLY=price_xxxxxxxxxxxxx
JWT_SECRET=your_super_secret_production_key
REDIS_URL=redis://your-redis-url:6379
LOG_LEVEL=info
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## Post-Deployment Verification

### Backend Health Check

```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### Frontend Verification

1. Visit your frontend URL
2. Test authentication:
   - Sign up with new account
   - Verify email verification flow
   - Log in
3. Test core features:
   - Create a task
   - Create a habit
   - Add finance item
   - Test AI assistant
4. Test subscription:
   - Navigate to subscription page
   - Complete checkout with test card
   - Verify upgrade to premium
   - Access premium features

### Webhook Verification

1. In Stripe Dashboard, go to Webhooks
2. Click on your production webhook
3. Click "Send test webhook"
4. Select `customer.subscription.created`
5. Check your backend logs for webhook receipt
6. Verify Firestore user document updated

### Performance Testing

```bash
# Install Apache Bench
# Windows: Download from https://www.apachelounge.com/download/
# Mac: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test backend API
ab -n 100 -c 10 https://your-backend-url.com/health

# Test frontend
ab -n 100 -c 10 https://your-frontend-url.com/
```

---

## Monitoring & Logging

### Set Up Sentry (Error Tracking)

1. Create account at [sentry.io](https://sentry.io)
2. Create new project for backend
3. Get DSN from project settings
4. Add to environment variables:
   ```env
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

### Set Up Uptime Monitoring

Use services like:
- **UptimeRobot** (free): [uptimerobot.com](https://uptimerobot.com)
- **Pingdom**: [pingdom.com](https://pingdom.com)
- **Better Uptime**: [betteruptime.com](https://betteruptime.com)

Monitor:
- Backend health endpoint: `https://your-backend-url.com/health`
- Frontend homepage: `https://your-frontend-url.com`

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 1 second
- Error rate > 1%
- CPU usage > 70%
- Memory usage > 80%

### Scaling Options

1. **Vertical Scaling** (increase resources)
   - Google Cloud Run: Increase memory/CPU limits
   - Railway: Upgrade plan
   - Heroku: Upgrade dyno type

2. **Horizontal Scaling** (add instances)
   - Google Cloud Run: Auto-scales automatically
   - Add Redis for session management
   - Use CDN for static assets

3. **Database Optimization**
   - Add Firestore indexes
   - Implement caching with Redis
   - Use Firestore query limits

---

## Backup & Disaster Recovery

### Firestore Backups

1. Enable automatic backups in Firebase Console
2. Or use scheduled exports:

```bash
gcloud firestore export gs://your-bucket/firestore-backups
```

### Environment Variables Backup

Store encrypted backups of `.env.production` in secure location (1Password, AWS Secrets Manager, etc.)

---

## Next Steps

- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Set up monitoring alerts
- [ ] Create runbook for common issues
- [ ] Schedule regular backups
- [ ] Proceed to [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) for app store deployment

---

## Troubleshooting

### Backend Won't Start

1. Check environment variables are set
2. Verify Firebase service account JSON is valid
3. Check logs for specific errors
4. Verify all dependencies installed

### Frontend Can't Connect to Backend

1. Check CORS configuration
2. Verify API URL in frontend env vars
3. Check network tab in browser DevTools
4. Verify backend is running and accessible

### Database Connection Issues

1. Verify Firebase project ID
2. Check Firestore security rules
3. Verify service account has correct permissions
4. Check Firebase quota limits

---

**Support**: For deployment issues, check logs first, then consult platform-specific documentation.
