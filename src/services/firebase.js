import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fetch credentials from Expo environment variables (prefixed with EXPO_PUBLIC_)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'MOCK_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-app.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'mock-app',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock-app.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:1234567890',
};

// Log warning if mock credentials are being used
const isMock = firebaseConfig.apiKey === 'MOCK_API_KEY';
if (isMock) {
  console.warn(
    '[KisanApp Firebase] Warning: Using placeholder Firebase credentials. ' +
    'Please set EXPO_PUBLIC_FIREBASE_ env variables in Phase 7.'
  );
}

// Initialize Firebase App
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('[KisanApp Firebase] App initialization failed:', error);
}

// Initialize Firebase Auth with React Native persistence to ensure user session survives app restarts
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  console.error('[KisanApp Firebase] Auth initialization failed:', error);
}

// Initialize Firestore with default memory cache to prevent IndexedDB unimplemented warnings on mobile
let db;
try {
  db = initializeFirestore(app, {});
} catch (error) {
  console.error('[KisanApp Firebase] Firestore initialization failed:', error);
}

// Initialize Firebase Storage
let storage;
try {
  storage = getStorage(app);
} catch (error) {
  console.error('[KisanApp Firebase] Storage initialization failed:', error);
}

export { app, auth, db, storage, isMock };
