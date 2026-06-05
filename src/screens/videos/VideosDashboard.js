import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';

export default function VideosDashboard({ onSelectCategory }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>{STRINGS.videos.title}</Text>
        <Text style={styles.headerSubtitle}>{STRINGS.videos.subtitle}</Text>
      </View>

      <Text style={styles.sectionTitle}>{STRINGS.videos.selectInfoType}</Text>

      <TouchableOpacity
        onPress={() => onSelectCategory('subject')}
        activeOpacity={0.85}
        style={[styles.categoryCard, { borderLeftColor: COLORS.primary }]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconWrapper, { backgroundColor: COLORS.primaryLight }]}>
            <MaterialCommunityIcons name="book-open-page-variant" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle}>{STRINGS.videos.subjects}</Text>
            <Text style={styles.cardSubtitle}>{STRINGS.videos.subjectsSubtitle}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </View>
        <Text style={styles.cardDescription}>{STRINGS.videos.subjectsDesc}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelectCategory('author')}
        activeOpacity={0.85}
        style={[styles.categoryCard, { borderLeftColor: COLORS.secondary }]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconWrapper, { backgroundColor: COLORS.secondaryLight }]}>
            <MaterialCommunityIcons name="account-tie" size={28} color={COLORS.secondary} />
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle}>{STRINGS.videos.experts}</Text>
            <Text style={styles.cardSubtitle}>{STRINGS.videos.expertsSubtitle}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </View>
        <Text style={styles.cardDescription}>{STRINGS.videos.expertsDesc}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelectCategory('company')}
        activeOpacity={0.85}
        style={[styles.categoryCard, { borderLeftColor: COLORS.accent }]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconWrapper, { backgroundColor: COLORS.accentLight }]}>
            <MaterialCommunityIcons name="office-building" size={28} color={COLORS.accent} />
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle}>{STRINGS.videos.companies}</Text>
            <Text style={styles.cardSubtitle}>{STRINGS.videos.companiesSubtitle}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </View>
        <Text style={styles.cardDescription}>{STRINGS.videos.companiesDesc}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusMd,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSizeLg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeightSm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 6,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginLeft: 60,
  },
});
