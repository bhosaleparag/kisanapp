import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';

export default function VideoSearchPage({ videos, onSelectVideo }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterMode, setActiveFilterMode] = useState('subject');
  const [selectedFilterVal, setSelectedFilterVal] = useState('all');

  const getFilterTags = () => {
    const rawVals = videos.map((v) => {
      if (activeFilterMode === 'author') return v.author;
      if (activeFilterMode === 'company') return v.company;
      return v.subject;
    });
    return ['all', ...new Set(rawVals)];
  };

  const getFilteredVideos = () => {
    return videos.filter((v) => {
      const match = searchQuery.trim().toLowerCase();
      
      let matchesSearch = true;
      if (match) {
        matchesSearch =
          v.title.toLowerCase().includes(match) ||
          v.description.toLowerCase().includes(match) ||
          v.subject.toLowerCase().includes(match) ||
          v.author.toLowerCase().includes(match) ||
          v.company.toLowerCase().includes(match);
      }

      let matchesFilter = true;
      if (selectedFilterVal !== 'all') {
        if (activeFilterMode === 'author') matchesFilter = v.author === selectedFilterVal;
        if (activeFilterMode === 'company') matchesFilter = v.company === selectedFilterVal;
        if (activeFilterMode === 'subject') matchesFilter = v.subject === selectedFilterVal;
      }

      return matchesSearch && matchesFilter;
    });
  };

  const handleFilterModeChange = (mode) => {
    setActiveFilterMode(mode);
    setSelectedFilterVal('all');
  };

  const handleVoiceSearch = () => {
    Alert.alert(
      'कृषी व्हॉइस सर्च (Voice Search)',
      'मराठी व्हॉइस असिस्टंट सुरू आहे...\nकृपया तुमच्या आवाजात व्हिडिओचा विषय बोला.',
      [{ text: 'ठीक आहे' }]
    );
  };

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
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="व्हिडिओ शोधा..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
        />
        <TouchableOpacity onPress={handleVoiceSearch} style={styles.micButton}>
          <MaterialCommunityIcons name="microphone" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterModeRow}>
        <Text style={styles.filterTitle}>यानुसार शोधा:</Text>
        <View style={styles.filterButtonsWrapper}>
          <TouchableOpacity
            onPress={() => handleFilterModeChange('subject')}
            style={[
              styles.filterBtn,
              activeFilterMode === 'subject' && styles.activeFilterBtn,
            ]}
          >
            <Text
              style={[
                styles.filterBtnText,
                activeFilterMode === 'subject' && styles.activeFilterBtnText,
              ]}
            >
              विषय
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFilterModeChange('author')}
            style={[
              styles.filterBtn,
              activeFilterMode === 'author' && styles.activeFilterBtn,
            ]}
          >
            <Text
              style={[
                styles.filterBtnText,
                activeFilterMode === 'author' && styles.activeFilterBtnText,
              ]}
            >
              मार्गदर्शक
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFilterModeChange('company')}
            style={[
              styles.filterBtn,
              activeFilterMode === 'company' && styles.activeFilterBtn,
            ]}
          >
            <Text
              style={[
                styles.filterBtnText,
                activeFilterMode === 'company' && styles.activeFilterBtnText,
              ]}
            >
              संस्था
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getFilterTags().map((tag) => {
            const isSelected = tag === selectedFilterVal;
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setSelectedFilterVal(tag)}
                style={[styles.tagPill, isSelected && styles.activeTagPill]}
              >
                <Text style={[styles.tagText, isSelected && styles.activeTagText]}>
                  {tag === 'all' ? 'सर्व' : tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.recentVideosTitle}>नवीन मार्गदर्शन व्हिडिओ</Text>

      <FlatList
        data={getFilteredVideos()}
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
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusSm,
    elevation: 0,
  },
  searchbarInput: {
    fontSize: 15,
    minHeight: 0,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    elevation: 2,
  },
  filterModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  filterButtonsWrapper: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  filterBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 3,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  activeFilterBtnText: {
    color: '#FFFFFF',
  },
  tagsContainer: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusRound,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  activeTagPill: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  activeTagText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  recentVideosTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
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
