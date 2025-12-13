import { Router, Request, Response } from 'express';
import { stripe, STRIPE_CONFIG } from '../config/stripe.config';
import { db } from '../config/firebase.config';
import { authenticateToken } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/subscription/create-checkout-session
 * Create a Stripe Checkout session for subscription
 */
router.post('/create-checkout-session', async (req: Request, res: Response) => {
    try {
        const { priceId, successUrl, cancelUrl } = req.body;
        const userId = req.user!.uid;
        const userEmail = req.user!.email;

        // Validate input
        if (!priceId || !successUrl || !cancelUrl) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Get or create Stripe customer
        let customerId: string;
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (userData?.stripeCustomerId) {
            customerId = userData.stripeCustomerId;
        } else {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: {
                    firebaseUID: userId,
                },
            });
            customerId = customer.id;

            // Save customer ID to Firestore
            await db.collection('users').doc(userId).update({
                stripeCustomerId: customerId,
            });
        }

        // Create Checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                firebaseUID: userId,
            },
        });

        logger.info(`Checkout session created for user: ${userId}`);

        res.status(200).json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        logger.error('Create checkout session error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

/**
 * GET /api/subscription/status
 * Get current subscription status
 */
router.get('/status', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.stripeCustomerId) {
            res.status(200).json({
                isPremium: false,
                plan: 'free',
                status: 'inactive',
            });
            return;
        }

        // Get subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: userData.stripeCustomerId,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            res.status(200).json({
                isPremium: false,
                plan: 'free',
                status: 'inactive',
            });
            return;
        }

        const subscription = subscriptions.data[0];

        res.status(200).json({
            isPremium: true,
            plan: 'pro',
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
    } catch (error) {
        logger.error('Get subscription status error:', error);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
});

/**
 * POST /api/subscription/cancel
 * Cancel subscription at period end
 */
router.post('/cancel', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.stripeCustomerId) {
            res.status(400).json({ error: 'No active subscription found' });
            return;
        }

        // Get active subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: userData.stripeCustomerId,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            res.status(400).json({ error: 'No active subscription found' });
            return;
        }

        // Cancel subscription at period end
        const subscription = await stripe.subscriptions.update(
            subscriptions.data[0].id,
            {
                cancel_at_period_end: true,
            }
        );

        logger.info(`Subscription cancelled for user: ${userId}`);

        res.status(200).json({
            message: 'Subscription will be cancelled at period end',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        });
    } catch (error) {
        logger.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

/**
 * POST /api/subscription/reactivate
 * Reactivate a cancelled subscription
 */
router.post('/reactivate', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.stripeCustomerId) {
            res.status(400).json({ error: 'No subscription found' });
            return;
        }

        // Get subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: userData.stripeCustomerId,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            res.status(400).json({ error: 'No subscription found' });
            return;
        }

        // Reactivate subscription
        const subscription = await stripe.subscriptions.update(
            subscriptions.data[0].id,
            {
                cancel_at_period_end: false,
            }
        );

        logger.info(`Subscription reactivated for user: ${userId}`);

        res.status(200).json({
            message: 'Subscription reactivated successfully',
            status: subscription.status,
        });
    } catch (error) {
        logger.error('Reactivate subscription error:', error);
        res.status(500).json({ error: 'Failed to reactivate subscription' });
    }
});

/**
 * POST /api/subscription/create-portal-session
 * Create a Stripe Customer Portal session
 */
router.post('/create-portal-session', async (req: Request, res: Response) => {
    try {
        const { returnUrl } = req.body;
        const userId = req.user!.uid;

        if (!returnUrl) {
            res.status(400).json({ error: 'Return URL is required' });
            return;
        }

        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.stripeCustomerId) {
            res.status(400).json({ error: 'No Stripe customer found' });
            return;
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: userData.stripeCustomerId,
            return_url: returnUrl,
        });

        res.status(200).json({
            url: session.url,
        });
    } catch (error) {
        logger.error('Create portal session error:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

export default router;
