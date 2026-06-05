import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { STRINGS } from '../constants/strings';

/**
 * Premium Full-Screen/Component Loader
 * Wraps react-native-paper ActivityIndicator with a large high-contrast visual cue.
 */
export default function Loader({
  message = STRINGS.common.loading,
  fullScreen = false,
}) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={styles.spinner}
      />
      {message && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  spinner: {
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
});
