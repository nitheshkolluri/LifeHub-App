import { Router, Request, Response } from 'express';
import { db } from '../config/firebase.config';
import { authenticateToken } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/finance
 * Get all finance items for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        const financeSnapshot = await db
            .collection('users')
            .doc(userId)
            .collection('finance')
            .get();

        const financeItems = financeSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({ financeItems });
    } catch (error) {
        logger.error('Get finance items error:', error);
        res.status(500).json({ error: 'Failed to fetch finance items' });
    }
});

/**
 * POST /api/finance
 * Create a new finance item
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const { title, amount, type, recurrence, dueDay, dueDate, merchant, installments } = req.body;

        if (!title || !amount) {
            res.status(400).json({ error: 'Title and amount are required' });
            return;
        }

        const financeData = {
            title,
            amount,
            type: type || 'bill',
            recurrence: recurrence || 'monthly',
            dueDay: dueDay || null,
            dueDate: dueDate || null,
            isPaidThisMonth: false,
            merchant: merchant || null,
            installments: installments || [],
            linkedTaskIds: [],
        };

        const financeRef = await db
            .collection('users')
            .doc(userId)
            .collection('finance')
            .add(financeData);

        res.status(201).json({
            message: 'Finance item created successfully',
            financeItem: {
                id: financeRef.id,
                ...financeData,
            },
        });
    } catch (error) {
        logger.error('Create finance item error:', error);
        res.status(500).json({ error: 'Failed to create finance item' });
    }
});

/**
 * PATCH /api/finance/:id
 * Update a finance item
 */
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const financeId = req.params.id;
        const updates = req.body;

        await db
            .collection('users')
            .doc(userId)
            .collection('finance')
            .doc(financeId)
            .update(updates);

        res.status(200).json({ message: 'Finance item updated successfully' });
    } catch (error) {
        logger.error('Update finance item error:', error);
        res.status(500).json({ error: 'Failed to update finance item' });
    }
});

/**
 * DELETE /api/finance/:id
 * Delete a finance item
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const financeId = req.params.id;

        await db
            .collection('users')
            .doc(userId)
            .collection('finance')
            .doc(financeId)
            .delete();

        res.status(200).json({ message: 'Finance item deleted successfully' });
    } catch (error) {
        logger.error('Delete finance item error:', error);
        res.status(500).json({ error: 'Failed to delete finance item' });
    }
});

export default router;
