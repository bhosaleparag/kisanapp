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
          <Avatar.Image
            size={54}
            source={
              user?.profileImage
                ? { uri: user.profileImage }
                : { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200' }
            }
          />
        </View>

        {/* Warning Banner: Complete Profile */}
        {isProfileIncomplete(user) && (
          <PaperCard style={styles.warningCard} mode="elevated">
            <PaperCard.Content>
              <View style={styles.warningHeaderRow}>
                <Text style={styles.warningEmoji}>⚠️</Text>
                <Text style={styles.warningTitle}>प्रोफाईल अपूर्ण आहे!</Text>
              </View>
              <Text style={styles.warningBody}>
                सर्व शेतकरी सेवांचा आणि बाजारपेठेचा लाभ घेण्यासाठी कृपया तुमची सविस्तर माहिती पूर्ण भरा.
              </Text>
              <Button
                title="माहिती भरा (Complete Profile)"
                onPress={() => navigation.navigate('Profile')}
                style={styles.warningBtn}
              />
            </PaperCard.Content>
          </PaperCard>
        )}

        {/* Cowshed Quick Stats Summary Card */}
        <PaperCard style={styles.statsCard} mode="elevated">
          <PaperCard.Content>
            <Text style={styles.statsCardTitle}>📊 माझा गोठा सारांश</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>एकूण जनावरे</Text>
                <Text style={styles.statNumber}>५</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>दैनिक दूध उत्पादन</Text>
                <Text style={styles.statNumber}>३० लिटर</Text>
              </View>
            </View>
          </PaperCard.Content>
        </PaperCard>

        {/* Module Section title */}
        <Text style={styles.sectionTitle}>झटपट पर्याय</Text>

        {/* Quick Navigate Cards Grid */}
        <View style={styles.quickLinksGrid}>
          {/* Marketplace shortcut */}
          <Card
            title={STRINGS.nav.marketplace}
            subtitle="खरेदी व विक्री"
            onPress={() => navigateToTab('Marketplace')}
            style={styles.gridCard}
          >
            <Text style={styles.cardInfo}>जनावरे, चारा, आणि खते खरेदी किंवा विक्री करण्यासाठी येथे जा.</Text>
          </Card>

          {/* Services shortcut */}
          <Card
            title={STRINGS.nav.services}
            subtitle="ट्रॅक्टर व अवजारे"
            onPress={() => navigateToTab('Services')}
            style={styles.gridCard}
          >
            <Text style={styles.cardInfo}>ट्रॅक्टर भाड्याने, ड्रोन फवारणी किंवा शेतमजूर बुक करण्यासाठी येथे जा.</Text>
          </Card>

          {/* Cowshed shortcut */}
          <Card
            title={STRINGS.nav.cowshed}
            subtitle="दूध आणि वजन नोंद"
            onPress={() => navigateToTab('Cowshed')}
            style={styles.gridCard}
          >
            <Text style={styles.cardInfo}>तुमच्या गोठ्यातील जनावरांची आणि दुधाची दररोज नोंद ठेवा.</Text>
          </Card>

          {/* Videos shortcut */}
          <Card
            title={STRINGS.nav.videos}
            subtitle="शेती मार्गदर्शन"
            onPress={() => navigateToTab('Videos')}
            style={styles.gridCard}
          >
            <Text style={styles.cardInfo}>सेंद्रिय शेती आणि नवीन तंत्रज्ञानाचे व्हिडिओ तज्ञांकडून पहा.</Text>
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
