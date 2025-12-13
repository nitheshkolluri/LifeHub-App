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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as { uid: string };

        // Verify user exists in Firebase
        const userRecord = await auth.getUser(decoded.uid);

        // Attach user to request
        req.user = {
            uid: userRecord.uid,
            email: userRecord.email || '',
            emailVerified: userRecord.emailVerified,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({ error: 'Invalid token' });
            return;
        }
        if (error instanceof jwt.TokenExpiredError) {
            res.status(403).json({ error: 'Token expired' });
            return;
        }
        logger.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

/**
 * Middleware to verify email is verified
 */
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

/**
 * Middleware to check if user is premium
 */
export const requirePremium = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { db } = await import('../config/firebase.config');
        const userDoc = await db.collection('users').doc(req.user!.uid).get();
        const userData = userDoc.data();

        if (!userData?.isPremium) {
            res.status(403).json({ error: 'Premium subscription required' });
            return;
        }

        next();
    } catch (error) {
        logger.error('Premium check error:', error);
        res.status(500).json({ error: 'Failed to verify subscription' });
    }
};
