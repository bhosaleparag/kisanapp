import { NativeModules } from 'react-native';
import { Audio } from 'expo-av';
import { isMock } from './firebase';

// Helper to safely load the native voice recognition package at runtime.
// This is only called when we are sure the native module is present on the bridge,
// preventing static import crashes in standard Expo Go clients.
const getVoiceModule = () => {
  try {
    return require('@react-native-voice/voice').default;
  } catch (e) {
    console.warn('[SpeechService] Failed to require @react-native-voice/voice:', e);
    return null;
  }
};

/**
 * Check if the application has microphone/audio permissions.
 */
export const checkMicrophonePermission = async () => {
  try {
    const { granted, canAskAgain } = await Audio.getPermissionsAsync();
    return { granted, canAskAgain };
  } catch (error) {
    console.error('[SpeechService] Error checking permissions:', error);
    return { granted: false, canAskAgain: true };
  }
};

/**
 * Request microphone/audio permissions from the user.
 */
export const requestMicrophonePermission = async () => {
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    return granted;
  } catch (error) {
    console.error('[SpeechService] Error requesting permissions:', error);
    return false;
  }
};

/**
 * Check if the native voice recognition module is available.
 * Inspects the React Native Bridge to see if the Native Module 'Voice' exists.
 * Returns false when running in Expo Go or Web, preventing crashes.
 */
export const isNativeVoiceAvailable = () => {
  if (isMock) return false;
  try {
    // Verify that the NativeModule exists.
    // In Expo Go, NativeModules.Voice is null/undefined.
    return !!NativeModules.Voice;
  } catch (e) {
    return false;
  }
};

/**
 * Initialize listeners and start Native Speech Recognition.
 * Locale set to 'mr-IN' for Marathi.
 */
export const startNativeVoice = async (options = {}) => {
  if (!isNativeVoiceAvailable()) {
    console.warn('[SpeechService] startNativeVoice was called but Native Voice module is unavailable.');
    return;
  }

  const Voice = getVoiceModule();
  if (!Voice) return;

  const { onStart, onEnd, onResults, onVolumeChange, onError } = options;

  // Set up event listeners
  if (onStart) Voice.onSpeechStart = onStart;
  if (onEnd) Voice.onSpeechEnd = onEnd;
  
  if (onResults) {
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        onResults(e.value[0]); // Return the top-scoring matched query phrase
      }
    };
  }
  
  if (onVolumeChange) {
    Voice.onSpeechVolumeChanged = (e) => {
      // Scale from e.value (usually 0 to 10/20 depending on OS)
      onVolumeChange(e.value || 0);
    };
  }
  
  if (onError) Voice.onSpeechError = onError;

  try {
    // Start listening in Marathi (India)
    await Voice.start('mr-IN');
  } catch (error) {
    console.error('[SpeechService] Error starting Native Voice:', error);
    if (onError) onError(error);
  }
};

/**
 * Stop speech recognition.
 */
export const stopNativeVoice = async () => {
  if (!isNativeVoiceAvailable()) return;
  const Voice = getVoiceModule();
  if (!Voice) return;

  try {
    await Voice.stop();
  } catch (error) {
    console.error('[SpeechService] Error stopping Native Voice:', error);
  }
};

/**
 * Cleanup Voice listeners and resources.
 */
export const destroyNativeVoice = async () => {
  if (!isNativeVoiceAvailable()) return;
  const Voice = getVoiceModule();
  if (!Voice) return;

  try {
    await Voice.destroy();
    
    // Remove listeners
    Voice.onSpeechStart = null;
    Voice.onSpeechEnd = null;
    Voice.onSpeechResults = null;
    Voice.onSpeechVolumeChanged = null;
    Voice.onSpeechError = null;
  } catch (error) {
    console.error('[SpeechService] Error destroying Native Voice:', error);
  }
};
