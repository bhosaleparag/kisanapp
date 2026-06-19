import { auth, isMock } from './firebase';
import { GoogleAuthProvider } from '@react-native-firebase/auth';

/**
 * Handle Google Sign-in.
 * If isMock is true, simulates Google Sign-in and returns a mock user credential.
 * If isMock is false, performs actual native Google Sign-in and links with Firebase Auth.
 */
export const signInWithGoogle = async (name, phone) => {
  if (isMock) {
    console.log('[AuthService] Mock Mode: Simulating Google Login for', name, phone);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Return a mock Firebase-like user object
    return {
      user: {
        uid: `mock-google-${phone}`,
        displayName: name,
        email: `farmer_${phone}@gmail.com`,
        phoneNumber: `+91${phone}`,
      }
    };
  }

  try {
    // Dynamic import to prevent Metro bundling error in mock environments
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    
    // Configure Google Sign-in
    GoogleSignin.configure({
      webClientId: '107787654125-b06a7vlm92q4dujlvgbo2lraehkblrop.apps.googleusercontent.com',
      offlineAccess: true,
    });

    // Ensure play services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Trigger Google Sign-in popup
    const signInResult = await GoogleSignin.signIn();
    
    // React Native Google Signin version compatibility check for idToken location
    const idToken = signInResult.idToken || (signInResult.data && signInResult.data.idToken);
    
    if (!idToken) {
      throw new Error('Google Sign-in failed: No ID Token retrieved.');
    }
    
    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);
    
    // Sign-in the user with the credential
    const userCredential = await auth.signInWithCredential(googleCredential);
    return userCredential;
  } catch (error) {
    console.error('[AuthService] Google Sign-in failed:', error);
    throw error;
  }
};

/**
 * Sign out the current user.
 * Handles both mock mode and Firebase native sign out + Google Sign-in sign out.
 */
export const signOutUser = async () => {
  if (isMock) {
    console.log('[AuthService] Mock Mode: Simulating sign out');
    return;
  }

  try {
    if (auth) {
      await auth.signOut();
    }
    
    // Also sign out from Google Sign-in so user is prompted to choose account next time
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut();
    } catch (gError) {
      console.warn('[AuthService] Google Sign-in signOut failed or package not installed:', gError);
    }
  } catch (error) {
    console.error('[AuthService] Sign out failed:', error);
    throw error;
  }
};
