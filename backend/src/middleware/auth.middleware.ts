import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../config/firebase.config';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email: string;
                emailVerified: boolean;
            };
        }
    }
}

// Middleware to verify Firebase ID token
export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }

        // Verify Firebase ID Token
        const decodedToken = await auth.verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            emailVerified: decodedToken.email_verified || false,
        };

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Middleware to verify email is verified
export const requireEmailVerified = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user?.emailVerified) {
        res.status(403).json({ error: 'Email verification required' });
        return;
    }
    next();
};

// Middleware to check if user is premium
export const requirePremium = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { db } = await import('../config/firebase.config');
        const userDoc = await db.collection('users').doc(req.user!.uid).get();
        const userData = userDoc.data();

        // 1. Check Premium Status
        if (userData?.isPremium) {
            next();
            return;
        }

        // 2. Check Trial Status (7 Days)
        const now = Date.now();
        const createdAt = userData?.createdAt?.toMillis
            ? userData.createdAt.toMillis()
            : (userData?.createdAt || now);

        const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

        if (ageInDays <= 7) {
            // In Trial -> Allow
            next();
            return;
        }

        // 3. Block
        res.status(403).json({ error: 'Premium subscription required (Trial Ended)' });
    } catch (error) {
        logger.error('Premium check error:', error);
        res.status(500).json({ error: 'Failed to verify subscription' });
    }
};
