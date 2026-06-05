import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Card } from 'react-native-paper';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../constants/theme';

/**
 * Premium Farmer-Friendly VideoPlayer Component
 * Built on the modern expo-video. Streams crop guidance videos with strictly NO download options.
 */
export default function VideoPlayer({ videoUrl, title, style = {} }) {
  // Initialize the modern expo-video player
  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.muted = false;
  });

  return (
    <Card style={[styles.card, style]} mode="outlined">
      {title && (
        <Card.Title
          title={title}
          titleStyle={styles.cardTitle}
          style={styles.cardHeader}
        />
      )}
      
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          fullscreenOptions={{ isEnabled: true }}
          allowsPictureInPicture={true}
          showsPlaybackControls={true} // Renders standard play/seek/fullscreen controls with strictly NO download options
          contentFit="contain"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    marginVertical: SPACING.sm,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  videoContainer: {
    width: '100%',
    height: 220, // Responsive 16:9 frame height
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
