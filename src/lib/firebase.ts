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
  varName => !import.meta.env[varName]
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
  throw new Error('Firebase configuration incomplete. Check console for details.');
}

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Log successful initialization (without sensitive data)
console.log('✅ Firebase initialized successfully for project:', firebaseConfig.projectId);
