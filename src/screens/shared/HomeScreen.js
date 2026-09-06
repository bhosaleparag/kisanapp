import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card as PaperCard, Avatar } from 'react-native-paper';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAppStore } from '../../store/useAppStore';

const isProfileIncomplete = (user) => {
  return (
    !user ||
    !user.name ||
    !user.role ||
    !user.village ||
    !user.taluka ||
    !user.district ||
    !user.pincode
  );
};

export default function HomeScreen({ navigation }) {
  const user = useAppStore((state) => state.user);

  // Navigation trigger helper
  const navigateToTab = (tabName) => {
    navigation.navigate(tabName);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Personalized Welcome Header Banner */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>
              {user?.name ? `राम राम, ${user.name}!` : STRINGS.common.welcome}
            </Text>
            <Text style={styles.appNameText}>{STRINGS.common.appName} मध्ये आपले स्वागत आहे</Text>
          </View>
        </View>

        {/* Warning Banner: Complete Profile */}
        {isProfileIncomplete(user) && (
          <PaperCard style={styles.warningCard} mode="elevated">
            <PaperCard.Content>
              <View style={styles.warningHeaderRow}>
                <Text style={styles.warningEmoji}>⚠️</Text>
                <Text style={styles.warningTitle}>{STRINGS.home.warningTitle}</Text>
              </View>
              <Text style={styles.warningBody}>
                {STRINGS.home.warningBody}
              </Text>
              <Button
                title={STRINGS.home.warningBtn}
                onPress={() => navigation.navigate('Profile')}
                style={styles.warningBtn}
              />
            </PaperCard.Content>
          </PaperCard>
        )}

        {/* Module Section title */}
        <Text style={styles.sectionTitle}>{STRINGS.home.quickTitle}</Text>

        {/* Quick Navigate Cards Grid */}
        <View style={styles.quickLinksGrid}>
          {/* Marketplace shortcut */}
          <Card
            title={STRINGS.nav.marketplace}
            subtitle={STRINGS.marketplace.buySell}
            onPress={() => navigateToTab('Marketplace')}
            style={styles.gridCard}
          >
            <Text style={styles.cardInfo}>ओला, सुका चारा, मुरघास व इतर शेती साहित्य खरेदी किंवा विक्री करा.</Text>
          </Card>

          {/* Videos shortcut */}
          <Card
            title={STRINGS.nav.videos}
            subtitle={STRINGS.home.videoSubtitle}
            onPress={() => navigateToTab('Videos')}
            style={styles.gridCard}
          >
            <Text style={styles.cardInfo}>{STRINGS.home.videoDesc}</Text>
          </Card>

          {/* Bull Info shortcut */}
          <Card
            title={STRINGS.nav.bullInfo}
            subtitle={STRINGS.home.bullSubtitle}
            onPress={() => navigateToTab('BullInfo')}
            style={styles.gridCard}
          >
            <Text style={styles.cardInfo}>{STRINGS.home.bullDesc}</Text>
          </Card>

          {/* Profile shortcut */}
          <Card
            title={STRINGS.home.profileTitle}
            subtitle={STRINGS.home.profileSubtitle}
            onPress={() => navigation.navigate('Profile')}
            style={styles.gridCard}
          >
            <Text style={styles.cardInfo}>{STRINGS.home.profileDesc}</Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSizeXl,
    lineHeight: TYPOGRAPHY.lineHeightXl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appNameText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  warningCard: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
    borderWidth: 1.5,
    borderRadius: SIZES.radiusLg,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  warningBody: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  warningBtn: {
    height: 44,
    backgroundColor: COLORS.warning,
  },
  statsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLg,
    elevation: 4,
    marginBottom: SPACING.lg,
  },
  statsCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSizeXl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  divider: {
    height: '80%',
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  quickLinksGrid: {
    flexDirection: 'column',
    width: '100%',
  },
  gridCard: {
    marginVertical: SPACING.xs,
  },
  cardInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
});
