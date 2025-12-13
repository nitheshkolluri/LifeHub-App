import { Router, Request, Response } from 'express';
import { db } from '../config/firebase.config';
import { authenticateToken } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/habits
 * Get all habits for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        const habitsSnapshot = await db
            .collection('users')
            .doc(userId)
            .collection('habits')
            .get();

        const habits = habitsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({ habits });
    } catch (error) {
        logger.error('Get habits error:', error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

/**
 * POST /api/habits
 * Create a new habit
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const { title, frequency, targetPerPeriod, color } = req.body;

        if (!title) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }

        const habitData = {
            title,
            streak: 0,
            completedDates: [],
            frequency: frequency || 'daily',
            targetPerPeriod: targetPerPeriod || 1,
            startDate: new Date().toISOString().split('T')[0],
            color: color || '#6366f1',
        };

        const habitRef = await db
            .collection('users')
            .doc(userId)
            .collection('habits')
            .add(habitData);

        res.status(201).json({
            message: 'Habit created successfully',
            habit: {
                id: habitRef.id,
                ...habitData,
            },
        });
    } catch (error) {
        logger.error('Create habit error:', error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

/**
 * POST /api/habits/:id/complete
 * Mark habit as completed for a date
 */
router.post('/:id/complete', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const habitId = req.params.id;
        const { date } = req.body;

        const completionDate = date || new Date().toISOString().split('T')[0];

        const habitRef = db
            .collection('users')
            .doc(userId)
            .collection('habits')
            .doc(habitId);

        const habitDoc = await habitRef.get();
        const habitData = habitDoc.data();

        if (!habitData) {
            res.status(404).json({ error: 'Habit not found' });
            return;
        }

        const completedDates = habitData.completedDates || [];

        if (!completedDates.includes(completionDate)) {
            completedDates.push(completionDate);

            // Calculate new streak
            const sortedDates = completedDates.sort();
            let streak = 1;
            for (let i = sortedDates.length - 1; i > 0; i--) {
                const current = new Date(sortedDates[i]);
                const previous = new Date(sortedDates[i - 1]);
                const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }

            await habitRef.update({
                completedDates,
                streak,
            });
        }

        res.status(200).json({ message: 'Habit completed' });
    } catch (error) {
        logger.error('Complete habit error:', error);
        res.status(500).json({ error: 'Failed to complete habit' });
    }
});

/**
 * DELETE /api/habits/:id
 * Delete a habit
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const habitId = req.params.id;

        await db
            .collection('users')
            .doc(userId)
            .collection('habits')
            .doc(habitId)
            .delete();

        res.status(200).json({ message: 'Habit deleted successfully' });
    } catch (error) {
        logger.error('Delete habit error:', error);
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

export default router;
