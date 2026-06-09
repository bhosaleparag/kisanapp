import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Image, StatusBar } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';

/**
 * Premium Animated Splash Screen for KisanApp
 * Designed to show high-contrast branding, handle entrance animations,
 * and transition smoothly once authentication state is resolved.
 */
export default function SplashScreen({ authResolved, onFinish }) {
  // Animation value references
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Track state to trigger exit sequence once ready
  const isReadyToExit = useRef(false);

  useEffect(() => {
    // 1. Trigger Entrance Animations
    Animated.parallel([
      // Logo Scale & Fade-in
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      // Text and Tagline slide & Fade-in (slight delay)
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      // Loader Fade-in (longer delay)
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 500,
        delay: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Minimum display timer to prevent flashing and let user experience the animations
    const minTimer = setTimeout(() => {
      isReadyToExit.current = true;
      checkAndExit();
    }, 2200);

    return () => clearTimeout(minTimer);
  }, []);

  // Watch authResolved updates to handle transitions
  useEffect(() => {
    if (authResolved) {
      checkAndExit();
    }
  }, [authResolved]);

  const checkAndExit = () => {
    // Exit only if BOTH the minimum animation time has elapsed and the auth check is resolved
    if (isReadyToExit.current && authResolved) {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      
      {/* Visual branding block */}
      <View style={styles.brandContainer}>
        {/* Animated Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../../assets/app-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Titles */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.appName}>{STRINGS.common.appName}</Text>
          <Text style={styles.tagline}>{STRINGS.splash.tagline}</Text>
        </Animated.View>
      </View>

      {/* Loading section at bottom */}
      <Animated.View style={[styles.loaderContainer, { opacity: loaderOpacity }]}>
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
          style={styles.spinner}
        />
        <Text style={styles.loaderText}>{STRINGS.splash.loadingApp}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 1.5,
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    padding: SPACING.md,
  },
  logo: {
    width: '90%',
    height: '90%',
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: TYPOGRAPHY.fontSizeSm + 1,
    fontWeight: '600',
    color: COLORS.primaryLight,
    marginTop: SPACING.sm,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  spinner: {
    marginBottom: SPACING.sm,
  },
  loaderText: {
    fontSize: TYPOGRAPHY.fontSizeXs + 1,
    color: COLORS.primaryLight,
    fontWeight: '600',
    opacity: 0.85,
    textAlign: 'center',
  },
});
