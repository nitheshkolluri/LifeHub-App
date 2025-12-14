# Deploying LifeHub to Google Cloud Run

This guide assumes you have the Google Cloud SDK (`gcloud`) installed and your project selected.

## Prerequisites
1. **Google Cloud Project**: Create one at console.cloud.google.com.
2. **Enable APIs**: Enable "Cloud Run API" and "Container Registry API" (or Artifact Registry).
3. **Environment**: Ensure your `.env` variables are ready.

## 1. Backend Deployment

The backend runs the API on port 5000 (default) but Cloud Run expects it to listen on `$PORT`.

```bash
# internal-port 5000 matches our Dockerfile
gcloud run deploy lifehub-backend \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5000 \
  --set-env-vars="NODE_ENV=production,FIREBASE_PROJECT_ID=your-id"
```

*Note: You should set all sensitive env vars (Stripe keys, Firebase keys) using the `--set-env-vars` flag or via the Google Cloud Console Secrets Manager.*

## 2. Frontend Deployment

The frontend needs to be built with the Backend URL known.

1. Get the Backend URL from the previous step (e.g., `https://lifehub-backend-xyz.a.run.app`).
2. Update `.env.production` (or pass as build arg) `VITE_API_URL=https://lifehub-backend-xyz.a.run.app`.

```bash
# Build and Deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/lifehub-frontend .

gcloud run deploy lifehub-frontend \
  --image gcr.io/PROJECT_ID/lifehub-frontend \
  --region us-central1 \
  --allow-unauthenticated
```

## 3. Linking Firebase

Since you have an existing Firebase project:
1. Go to Firebase Console > Project Settings.
2. Add your Cloud Run URLs (Frontend) to the **Authorized Domains** list in Authentication settings.
3. Update the `VITE_FIREBASE_...` keys in your frontend environment.

## 4. Verification

Visit the provided Frontend URL.
- Test Sign In (Google/Email).
- Test AI Chat (connects to Backend).
- Test Stripe Payment Prompt.
