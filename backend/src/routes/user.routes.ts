import { Router, Request, Response } from 'express';
import { auth, db } from '../config/firebase.config';
import { authenticateToken } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/user/profile
 * Get user profile
 */
router.get('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json({
            user: {
                id: userId,
                email: userData.email,
                name: userData.name,
                isPremium: userData.isPremium || false,
                plan: userData.plan || 'free',
                emailVerified: req.user!.emailVerified,
                createdAt: userData.createdAt,
            },
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

/**
 * PATCH /api/user/profile
 * Update user profile (name, preferences, etc.)
 */
router.patch('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const { name, notificationPreferences } = req.body;

        const updates: any = {};
        if (name) updates.name = name;
        if (notificationPreferences) updates.notificationPreferences = notificationPreferences;

        await db.collection('users').doc(userId).update({
            ...updates,
            updatedAt: new Date().toISOString(),
        });

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * DELETE /api/user/account
 * Delete user account (GDPR Right to be Forgotten)
 */
router.delete('/account', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        logger.info(`Account deletion requested for user: ${userId}`);

        // Delete all user data from Firestore
        const batch = db.batch();

        // Delete subcollections
        const collections = ['tasks', 'habits', 'finance', 'reports', 'payments'];

        for (const collectionName of collections) {
            const snapshot = await db
                .collection('users')
                .doc(userId)
                .collection(collectionName)
                .get();

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
        }

        // Delete user document
        batch.delete(db.collection('users').doc(userId));

        // Commit batch
        await batch.commit();

        // Delete from Firebase Auth
        await auth.deleteUser(userId);

        logger.info(`Account deleted successfully for user: ${userId}`);

        res.status(200).json({
            message: 'Account deleted successfully',
            note: 'All your data has been permanently removed'
        });
    } catch (error) {
        logger.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

/**
 * POST /api/user/export-data
 * Export all user data (GDPR Data Portability)
 */
router.post('/export-data', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        // Get user profile
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        // Get all subcollections
        const [tasksSnapshot, habitsSnapshot, financeSnapshot, reportsSnapshot] = await Promise.all([
            db.collection('users').doc(userId).collection('tasks').get(),
            db.collection('users').doc(userId).collection('habits').get(),
            db.collection('users').doc(userId).collection('finance').get(),
            db.collection('users').doc(userId).collection('reports').get(),
        ]);

        const exportData = {
            profile: userData,
            tasks: tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            habits: habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            finance: financeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            reports: reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            exportedAt: new Date().toISOString(),
        };

        logger.info(`Data export requested for user: ${userId}`);

        res.status(200).json(exportData);
    } catch (error) {
        logger.error('Export data error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

export default router;
