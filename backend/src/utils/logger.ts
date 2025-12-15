import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: combine(
            colorize(),
            logFormat
        ),
    }),
];

// Add file logging only in development
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
        })
    );
}

// Create logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: transports,
    // Errors/Rejections to console in prod (handled by transports), files in dev
    exceptionHandlers: process.env.NODE_ENV !== 'production' ? [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ] : undefined,
    rejectionHandlers: process.env.NODE_ENV !== 'production' ? [
        new winston.transports.File({ filename: 'logs/rejections.log' })
    ] : undefined,
});
