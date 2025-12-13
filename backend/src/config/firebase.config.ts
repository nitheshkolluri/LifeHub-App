import admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    try {
        // Check if already initialized
        if (admin.apps.length > 0) {
            logger.info('Firebase Admin already initialized');
            return admin.app();
        }

        // Initialize with service account
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            });
            logger.info('Firebase Admin initialized with service account file');
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            });
            logger.info('Firebase Admin initialized with inline JSON');
        } else {
            // Use default credentials (for Google Cloud environments)
            admin.initializeApp();
            logger.info('Firebase Admin initialized with default credentials');
        }

        return admin.app();
    } catch (error) {
        logger.error('Failed to initialize Firebase Admin:', error);
        throw error;
    }
};

// Initialize Firebase
initializeFirebase();

// Export Firebase services
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

export default admin;
