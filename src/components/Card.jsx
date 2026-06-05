import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card as PaperCard, Text } from 'react-native-paper';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../constants/theme';

/**
 * Premium Farmer Card
 * Wraps react-native-paper Card. Provides high contrast shadows and layout.
 */
export default function Card({
  title,
  subtitle,
  onPress,
  children,
  style = {},
  coverImage,
  actions,
}) {
  return (
    <PaperCard
      style={[styles.card, style]}
      onPress={onPress}
      theme={{ roundness: SIZES.radiusLg }}
    >
      <View style={styles.contentWrapper}>
        {coverImage && (
          <PaperCard.Cover source={{ uri: coverImage }} style={styles.cover} />
        )}
        <PaperCard.Content style={styles.content}>
          {title && (
            <Text variant="titleLarge" style={styles.title}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text variant="bodyMedium" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
          {children}
        </PaperCard.Content>
        {actions && <PaperCard.Actions style={styles.actions}>{actions}</PaperCard.Actions>}
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLg,
    // Enhanced high contrast elevation
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  contentWrapper: {
    borderRadius: SIZES.radiusLg - 1, // Subtly smaller than outer card border to prevent bleed
    overflow: 'hidden', // Mask and clip bottom action row and top cover images
    backgroundColor: COLORS.surface,
  },
  cover: {
    borderTopLeftRadius: SIZES.radiusLg - 1,
    borderTopRightRadius: SIZES.radiusLg - 1,
    height: 180,
  },
  content: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizeLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
});
