import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';

// In native Firebase, initialization is done natively via google-services.json.
// We check for mock mode based on environmental variables.
const isMock = process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'MOCK_API_KEY' || !process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

if (isMock) {
  console.warn(
    '[KisanApp Firebase] Warning: Using Mock Mode because placeholder Firebase credentials are set.'
  );
}

let authInstance = null;
let dbInstance = null;
let storageInstance = null;

try {
  authInstance = getAuth();
} catch (error) {
  console.error('[KisanApp Firebase] Native Auth initialization failed:', error);
}

try {
  dbInstance = getFirestore();
} catch (error) {
  console.error('[KisanApp Firebase] Native Firestore initialization failed:', error);
}

try {
  storageInstance = getStorage();
} catch (error) {
  console.error('[KisanApp Firebase] Native Storage initialization failed:', error);
}

export { authInstance as auth, dbInstance as db, storageInstance as storage, isMock };
