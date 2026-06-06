import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Platform,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, TYPOGRAPHY } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import {
  isNativeVoiceAvailable,
  startNativeVoice,
  stopNativeVoice,
  destroyNativeVoice,
  checkMicrophonePermission,
} from '../services/speechService';

/**
 * Premium Voice Search Modal
 * Integrates @react-native-voice/voice with a sleek custom layout:
 * - Direct native speech recognition in Marathi (mr-IN).
 * - High-refresh wave visualizer mapped to sound volume metering values.
 * - Interactive grid of local agricultural suggestion tags.
 * - Seamless automatic simulation fallback when run inside standard Expo Go or web browsers.
 */
export default function VoiceSearchModal({
  visible,
  onClose,
  onSearchResult,
  suggestions = STRINGS.videos.voiceSearchSuggestions,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Animations refs
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseOpacity1 = useRef(new Animated.Value(0.6)).current;
  const pulseOpacity2 = useRef(new Animated.Value(0.6)).current;

  // Waveform animations (7 frequency bars)
  const barAnims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  // Timers and animations control loops
  const idlePulseRef = useRef(null);
  const idleWaveRef = useRef(null);
  const mockTimeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setErrorMessage(null);
      checkPermissionsAndInitialize();
    } else {
      cleanupAudio();
    }
    return () => {
      cleanupAudio();
    };
  }, [visible]);

  const checkPermissionsAndInitialize = async () => {
    const { granted } = await checkMicrophonePermission();
    setPermissionGranted(granted);
    if (granted) {
      beginVoiceSearch();
    } else {
      setIsListening(false);
    }
  };

  const beginVoiceSearch = async () => {
    try {
      setErrorMessage(null);
      setIsProcessing(false);
      setIsListening(true);

      startPulsingAnimation();

      if (isNativeVoiceAvailable()) {
        // Run real speech-to-text using native @react-native-voice/voice
        await startNativeVoice({
          onStart: () => {
            setIsListening(true);
            setIsProcessing(false);
            startIdleWaveform(); // Runs a base wave that reacts to volume updates
          },
          onEnd: () => {
            // Recognition ended
          },
          onResults: (resultText) => {
            if (resultText) {
              onSearchResult(resultText);
              onClose();
            }
          },
          onVolumeChange: (volumeVal) => {
            // val is typically 0 to 10/20. Scale to match bar visualizer heights (0.2 to 2.5)
            const scale = Math.max(0.2, Math.min(2.5, volumeVal / 4));
            updateWaveform(scale);
          },
          onError: (e) => {
            console.error('[VoiceSearchModal] Native Speech Error:', e);
            // Treat speech unrecognized error gracefully without freezing
            if (e.error && e.error.message && e.error.message.includes('No match')) {
              setErrorMessage(STRINGS.videos.voiceSearchNoMatch);
            } else {
              // Standard timeout or connection fallback
              setErrorMessage(STRINGS.videos.voiceSearchNoMatch);
            }
            setIsListening(false);
          },
        });
      } else {
        // Fallback/Mock Mode: run visual animations and simulate recognition
        startIdleWaveform();

        // Wait 3.5s to auto-simulate a search query to guide testing
        mockTimeoutRef.current = setTimeout(() => {
          handleMockAutoTranscribe();
        }, 3500);
      }
    } catch (err) {
      console.error('[VoiceSearchModal] Failed to start voice search:', err);
      setIsListening(false);
      setErrorMessage(STRINGS.videos.voiceSearchPermissionSettings);
    }
  };

  const cleanupAudio = async () => {
    stopAnimations();
    if (mockTimeoutRef.current) {
      clearTimeout(mockTimeoutRef.current);
      mockTimeoutRef.current = null;
    }
    try {
      await stopNativeVoice();
      await destroyNativeVoice();
    } catch (e) {
      // Safe check
    }
    setIsListening(false);
    setIsProcessing(false);
  };

  const handleMockAutoTranscribe = async () => {
    setIsListening(false);
    setIsProcessing(true);
    stopAnimations();

    // Simulate API/transcription latency
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const randomIndex = Math.floor(Math.random() * suggestions.length);
    const phrase = suggestions[randomIndex];
    onSearchResult(phrase);
    onClose();
  };

  // Pulsing mic button rings animation
  const startPulsingAnimation = () => {
    pulseAnim1.setValue(1);
    pulseAnim2.setValue(1);
    pulseOpacity1.setValue(0.6);
    pulseOpacity2.setValue(0.6);

    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim1, {
              toValue: 2.2,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity1, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(750),
          Animated.parallel([
            Animated.timing(pulseAnim2, {
              toValue: 2.2,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity2, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );

    idlePulseRef.current = animation;
    animation.start();
  };

  // Undulating wave visualizer animation (idle/fallback state)
  const startIdleWaveform = () => {
    barAnims.forEach((anim) => anim.setValue(0.3));

    const animations = barAnims.map((anim, idx) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.8 - (idx % 3) * 0.4,
            duration: 350 + idx * 60,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 350 + idx * 60,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    });

    idleWaveRef.current = Animated.parallel(animations);
    idleWaveRef.current.start();
  };

  // Reactive waveform updater triggered by volume change listener
  const updateWaveform = (scale) => {
    // Stop the idle automatic loop to allow mic amplitude to dictate heights
    if (idleWaveRef.current) {
      idleWaveRef.current.stop();
      idleWaveRef.current = null;
    }

    barAnims.forEach((anim, idx) => {
      const variance = 0.4 + Math.sin(idx + Date.now() / 100) * 0.4;
      const targetScale = scale * (1 + variance);

      Animated.timing(anim, {
        toValue: Math.max(0.2, Math.min(2.5, targetScale)),
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  };

  const stopAnimations = () => {
    if (idlePulseRef.current) {
      idlePulseRef.current.stop();
      idlePulseRef.current = null;
    }
    if (idleWaveRef.current) {
      idleWaveRef.current.stop();
      idleWaveRef.current = null;
    }
  };

  const handleStopAndTranscribe = async () => {
    if (!isListening) return;

    setIsListening(false);
    setIsProcessing(true);
    stopAnimations();

    if (mockTimeoutRef.current) {
      clearTimeout(mockTimeoutRef.current);
      mockTimeoutRef.current = null;
    }

    if (isNativeVoiceAvailable()) {
      try {
        await stopNativeVoice();
      } catch (err) {
        console.error('[VoiceSearchModal] Error stopping native voice:', err);
        setErrorMessage(STRINGS.videos.voiceSearchNoMatch);
        setIsProcessing(false);
      }
    } else {
      // Mock mode: immediately trigger a search suggestion match
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const randomIndex = Math.floor(Math.random() * suggestions.length);
      onSearchResult(suggestions[randomIndex]);
      onClose();
    }
  };

  const handleSuggestionTap = async (phrase) => {
    await cleanupAudio();
    onSearchResult(phrase);
    onClose();
  };

  const handleGrantPermission = async () => {
    const granted = await checkMicrophonePermission();
    if (!granted.granted) {
      const { requestPermissionsAsync } = require('expo-av').Audio;
      const requested = await requestPermissionsAsync();
      setPermissionGranted(requested.granted);
      if (requested.granted) {
        beginVoiceSearch();
      } else {
        setErrorMessage(STRINGS.videos.voiceSearchPermissionSettings);
      }
    } else {
      setPermissionGranted(true);
      beginVoiceSearch();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeIconButton}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.sheetTitle}>
            {STRINGS.videos.voiceSearchTitle}
          </Text>

          <View style={styles.recordingArea}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
                <Text style={styles.errorHeader}>{STRINGS.videos.voiceSearchPermissionReq}</Text>
                <Text style={styles.errorSubtext}>{errorMessage}</Text>
                {permissionGranted === false && (
                  <TouchableOpacity
                    onPress={handleGrantPermission}
                    style={styles.permissionBtn}
                  >
                    <Text style={styles.permissionBtnText}>{STRINGS.videos.voiceSearchOk}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <Text style={styles.statusSubtitle}>
                  {isProcessing
                    ? STRINGS.videos.voiceSearchProcessing
                    : STRINGS.videos.voiceSearchListening}
                </Text>

                {/* Animated mic ring buttons */}
                <View style={styles.micAnimContainer}>
                  {isListening && (
                    <>
                      <Animated.View
                        style={[
                          styles.pulseRing,
                          {
                            transform: [{ scale: pulseAnim1 }],
                            opacity: pulseOpacity1,
                          },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.pulseRing,
                          {
                            transform: [{ scale: pulseAnim2 }],
                            opacity: pulseOpacity2,
                          },
                        ]}
                      />
                    </>
                  )}

                  <TouchableOpacity
                    onPress={isListening ? handleStopAndTranscribe : beginVoiceSearch}
                    style={[
                      styles.micButtonCircle,
                      isProcessing && styles.micButtonProcessing,
                    ]}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    ) : (
                      <MaterialCommunityIcons
                        name={isListening ? "microphone" : "microphone-off"}
                        size={36}
                        color="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Wave Visualizer */}
                {isListening && (
                  <View style={styles.waveContainer}>
                    {barAnims.map((anim, index) => (
                      <Animated.View
                        key={index}
                        style={[
                          styles.waveBar,
                          {
                            transform: [{ scaleY: anim }],
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Grid Suggestions */}
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>
              {STRINGS.videos.voiceSearchSuggestionsTitle}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScrollContent}
            >
              {suggestions.map((phrase, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSuggestionTap(phrase)}
                  style={styles.suggestionChip}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="magnify" size={16} color={COLORS.primary} style={styles.searchChipIcon} />
                  <Text style={styles.suggestionText}>{phrase}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Close cancel text */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.cancelBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>
              {STRINGS.videos.voiceSearchCancel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  closeIconButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: SIZES.largeTouchTarget,
    height: SIZES.largeTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sheetTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  recordingArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    minHeight: 200,
  },
  statusSubtitle: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeightSm,
  },
  micAnimContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  micButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 5,
  },
  micButtonProcessing: {
    backgroundColor: COLORS.secondary,
  },
  waveContainer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  waveBar: {
    width: 4,
    height: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  suggestionsSection: {
    width: '100%',
    marginVertical: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.fontSizeXs,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  suggestionsScrollContent: {
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.md,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusRound,
    paddingHorizontal: SPACING.md,
    height: SIZES.minTouchTarget,
    marginRight: SPACING.sm,
  },
  searchChipIcon: {
    marginRight: 4,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  cancelBtn: {
    width: '100%',
    height: SIZES.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorHeader: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  errorSubtext: {
    fontSize: TYPOGRAPHY.fontSizeXs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeightXs,
    marginBottom: SPACING.md,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SPACING.xl,
    height: SIZES.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: TYPOGRAPHY.fontSizeSm,
  },
});
