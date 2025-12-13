# LifeHub Payment Gateway Setup Guide

This guide walks you through setting up Stripe as your payment gateway for LifeHub's subscription-based model.

## Table of Contents

1. [Stripe Account Setup](#stripe-account-setup)
2. [Product & Price Configuration](#product--price-configuration)
3. [API Keys Configuration](#api-keys-configuration)
4. [Webhook Setup](#webhook-setup)
5. [Testing with Test Cards](#testing-with-test-cards)
6. [Going Live Checklist](#going-live-checklist)
7. [Mobile App In-App Purchases](#mobile-app-in-app-purchases)

---

## Stripe Account Setup

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" or "Sign up"
3. Fill in your business information:
   - Business name: **LifeHub**
   - Business type: **Software/SaaS**
   - Country: Select your country
4. Complete email verification
5. Complete your business profile

### 2. Activate Your Account

1. Navigate to **Settings** → **Account details**
2. Complete the following:
   - Business details
   - Bank account information (for payouts)
   - Tax information
   - Identity verification

> [!NOTE]
> You can start testing immediately without completing activation. However, you must complete activation before going live.

---

## Product & Price Configuration

### 1. Create a Product

1. In Stripe Dashboard, go to **Products** → **Add product**
2. Fill in product details:
   - **Name**: LifeHub Pro
   - **Description**: Premium subscription with unlimited AI features, advanced analytics, and priority support
   - **Image**: Upload your app logo (optional)
3. Click **Save product**

### 2. Create Pricing Plans

#### Monthly Plan

1. In the product page, click **Add another price**
2. Configure:
   - **Price**: $9.99 (or your preferred amount)
   - **Billing period**: Monthly
   - **Currency**: USD (or your preferred currency)
   - **Price description**: Pro Monthly
3. Click **Add price**
4. **Copy the Price ID** (starts with `price_...`) - you'll need this for `.env`

#### Yearly Plan (Optional)

1. Click **Add another price** again
2. Configure:
   - **Price**: $99.99 (or your preferred amount)
   - **Billing period**: Yearly
   - **Currency**: USD
   - **Price description**: Pro Yearly
3. Click **Add price**
4. **Copy the Price ID** - you'll need this for `.env`

### 3. Enable Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate test link** (for testing) or **Activate** (for production)
3. Configure portal settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to switch plans
   - ✅ Show invoice history
4. Click **Save**

---

## API Keys Configuration

### 1. Get Your API Keys

#### Test Mode Keys (for development)

1. In Stripe Dashboard, ensure you're in **Test mode** (toggle in top right)
2. Go to **Developers** → **API keys**
3. Copy the following:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

#### Live Mode Keys (for production)

1. Switch to **Live mode** in Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Copy the following:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`) - Click "Reveal live key"

### 2. Add Keys to Environment Variables

Update your `.env` file:

```env
# Frontend (Publishable keys - safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY_PRODUCTION=pk_live_xxxxxxxxxxxxx

# Backend (Secret keys - NEVER expose!)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY_PRODUCTION=sk_live_xxxxxxxxxxxxx

# Price IDs
STRIPE_PRICE_ID_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_PRO_YEARLY=price_xxxxxxxxxxxxx
```

> [!CAUTION]
> **NEVER** commit your secret keys to version control! Always use environment variables.

---

## Webhook Setup

Webhooks allow Stripe to notify your backend when subscription events occur (payments, cancellations, etc.).

### 1. Local Development (Using Stripe CLI)

#### Install Stripe CLI

**Windows:**
```powershell
# Using Scoop
scoop install stripe

# Or download from https://github.com/stripe/stripe-cli/releases
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download and install from https://github.com/stripe/stripe-cli/releases
```

#### Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate.

#### Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:5000/api/webhook/stripe
```

This command will output a webhook signing secret (starts with `whsec_...`). Add it to your `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 2. Production Webhook Setup

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://your-backend-domain.com/api/webhook/stripe`
   - **Description**: LifeHub Production Webhook
   - **Events to send**: Select the following:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `checkout.session.completed`
4. Click **Add endpoint**
5. **Copy the Signing secret** (starts with `whsec_...`)
6. Add to your production environment variables:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## Testing with Test Cards

Stripe provides test card numbers for testing different scenarios.

### Successful Payment

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Payment Requires Authentication (3D Secure)

```
Card Number: 4000 0025 0000 3155
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Payment Declined

```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Insufficient Funds

```
Card Number: 4000 0000 0000 9995
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Testing Flow

1. Start your backend server: `cd backend && npm run dev`
2. Start Stripe CLI webhook forwarding: `stripe listen --forward-to localhost:5000/api/webhook/stripe`
3. Start your frontend: `npm run dev`
4. Navigate to subscription page
5. Use test card `4242 4242 4242 4242`
6. Complete checkout
7. Verify webhook events in Stripe CLI output
8. Check Firestore to confirm user upgraded to premium

---

## Going Live Checklist

Before accepting real payments, complete the following:

### Stripe Account

- [ ] Complete business verification
- [ ] Add bank account for payouts
- [ ] Complete tax information
- [ ] Activate your account

### Application Configuration

- [ ] Switch to live API keys in production environment
- [ ] Set up production webhook endpoint
- [ ] Test subscription flow in production
- [ ] Verify webhook events are received
- [ ] Test subscription cancellation
- [ ] Test payment failure handling

### Security

- [ ] Ensure secret keys are in environment variables (not hardcoded)
- [ ] Enable HTTPS for all endpoints
- [ ] Verify webhook signature validation is working
- [ ] Review Firestore security rules
- [ ] Enable rate limiting on API endpoints

### Legal & Compliance

- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Add Refund Policy
- [ ] Ensure GDPR compliance (if applicable)
- [ ] Add subscription cancellation information

### User Experience

- [ ] Test subscription flow on mobile devices
- [ ] Verify email receipts are sent
- [ ] Test customer portal access
- [ ] Add subscription management UI
- [ ] Test upgrade/downgrade flows

---

## Mobile App In-App Purchases

For iOS and Android apps, you **must** use platform-specific in-app purchases for digital subscriptions (per App Store and Google Play policies).

### iOS App Store

1. **App Store Connect Setup**:
   - Create subscription groups
   - Add subscription products
   - Configure pricing tiers
   - Submit for review

2. **Integration**:
   - Use StoreKit 2 (iOS) or RevenueCat (cross-platform)
   - Validate receipts on your backend
   - Sync with Firestore

3. **Revenue Split**: Apple takes 30% (15% after year 1)

### Google Play Store

1. **Google Play Console Setup**:
   - Create subscription products
   - Configure pricing
   - Add subscription benefits

2. **Integration**:
   - Use Google Play Billing Library or RevenueCat
   - Validate purchases on backend
   - Sync with Firestore

3. **Revenue Split**: Google takes 15% (for subscriptions)

### Recommended: RevenueCat

[RevenueCat](https://www.revenuecat.com/) simplifies in-app purchase management:

- ✅ Handles iOS and Android billing
- ✅ Provides unified API
- ✅ Manages receipt validation
- ✅ Offers analytics dashboard
- ✅ Free tier available

**Setup**:
1. Create RevenueCat account
2. Configure iOS and Android apps
3. Add products
4. Integrate SDK in Capacitor app
5. Use webhooks to sync with your backend

---

## Support & Resources

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Testing**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Stripe Webhooks**: [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **RevenueCat Docs**: [https://docs.revenuecat.com](https://docs.revenuecat.com)

---

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct
2. Verify webhook signing secret matches
3. Check server logs for errors
4. Test with Stripe CLI: `stripe trigger customer.subscription.created`

### Payment Failing

1. Check API keys are correct
2. Verify price ID exists
3. Check Stripe Dashboard for error details
4. Review server logs

### User Not Upgraded After Payment

1. Check webhook handler is working
2. Verify Firestore write permissions
3. Check webhook event logs in Stripe Dashboard
4. Review backend logs for errors

---

**Next Steps**: After setting up payments, proceed to [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) for app store submission.
