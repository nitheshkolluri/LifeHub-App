import Stripe from 'stripe';
import { logger } from '../utils/logger';

// Initialize Stripe
const stripeSecretKey = process.env.NODE_ENV === 'production'
    ? process.env.STRIPE_SECRET_KEY_PRODUCTION
    : process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    logger.error('Stripe secret key not found in environment variables');
    throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-11-20.acacia',
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
