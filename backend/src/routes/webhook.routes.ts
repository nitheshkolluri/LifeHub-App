import { Router, Request, Response } from 'express';
import { stripe, STRIPE_CONFIG } from '../config/stripe.config';
import { db } from '../config/firebase.config';
import { webhookRateLimiter } from '../middleware/monitoring.middleware';
import { logger } from '../utils/logger';
import express from 'express';

const router = Router();

/**
 * POST /api/webhook/stripe
 * Handle Stripe webhook events
 * 
 * IMPORTANT: This endpoint must use raw body for signature verification
 */
router.post(
    '/stripe',
    webhookRateLimiter,
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature'] as string;

        if (!sig) {
            res.status(400).json({ error: 'Missing stripe-signature header' });
            return;
        }

        let event;

        try {
            // Verify webhook signature
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                STRIPE_CONFIG.webhookSecret
            );
        } catch (err: any) {
            logger.error('Webhook signature verification failed:', err.message);
            res.status(400).json({ error: `Webhook Error: ${err.message}` });
            return;
        }

        // Handle the event
        try {
            switch (event.type) {
                case 'customer.subscription.created':
                    await handleSubscriptionCreated(event.data.object);
                    break;

                case 'customer.subscription.updated':
                    await handleSubscriptionUpdated(event.data.object);
                    break;

                case 'customer.subscription.deleted':
                    await handleSubscriptionDeleted(event.data.object);
                    break;

                case 'invoice.payment_succeeded':
                    await handlePaymentSucceeded(event.data.object);
                    break;

                case 'invoice.payment_failed':
                    await handlePaymentFailed(event.data.object);
                    break;

                case 'checkout.session.completed':
                    await handleCheckoutCompleted(event.data.object);
                    break;

                default:
                    logger.info(`Unhandled event type: ${event.type}`);
            }

            res.status(200).json({ received: true });
        } catch (error) {
            logger.error('Webhook handler error:', error);
            res.status(500).json({ error: 'Webhook handler failed' });
        }
    }
);

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: any): Promise<void> {
    logger.info('Subscription created:', subscription.id);

    const customerId = subscription.customer;
    const userId = subscription.metadata?.firebaseUID;

    if (!userId) {
        logger.error('No firebaseUID in subscription metadata');
        return;
    }

    // Update user to premium
    await db.collection('users').doc(userId).update({
        isPremium: true,
        plan: 'pro',
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    });

    logger.info(`User ${userId} upgraded to premium`);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: any): Promise<void> {
    logger.info('Subscription updated:', subscription.id);

    const userId = subscription.metadata?.firebaseUID;

    if (!userId) {
        // Try to find user by Stripe customer ID
        const usersSnapshot = await db
            .collection('users')
            .where('stripeSubscriptionId', '==', subscription.id)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            logger.error('No user found for subscription:', subscription.id);
            return;
        }

        const userDoc = usersSnapshot.docs[0];
        await userDoc.ref.update({
            subscriptionStatus: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date().toISOString(),
        });
    } else {
        await db.collection('users').doc(userId).update({
            subscriptionStatus: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date().toISOString(),
        });
    }

    logger.info(`Subscription ${subscription.id} updated`);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: any): Promise<void> {
    logger.info('Subscription deleted:', subscription.id);

    // Find user by subscription ID
    const usersSnapshot = await db
        .collection('users')
        .where('stripeSubscriptionId', '==', subscription.id)
        .limit(1)
        .get();

    if (usersSnapshot.empty) {
        logger.error('No user found for subscription:', subscription.id);
        return;
    }

    const userDoc = usersSnapshot.docs[0];

    // Downgrade user to free
    await userDoc.ref.update({
        isPremium: false,
        plan: 'free',
        subscriptionStatus: 'cancelled',
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        updatedAt: new Date().toISOString(),
    });

    logger.info(`User ${userDoc.id} downgraded to free`);
}

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(invoice: any): Promise<void> {
    logger.info('Payment succeeded for invoice:', invoice.id);

    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
        return;
    }

    // Find user by subscription ID
    const usersSnapshot = await db
        .collection('users')
        .where('stripeSubscriptionId', '==', subscriptionId)
        .limit(1)
        .get();

    if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];

        // Log payment in user's payment history
        await db
            .collection('users')
            .doc(userDoc.id)
            .collection('payments')
            .add({
                invoiceId: invoice.id,
                amount: invoice.amount_paid / 100, // Convert from cents
                currency: invoice.currency,
                status: 'succeeded',
                paidAt: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
                createdAt: new Date().toISOString(),
            });

        logger.info(`Payment recorded for user ${userDoc.id}`);
    }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(invoice: any): Promise<void> {
    logger.warn('Payment failed for invoice:', invoice.id);

    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
        return;
    }

    // Find user by subscription ID
    const usersSnapshot = await db
        .collection('users')
        .where('stripeSubscriptionId', '==', subscriptionId)
        .limit(1)
        .get();

    if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];

        // Log failed payment
        await db
            .collection('users')
            .doc(userDoc.id)
            .collection('payments')
            .add({
                invoiceId: invoice.id,
                amount: invoice.amount_due / 100,
                currency: invoice.currency,
                status: 'failed',
                failureReason: invoice.last_payment_error?.message || 'Unknown',
                createdAt: new Date().toISOString(),
            });

        logger.warn(`Failed payment recorded for user ${userDoc.id}`);
    }
}

/**
 * Handle checkout session completed event
 */
async function handleCheckoutCompleted(session: any): Promise<void> {
    logger.info('Checkout session completed:', session.id);

    const userId = session.metadata?.firebaseUID;

    if (!userId) {
        logger.error('No firebaseUID in checkout session metadata');
        return;
    }

    // The subscription.created event will handle the actual upgrade
    // This is just for logging
    logger.info(`Checkout completed for user ${userId}`);
}

export default router;
