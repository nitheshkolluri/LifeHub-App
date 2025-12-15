import Stripe from 'stripe';
import { logger } from '../utils/logger';

// Initialize Stripe
// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY_PRODUCTION || process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    logger.warn('STRIPE_SECRET_KEY not found - Payments will fail until configured');
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
    apiVersion: '2023-10-16',
    typescript: true,
    appInfo: {
        name: 'LifeHub',
        version: '1.0.0',
    },
});

// Stripe product configuration
export const STRIPE_CONFIG = {
    products: {
        pro: {
            monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || '',
            yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY || '',
        },
    },
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

logger.info('Stripe initialized successfully');
