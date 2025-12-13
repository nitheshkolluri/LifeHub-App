import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../config/firebase.config';
import { authenticateToken, requirePremium } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * POST /api/assistant/chat
 * Send a message to the AI assistant
 */
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const { message, history } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        // Get user context (tasks, habits, finance)
        const [tasksSnapshot, habitsSnapshot, financeSnapshot] = await Promise.all([
            db.collection('users').doc(userId).collection('tasks').get(),
            db.collection('users').doc(userId).collection('habits').get(),
            db.collection('users').doc(userId).collection('finance').get(),
        ]);

        const context = {
            tasks: tasksSnapshot.docs.map(doc => doc.data()),
            habits: habitsSnapshot.docs.map(doc => doc.data()),
            finance: financeSnapshot.docs.map(doc => doc.data()),
        };

        // Create chat with context
        const chat = genAI.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are LifeHub, a professional executive assistant.
        Tone: Concise, encouraging, proactive.
        Goal: Reduce cognitive load.
        
        User Context:
        - Tasks: ${context.tasks.length} total
        - Habits: ${context.habits.length} total
        - Finance Items: ${context.finance.length} total
        
        Provide helpful, actionable advice based on their data.`,
            },
            history: history || [],
        });

        const result = await chat.sendMessage({ message });

        res.status(200).json({
            response: result.text,
            timestamp: Date.now(),
        });
    } catch (error) {
        logger.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

/**
 * POST /api/assistant/brain-dump
 * Parse brain dump text into structured entities
 */
router.post('/brain-dump', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;
        const { text } = req.body;

        if (!text) {
            res.status(400).json({ error: 'Text is required' });
            return;
        }

        const prompt = `
      You are an elite productivity AI (LifeHub). Analyze this user input: "${text}"
      
      Extract actionable items into a structured list of Entities.
      
      RULES:
      1. Finance:
         - Detect currency/amounts ($15, 100 dollars).
         - Detect recurrence (monthly, weekly).
         - CRITICAL: If user mentions "split into X payments" or "installments", create a Finance item with an 'installments' array.
      2. Tasks:
         - Infer 'priority' (urgent, asap = high).
         - Infer 'dueDate' from relative terms (today, next friday).
      3. Habits:
         - Detect frequency (daily, weekly).
      
      Return JSON matching the schema. Use confidence scores (0.0-1.0).
    `;

        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'object',
                    properties: {
                        entities: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', enum: ['task', 'habit', 'finance'] },
                                    confidence: { type: 'number' },
                                    data: { type: 'object' },
                                },
                            },
                        },
                        summary: { type: 'string' },
                    },
                },
            },
        });

        const parsed = JSON.parse(result.text || '{}');

        res.status(200).json(parsed);
    } catch (error) {
        logger.error('Brain dump error:', error);
        res.status(500).json({ error: 'Failed to parse brain dump' });
    }
});

/**
 * POST /api/assistant/generate-report
 * Generate weekly report (Premium feature)
 */
router.post('/generate-report', requirePremium, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.uid;

        // Get user data
        const [tasksSnapshot, habitsSnapshot, financeSnapshot] = await Promise.all([
            db.collection('users').doc(userId).collection('tasks').get(),
            db.collection('users').doc(userId).collection('habits').get(),
            db.collection('users').doc(userId).collection('finance').get(),
        ]);

        const data = {
            tasks: tasksSnapshot.docs.map(doc => doc.data()),
            habits: habitsSnapshot.docs.map(doc => doc.data()),
            finance: financeSnapshot.docs.map(doc => doc.data()),
        };

        const prompt = `
      Generate a professional 'Executive Brief' based on:
      Tasks: ${data.tasks.length} total.
      Habits: ${data.habits.map((h: any) => h.title).join(', ')}.
      Finance: ${data.finance.length} items.
      
      Structure:
      1. Executive Summary (1 sentence)
      2. Key Wins (bullet points)
      3. Focus Area (1 recommendation)
      
      Tone: Professional, succinct.
    `;

        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const reportText = result.text || 'Report generation failed.';

        // Save report
        const reportRef = await db
            .collection('users')
            .doc(userId)
            .collection('reports')
            .add({
                text: reportText,
                generatedAt: Date.now(),
                weekOf: new Date().toISOString().split('T')[0],
            });

        res.status(200).json({
            report: {
                id: reportRef.id,
                text: reportText,
                generatedAt: Date.now(),
            },
        });
    } catch (error) {
        logger.error('Generate report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

export default router;
