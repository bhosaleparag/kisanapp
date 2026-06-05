import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    const response = await fetch(localUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profiles/${uid}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('[ProfileService] Storage upload failed, falling back to local URI:', error);
    return localUri;
  }
};
