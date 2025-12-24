import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * 
 * IMPORTANT: All Firebase credentials must be set via environment variables.
 * Copy .env.example to .env and fill in your Firebase project details.
 * 
 * Required environment variables:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 * - VITE_FIREBASE_MEASUREMENT_ID (optional)
 */

import { getEnv } from '../utils/env';

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(
  varName => !getEnv(varName)
);

if (missingVars.length > 0) {
  const errorMessage = `
    ❌ Firebase Configuration Error
    
    Missing required environment variables:
    ${missingVars.map(v => `  - ${v}`).join('\n')}
    
    Please follow these steps:
    1. Copy .env.example to .env
    2. Fill in your Firebase project credentials
    3. Restart the development server
    
    See docs/ENVIRONMENT_SETUP.md for detailed instructions.
  `;

  console.error(errorMessage);
  throw new Error(`Firebase configuration incomplete. Missing: ${missingVars.join(', ')}`);
}


// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID') || undefined
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Log successful initialization (without sensitive data)
// Log successful initialization (without sensitive data)
console.log('✅ Firebase initialized successfully');
console.log('   - Project:', firebaseConfig.projectId);
console.log('   - Auth Domain:', firebaseConfig.authDomain);
console.log('   - Source:', (window as any).env ? 'Runtime (window.env)' : 'Build-time (import.meta.env)');
console.log('   - API Key Present:', !!firebaseConfig.apiKey);

