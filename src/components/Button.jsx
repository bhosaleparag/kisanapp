import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { COLORS, SIZES, TYPOGRAPHY, SPACING } from '../constants/theme';

/**
 * Farmer-Friendly Premium Button Component
 * Built on top of react-native-paper for native ripples, theme compliance, and premium feel.
 */
export default function Button({
  title,
  onPress,
  mode = 'contained', // 'contained' | 'outlined' | 'text' | 'elevated' | 'contained-tonal'
  loading = false,
  disabled = false,
  icon,
  style = {},
  labelStyle = {},
  color,
}) {
  // Determine text color based on button mode
  let textColor = '#FFFFFF';
  if (mode === 'outlined' || mode === 'text') {
    textColor = color || COLORS.primary;
  } else if (mode === 'contained-tonal') {
    textColor = COLORS.primaryDark;
  }

  // Determine button background color for contained buttons
  const buttonColor = mode === 'contained' ? (color || COLORS.primary) : undefined;

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      buttonColor={buttonColor}
      textColor={textColor}
      style={[styles.button, style]}
      labelStyle={[styles.label, labelStyle]}
      contentStyle={styles.content}
    >
      {title}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radiusMd,
    marginVertical: SPACING.xs,
    justifyContent: 'center',
    // Minimum height of 56dp to ensure large touch target for farmer hands in dusty environments
    minHeight: 56,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: TYPOGRAPHY.fontSizeMd, // 18px bold text for high legibility in sunlight
    fontWeight: 'bold',
    lineHeight: TYPOGRAPHY.lineHeightMd,
    letterSpacing: 0.5,
  },
});
