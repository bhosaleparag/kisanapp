import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';

export default function VideoListScreen({ filter, videos, onSelectVideo, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');

  const matchedVideos = useMemo(() => {
    return (videos || []).filter((v) => {
      if (filter.type === 'subject') {
        return v.subject === filter.value;
      }
      if (filter.type === 'author') {
        return v.author === filter.value;
      }
      if (filter.type === 'company') {
        return v.company === filter.value;
      }
      return true;
    });
  }, [videos, filter.type, filter.value]);

  const filteredVideos = useMemo(() => {
    const match = searchQuery.trim().toLowerCase();
    if (!match) return matchedVideos;

    return matchedVideos.filter(
      (v) =>
        v.title?.toLowerCase().includes(match) ||
        v.description?.toLowerCase().includes(match) ||
        v.author?.toLowerCase().includes(match) ||
        v.company?.toLowerCase().includes(match)
    );
  }, [matchedVideos, searchQuery]);

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onSelectVideo(item)}
      activeOpacity={0.8}
      style={styles.videoCard}
    >
      <View style={styles.thumbnailWrapper}>
        {item.thumbnailUri ? (
          <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <MaterialCommunityIcons name="play-circle" size={32} color="#FFFFFF" />
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.categoryBadge}>{item.categoryLabel}</Text>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.videoMetaLabel}>
          👤 {item.author} | 🏢 {item.company}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
          <Text style={styles.backButtonText}>{STRINGS.videos.backBtn}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {filter.title}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder={STRINGS.videos.videoSearchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
        />
      </View>

      <Text style={styles.sectionTitle}>{STRINGS.videos.videoListTitle}</Text>

      <FlatList
        data={filteredVideos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideoItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{STRINGS.common.noData}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchbar: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusSm,
    elevation: 0,
  },
  searchbarInput: {
    fontSize: 14,
    minHeight: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    padding: 10,
    alignItems: 'center',
    elevation: 1,
  },
  thumbnailWrapper: {
    position: 'relative',
    width: 100,
    height: 70,
    borderRadius: SIZES.radiusSm,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 2,
  },
  videoMetaLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
