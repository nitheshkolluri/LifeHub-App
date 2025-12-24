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
            // Try multiple common paths for robustness
            const possiblePaths = [
                path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH), // Use provided path relative to CWD
                path.resolve(process.cwd(), 'service-account.json'),
                path.resolve(process.cwd(), 'backend', 'service-account.json'), // If run from root
                path.join(__dirname, '../../service-account.json') // Relative to source
            ];

            let serviceAccountPath = '';
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    serviceAccountPath = p;
                    break;
                }
            }

            console.log('Current Work Dir:', process.cwd());
            console.log('Attempted Paths:', possiblePaths);

            if (serviceAccountPath) {
                const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
                const serviceAccount = JSON.parse(fileContent);

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://lifehub-app-v2.firebaseio.com', // Explicit fallback
                });
                console.log('SUCCESS: Firebase Admin initialized with:', serviceAccountPath);
                logger.info(`Firebase Admin initialized with local file: ${serviceAccountPath}`);
            } else {
                console.error('CRITICAL: No service-account.json found in any expected location.');
                // Finally, fallback to default credentials (GCloud)
                console.log('Falling back to default credentials (ADC).');
                admin.initializeApp();
                logger.info('Firebase Admin initialized with default credentials');
            }
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            });
            logger.info('Firebase Admin initialized with inline JSON');
        } else {
            // No env vars set, try to load local service account (Dev/Local fallback)
            try {
                const path = require('path');
                const fs = require('fs');
                // Try multiple common paths for robustness
                const possiblePaths = [
                    path.resolve(process.cwd(), 'service-account.json'),
                    path.resolve(process.cwd(), 'backend', 'service-account.json'), // If run from root
                    path.join(__dirname, '../../service-account.json') // Relative to source
                ];

                let serviceAccountPath = '';
                for (const p of possiblePaths) {
                    if (fs.existsSync(p)) {
                        serviceAccountPath = p;
                        break;
                    }
                }

                console.log('Current Work Dir:', process.cwd());
                console.log('Attempted Paths for Fallback:', possiblePaths);

                if (serviceAccountPath) {
                    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
                    const serviceAccount = JSON.parse(fileContent);

                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://lifehub-app-v2.firebaseio.com',
                    });
                    console.log('SUCCESS: Firebase Admin initialized with local fallback:', serviceAccountPath);
                    logger.info(`Firebase Admin initialized with local fallback: ${serviceAccountPath}`);
                } else {
                    // Finally, fallback to default credentials (GCloud)
                    console.log('No local service-account.json found in fallback paths. Using ADC.');
                    admin.initializeApp();
                    logger.info('Firebase Admin initialized with default credentials');
                }
            } catch (e) {
                console.error('ERROR loading service account in fallback:', e);
                admin.initializeApp();
            }
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
