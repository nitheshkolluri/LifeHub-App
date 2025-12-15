import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { auth, db } from '../config/firebase.config';
import { authRateLimiter } from '../middleware/monitoring.middleware';
import { logger } from '../utils/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authRateLimiter, async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' });
            return;
        }

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name,
            emailVerified: false,
        });

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            id: userRecord.uid,
            email: userRecord.email,
            name,
            isPremium: false,
            plan: 'free',
            emailVerified: false,
            createdAt: new Date().toISOString(),
        });

        // Generate JWT token
        const token = jwt.sign({ uid: userRecord.uid }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        } as any);

        logger.info(`User registered: ${email}`);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                name,
                emailVerified: false,
            },
        });
    } catch (error: any) {
        logger.error('Registration error:', error);

        if (error.code === 'auth/email-already-exists') {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }

        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Verify user exists
        const userRecord = await auth.getUserByEmail(email);

        // Note: Firebase Admin SDK doesn't verify passwords directly
        // In production, use Firebase Client SDK on frontend or custom token
        // For now, we'll generate a token assuming password is correct
        // This is a simplified version - implement proper password verification

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        const userData = userDoc.data();

        // Generate JWT token
        const token = jwt.sign({ uid: userRecord.uid }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        } as any);

        logger.info(`User logged in: ${email}`);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                name: userData?.name || userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                isPremium: userData?.isPremium || false,
                plan: userData?.plan || 'free',
            },
        });
    } catch (error: any) {
        logger.error('Login error:', error);

        if (error.code === 'auth/user-not-found') {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/auth/verify-token
 * Verify JWT token and return user data
 */
router.post('/verify-token', async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            res.status(400).json({ error: 'Token is required' });
            return;
        }

        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET) as { uid: string };

        // Get user from Firebase
        const userRecord = await auth.getUser(decoded.uid);
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        const userData = userDoc.data();

        res.status(200).json({
            valid: true,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                name: userData?.name || userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                isPremium: userData?.isPremium || false,
                plan: userData?.plan || 'free',
            },
        });
    } catch (error) {
        logger.error('Token verification error:', error);
        res.status(401).json({ valid: false, error: 'Invalid token' });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            res.status(400).json({ error: 'Token is required' });
            return;
        }

        // Verify old token (ignore expiration)
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as { uid: string };

        // Generate new token
        const newToken = jwt.sign({ uid: decoded.uid }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        } as any);

        res.status(200).json({
            message: 'Token refreshed',
            token: newToken,
        });
    } catch (error) {
        logger.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
