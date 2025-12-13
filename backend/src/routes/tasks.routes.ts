import { Router, Request, Response } from 'express';
import { db } from '../config/firebase.config';
import { authenticateToken } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/tasks
 * Get all tasks for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        const tasksSnapshot = await db
            .collection('users')
            .doc(userId)
            .collection('tasks')
            .orderBy('createdAt', 'desc')
            .get();

        const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({ tasks });
    } catch (error) {
        logger.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const { title, priority, dueDate, dueTime, tags } = req.body;

        if (!title) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }

        const taskData = {
            title,
            status: 'pending',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            dueTime: dueTime || null,
            tags: tags || [],
            createdAt: Date.now(),
        };

        const taskRef = await db
            .collection('users')
            .doc(userId)
            .collection('tasks')
            .add(taskData);

        res.status(201).json({
            message: 'Task created successfully',
            task: {
                id: taskRef.id,
                ...taskData,
            },
        });
    } catch (error) {
        logger.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

/**
 * PATCH /api/tasks/:id
 * Update a task
 */
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const taskId = req.params.id;
        const updates = req.body;

        await db
            .collection('users')
            .doc(userId)
            .collection('tasks')
            .doc(taskId)
            .update(updates);

        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        logger.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const taskId = req.params.id;

        await db
            .collection('users')
            .doc(userId)
            .collection('tasks')
            .doc(taskId)
            .delete();

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        logger.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

export default router;
