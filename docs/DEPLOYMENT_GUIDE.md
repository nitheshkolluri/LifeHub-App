# LifeHub Deployment & Configuration Guide

You are almost there! The application code is fixed, but for the "Delete", "Sign Out", and "Payments" to work in the live environment, you **MUST** configure the production keys and settings in Google Cloud Console.

## 1. Firebase Authorized Domains (CRITICAL FIX)
**Symptom:** "Sign Out doesn't work", "Delete doesn't work", "Network Error".
**Cause:** Firebase blocks requests from your new Cloud Run URL (`https://lifehub-frontend-....run.app`) because it's not on the whitelist.

**Action:**
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication** > **Settings** > **Authorized Domains**.
3. Click **Add Domain**.
4. Paste your **Frontend Cloud Run URL** (e.g., `lifehub-frontend-xyz.run.app`).
5. **Save**.
   *   *Note: It may take 1-2 minutes to propagate.*

---

## 2. Frontend Configuration (Cloud Run)
These variables control how the Frontend app connects to services.
**Where:** Cloud Run > `lifehub-frontend` > **Edit & Deploy New Revision** > **Variables & Secrets** > **Environment Variables**.

Add/Update these variables:

| Name | Value Example | Description |
|------|--------------|-------------|
| `VITE_API_URL` | `https://lifehub-backend-....run.app/api` | **Must match your deployed Backend URL**. |
| `VITE_STRIPE_PRICE_ID_PRO_MONTHLY` | `price_1Pxyz...` | The Price ID from your Stripe Dashboard (Product Catalog). |
| `VITE_FIREBASE_API_KEY` | `AIza...` | (Optional if built-in, but recommended to override) |

*The other Firebase keys (`AUTH_DOMAIN`, `PROJECT_ID`, etc.) are likely baked in during build, but you can add them here to be safe.*

---

## 3. Backend Configuration (Cloud Run)
These variables allow the Backend to talk to Stripe and Firebase securely.
**Where:** Cloud Run > `lifehub-backend` > **Edit & Deploy New Revision** > **Variables & Secrets**.

**Use "Secrets" for sensitive keys, or "Environment Variables" for others.**

| Name | Value | Secret? | Description |
|------|-------|---------|-------------|
| `NODE_ENV` | `production` | No | Tells app to use secure logging. |
| `PORT` | `8080` | No | Required by Cloud Run. |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | **YES** | Your Stripe Secret Key (Developers > API Keys). |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | **YES** | (Optional) For processing subscription updates. |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | `price_1Pxyz...` | No | Must match the Frontend ID. |
| `CORS_ORIGINS` | `https://lifehub-frontend-....run.app` | No | **REQUIRED** for Backend API access. |

---

## 4. Verification Checklist
1. **Frontend:** Open the app URL.
2. **Auth:** Try to Sign In / Sign Out. (If it fails, check Domain Whitelist step above).
3. **Data:** Try to Add/Delete a Task. (If it fails, check `VITE_API_URL` match).
4. **Payment:** Click "Upgrade". (If it fails, check `STRIPE_PRICE_ID` and `STRIPE_SECRET_KEY`).

**Note on Builds:**
Since we just pushed code fixes, make sure the **latest** build has finished/deployed before testing. Check the build history in Cloud Build.
