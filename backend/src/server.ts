import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler.middleware';
import { requestLogger } from './middleware/monitoring.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/tasks.routes';
import habitRoutes from './routes/habits.routes';
import financeRoutes from './routes/finance.routes';
import subscriptionRoutes from './routes/subscription.routes';
import webhookRoutes from './routes/webhook.routes';
import assistantRoutes from './routes/assistant.routes';
import userRoutes from './routes/user.routes';

import './config/firebase.config'; // Ensure Firebase is initialized explicitly

// Load environment variables
dotenv.config();

const app: Application = express();
console.log("Express app initialized.");
const PORT = process.env.PORT || 3001; // Changed default to 3001 to avoid conflicts

// Start Background Services
// Start Background Services
// startTaskScheduler(); // Deprecated in favor of Cloud Scheduler trigger

// Internal Cron Trigger (Secure this in production with API Key or IAM)
app.post('/api/cron/trigger', async (req, res) => {
    try {
        const { triggerTaskCheck } = require('./services/schedulerService');
        const result = await triggerTaskCheck();
        res.status(200).json(result);
    } catch (error) {
        console.error('Manual Trigger Error:', error);
        res.status(500).json({ error: 'Failed to trigger task check' });
    }
});

// DEV-ONLY: Simulate Google Cloud Scheduler locally for easier debugging
// usage: npm run dev
if (process.env.NODE_ENV !== 'production') {
    console.log("🛠️  Development Mode: Auto-triggering Scheduler every 60s...");
    setInterval(async () => {
        try {
            const { triggerTaskCheck } = require('./services/schedulerService');
            // Check silently
            await triggerTaskCheck();
        } catch (err) {
            console.error("Dev Scheduler Error:", err);
        }
    }, 60000); // 1 minute
}

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/user', userRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

// ============================================
// START SERVER
// ============================================

console.log("Attempting to start server...");
console.log(`Configured PORT: ${PORT}`);

const server = app.listen(PORT, () => {
    console.log("------------------------------------------------");
    logger.info(`🚀 LifeHub Backend API running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log("------------------------------------------------");
});

server.on('error', (e) => {
    console.error("SERVER URL BIND ERROR:", e);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

export default app;
