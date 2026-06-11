import { Platform } from 'react-native';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from '@react-native-firebase/firestore';
import { ref, putFile, getDownloadURL } from '@react-native-firebase/storage';
import { db, storage, isMock } from './firebase';

/**
 * Fetch a user profile document from Firestore by user UID.
 * Returns null if the document does not exist.
 */
export const getProfile = async (uid) => {
  if (!uid) return null;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('[ProfileService] Error in getProfile:', error);
    // Return null on failure to allow offline or local mock mode to proceed gracefully
    return null;
  }
};

/**
 * Query user profile by phone number.
 * Returns the profile object if found, otherwise null.
 */
export const getProfileByPhone = async (phone) => {
  if (!phone) return null;
  // Clean phone input by removing country code and whitespace
  const cleanPhone = phone.replace('+91', '').trim();

  if (isMock) {
    console.log('[ProfileService] Mock Firebase: Looking up profile by phone:', cleanPhone);
    // Designate test configurations for local offline verification
    if (cleanPhone === '9999999999') {
      return {
        uid: 'mock-blocked-uid',
        phone: '9999999999',
        name: 'Blocked Farmer',
        isActive: true,
        isBlocked: true,
      };
    }
    if (cleanPhone === '8888888888') {
      return {
        uid: 'mock-inactive-uid',
        phone: '8888888888',
        name: 'Inactive Farmer',
        isActive: false,
        isBlocked: false,
      };
    }
    return null;
  }

  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('phone', '==', cleanPhone));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { uid: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('[ProfileService] Error in getProfileByPhone:', error);
    return null;
  }
};

/**
 * Save or update a user profile document in Firestore.
 * Automatically handles uploading profile image to Firebase Storage if selected.
 */
export const saveProfile = async (uid, profileData, localImageUri) => {
  if (!uid) throw new Error('User UID is required to save profile');

  try {
    let profileImageUrl = profileData.profileImage || '';

    // If a new local image was selected and needs uploading
    if (localImageUri && !localImageUri.startsWith('http')) {
      profileImageUrl = await uploadProfileImage(uid, localImageUri);
    }

    const docRef = doc(db, 'users', uid);
    const completedProfile = {
      ...profileData,
      uid,
      profileImage: profileImageUrl,
      updatedAt: new Date().toISOString(),
    };

    // If createdAt is missing, inject it
    if (!completedProfile.createdAt) {
      completedProfile.createdAt = new Date().toISOString();
    }

    await setDoc(docRef, completedProfile, { merge: true });
    return completedProfile;
  } catch (error) {
    console.error('[ProfileService] Error in saveProfile:', error);
    throw error;
  }
};

/**
 * Upload profile image to Firebase Storage.
 * Gracefully falls back to local URI in case of mock configuration or network errors.
 */
export const uploadProfileImage = async (uid, localUri) => {
  if (!localUri) return '';

  if (isMock) {
    console.log('[ProfileService] Mock Firebase: Using local image URI for profile picture');
    return localUri;
  }

  try {
    // In native storage, we can upload using putFile directly with the local file path!
    // Since React Native localUri could be prefixed with file://, let's normalize it.
    const fileUri = Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;
    const storageRef = ref(storage, `profiles/${uid}.jpg`);
    await putFile(storageRef, fileUri);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('[ProfileService] Storage upload failed, falling back to local URI:', error);
    return localUri;
  }
};
