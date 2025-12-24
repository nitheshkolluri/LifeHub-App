import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { db } from '../config/firebase.config';
import { authenticateToken, requirePremium } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { Redactor } from '../utils/redactor';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Initialize Gemini AI (Lazy Load to allow dotenv to configure first)
const getGenAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        logger.error("GEMINI_API_KEY is missing in environment variables.");
        throw new Error("Server Misconfiguration: Missing AI Key");
    }
    return new GoogleGenerativeAI(key);
};

// Constants
const MODEL_NAME = 'gemini-pro'; // Logic: Maximum compatibility v1.0 model
const LEGAL_DISCLAIMER = `
CRITICAL LEGAL RULES:
1. NO FINANCIAL ADVICE: You are an executive assistant, NOT a financial advisor. NEVER recommend investments, stocks, or specific asset allocations. If asked, state: "I cannot provide financial advice."
2. NO MEDICAL/LEGAL ADVICE: If asked for health or legal counsel, refuse and refer to professionals.
3. PRIVACY: Do not repeat back sensitive PII (Social Security Numbers, Credit Card numbers) even if user provides them.
`;

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

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

        const safeMessage = Redactor.scrub(message);

        // Get context
        const [tasksSnapshot, habitsSnapshot, financeSnapshot] = await Promise.all([
            db.collection('users').doc(userId).collection('tasks').limit(20).get(),
            db.collection('users').doc(userId).collection('habits').limit(10).get(),
            db.collection('users').doc(userId).collection('finance').limit(10).get(),
        ]);

        const context = {
            tasks: tasksSnapshot.docs.map(doc => doc.data()),
            habits: habitsSnapshot.docs.map(doc => doc.data()),
            finance: financeSnapshot.docs.map(doc => doc.data()),
        };

        const model = getGenAI().getGenerativeModel({ model: MODEL_NAME, safetySettings: SAFETY_SETTINGS });

        const chat = model.startChat({
            history: history || [],
            systemInstruction: `You are LifeHub, a professional executive assistant.
        Tone: Concise, encouraging, proactive.
        Goal: Reduce cognitive load.
        
        ${LEGAL_DISCLAIMER}
        
        User Context Summary:
        - tasks: ${context.tasks.length}
        - habits: ${context.habits.length}
        - finance: ${context.finance.length}
        
        Answer the user's request using this context if relevant.`
        });

        const result = await chat.sendMessage(safeMessage);
        const response = result.response.text();

        res.status(200).json({
            response,
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

        // REDACTION: Scrub PII
        const safeText = Redactor.scrub(text);

        // AUDIT LOG: Prove that we are sending REDACTED text to Google
        logger.info(`[Privacy] Sending Redacted Text to AI: "${safeText}"`);

        const model = getGenAI().getGenerativeModel({
            model: MODEL_NAME,
            safetySettings: SAFETY_SETTINGS,
            generationConfig: { responseMimeType: "application/json" } // Force JSON
        });

        const prompt = `
      Analyze this user input: "${safeText}"
      Extract actionable items into a structured list of Entities.
      
      ${LEGAL_DISCLAIMER}
      
      SCHEMA:
      {
        "entities": [
          { 
            "type": "task" | "habit" | "finance",
            "confidence": number,
            "data": { "title": string, "priority"?: string, "amount"?: number, "dueDate"?: string }
          }
        ],
        "summary": "string"
      }
      
      CRITICAL RULES:
      1. IF Financial Advice (e.g. "Buy Bitcoin", "Invest in X"):
         - RETURN entities: []
         - RETURN summary: "I'm better at tracking assets than picking them! 📉 I can't give investment advice."
      2. IF Medical Advice (e.g. "What to take for headache?"):
         - RETURN entities: []
         - RETURN summary: "I can't play doctor, but I can remind you to call one! 💊"
      3. IF Shopping (e.g. "Buy milk", "Buy tablets"):
         - Create Task.
    `;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Clean markdown before parse (Gemini likes to add ```json)
            const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned || '{}');
            res.status(200).json(parsed);

        } catch (aiError: any) {
            logger.error(`Gemini Gen Error: ${aiError.message}`);
            // Graceful Degragation: Return 200 OK with a generic refusal/error message
            // This prevents the Red Console Error on the frontend and shows a nice Toast instead.
            res.status(200).json({
                entities: [],
                summary: "I'm having trouble retrieving that right now. 🧠"
            });
        }
    } catch (error: any) {
        // Detailed Logging for Debugging
        logger.error('Brain dump error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });

        // Fallback: If JSON parsing failed, return empty safe response
        if (error instanceof SyntaxError) {
            res.status(200).json({ entities: [], summary: "I couldn't process that securely." });
            return;
        }

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
        // Fetch Data
        const [tasksSnapshot, habitsSnapshot, financeSnapshot] = await Promise.all([
            db.collection('users').doc(userId).collection('tasks').limit(50).get(),
            db.collection('users').doc(userId).collection('habits').get(),
            db.collection('users').doc(userId).collection('finance').get(),
        ]);

        const dataSummary = `Tasks: ${tasksSnapshot.size}, Habits: ${habitsSnapshot.size}, Finance: ${financeSnapshot.size}`;

        const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Generate Executive Brief. Stats: ${dataSummary}. ${LEGAL_DISCLAIMER}. Structure: 1. Summary, 2. Wins, 3. Focus.`;

        const result = await model.generateContent(prompt);
        const reportText = result.response.text();

        // Save
        const reportRef = await db.collection('users').doc(userId).collection('reports').add({
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
