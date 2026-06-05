import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Card } from 'react-native-paper';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../constants/theme';

// Helper to extract YouTube video ID
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Stream player component using expo-video (isolated to respect React Hook rules)
function StreamPlayer({ videoUrl }) {
  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.muted = false;
  });

  return (
    <VideoView
      player={player}
      style={styles.video}
      fullscreenOptions={{ isEnabled: true }}
      allowsPictureInPicture={true}
      showsPlaybackControls={true} // Renders standard play/seek/fullscreen controls with strictly NO download options
      contentFit="contain"
    />
  );
}

/**
 * Premium Farmer-Friendly VideoPlayer Component
 * Supports both standard video streams (using expo-video) and YouTube videos (using react-native-youtube-iframe).
 */
export default function VideoPlayer({ videoUrl, title, style = {} }) {
  const youtubeId = getYoutubeVideoId(videoUrl);

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
        {youtubeId ? (
          <View style={styles.youtubeWrapper}>
            <YoutubePlayer
              height={220}
              videoId={youtubeId}
              webViewStyle={{ opacity: 0.99 }}
            />
          </View>
        ) : (
          <StreamPlayer videoUrl={videoUrl} />
        )}
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
  youtubeWrapper: {
    width: '100%',
    height: 220,
  },
});
