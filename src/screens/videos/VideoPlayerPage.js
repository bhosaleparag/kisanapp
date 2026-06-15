import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card as PaperCard } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import VideoPlayer from '../../components/VideoPlayer';

export default function VideoPlayerPage({ selectedVideo, onBack }) {
  const SUBJECT_MAPPING = {
    semen_info: STRINGS.videos.semenInfo,
    wws_semen: STRINGS.videos.wwsSemen,
    abs_semen: STRINGS.videos.absSemen,
    denmark_semen: STRINGS.videos.denmarkSemen,
  };

  const displaySubject = SUBJECT_MAPPING[selectedVideo.subject] || selectedVideo.subject;

  return (
    <View style={styles.container}>
      <View style={styles.playerHeaderBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
          <Text style={styles.backButtonText}>{STRINGS.videos.playerBackBtn}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <VideoPlayer videoUrl={selectedVideo.videoUrl} title={selectedVideo.title} />

        <PaperCard style={styles.activeDetailsCard} mode="outlined">
          <PaperCard.Content>
            <View style={styles.activeHeaderRow}>
              <Text style={styles.activeCategoryText}>{selectedVideo.categoryLabel}</Text>
              <Text style={styles.activeDurationText}>
                {STRINGS.videos.durationLabel}
                {selectedVideo.duration}
                {STRINGS.videos.minutesLabel}
              </Text>
            </View>

            <Text style={styles.activeTitleText}>{selectedVideo.title}</Text>

            <View style={styles.metadataBlock}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{STRINGS.videos.guideLabel}</Text>
                <Text style={styles.metaValue}>{selectedVideo.author}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{STRINGS.videos.subjectLabel}</Text>
                <Text style={styles.metaValue}>{displaySubject}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{STRINGS.videos.companyLabel}</Text>
                <Text style={styles.metaValue}>{selectedVideo.company}</Text>
              </View>
            </View>

            <Text style={styles.descriptionSectionTitle}>{STRINGS.videos.videoInfoTitle}</Text>
            <Text style={styles.activeDescriptionText}>{selectedVideo.description}</Text>
          </PaperCard.Content>
        </PaperCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  playerHeaderBar: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 4,
  },
  activeDetailsCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    elevation: 2,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  activeCategoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeDurationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  activeTitleText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  metadataBlock: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZES.radiusSm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  metaLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    width: 100,
  },
  metaValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    flex: 1,
  },
  descriptionSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  activeDescriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingBottom: 60,
  },
});
