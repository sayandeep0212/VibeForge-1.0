import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  Auth,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase config is available
const isConfigured = !!firebaseConfig.apiKey;

// Initialize Firebase (prevent duplicate initialization)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;
let analytics: Analytics | null = null;

if (isConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  
  // Set persistence to local to prevent session loss on mobile browsers
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch(console.error);
  }
  
  db = getDatabase(app);
  
  // Analytics only works in the browser — fail silently if blocked (ad blockers, API key restrictions)
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch {
      // Analytics blocked or unavailable — not critical
    }
  }
}

// OAuth Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Helper to get db with null check
function getDb(): Database {
  if (!db) throw new Error('Firebase Database not configured. Please set environment variables in .env.local');
  return db;
}

function getFirebaseAuth(): Auth {
  if (!auth) throw new Error('Firebase Auth not configured. Please set environment variables in .env.local');
  return auth;
}

export { app, auth, db, analytics, googleProvider, githubProvider, isConfigured, getDb, getFirebaseAuth };
