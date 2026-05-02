import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config read from Vite env (VITE_FIREBASE_*)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasRequiredConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

export const hasFirebaseConfig = hasRequiredConfig;

let _firebaseApp = null;
let _db = null;

/**
 * Initialize Firebase app (idempotent).
 * Called automatically on import when config exists, but exported so callers can ensure initialization.
 */
export function initFirebase() {
  if (!hasRequiredConfig) return null;
  if (_firebaseApp) return _firebaseApp;
  _firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _db = getFirestore(_firebaseApp);
  return _firebaseApp;
}

// Initialize eagerly when config is present to preserve previous behavior.
if (hasRequiredConfig) {
  initFirebase();
}

/**
 * Returns Firestore DB instance or null if Firebase is not configured.
 */
export function getDb() {
  return _db;
}

// Backwards-compatible export name used elsewhere in the codebase
export const db = getDb();
