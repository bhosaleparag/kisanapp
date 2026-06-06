import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import VoiceSearchModal from '../../components/VoiceSearchModal';

// Defined at module scope, utilizing centralized theme and localized constants
const getSubjectsList = () => [
  {
    id: 'breed_management',
    title: STRINGS.videos.breedManagement,
    description: STRINGS.videos.breedManagementDesc,
    icon: 'cow',
    color: COLORS.primary,
  },
  {
    id: 'feed_management',
    title: STRINGS.videos.feedManagement,
    description: STRINGS.videos.feedManagementDesc,
    icon: 'sprout',
    color: COLORS.success,
  },
  {
    id: 'manage_animal',
    title: STRINGS.videos.animalManagement,
    description: STRINGS.videos.animalManagementDesc,
    icon: 'home-heart',
    color: COLORS.secondary,
  },
  {
    id: 'organic',
    title: STRINGS.videos.organicFarming,
    description: STRINGS.videos.organicFarmingDesc,
    icon: 'leaf',
    color: COLORS.primary,
  },
  {
    id: 'disease',
    title: STRINGS.videos.cropDisease,
    description: STRINGS.videos.cropDiseaseDesc,
    icon: 'bug',
    color: COLORS.error,
  },
  {
    id: 'technology',
    title: STRINGS.videos.modernTech,
    description: STRINGS.videos.modernTechDesc,
    icon: 'drone',
    color: COLORS.info,
  },
];

export default function CategoryListScreen({ type, videos, onSelectItem, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceSearchVisible, setVoiceSearchVisible] = useState(false);

  const getDataList = () => {
    if (type === 'subject') {
      return getSubjectsList();
    }

    if (type === 'author') {
      const authors = videos.reduce((acc, v) => {
        acc[v.author] = (acc[v.author] || 0) + 1;
        return acc;
      }, {});
      return Object.keys(authors).map((name) => ({
        id: name,
        title: name,
        description: `${authors[name]} ${STRINGS.videos.title}`,
        icon: 'account-circle',
        color: COLORS.secondary,
      }));
    }

    if (type === 'company') {
      const companies = videos.reduce((acc, v) => {
        acc[v.company] = (acc[v.company] || 0) + 1;
        return acc;
      }, {});
      return Object.keys(companies).map((name) => ({
        id: name,
        title: name,
        description: `${companies[name]} ${STRINGS.videos.title}`,
        icon: 'office-building',
        color: COLORS.primary,
      }));
    }

    return [];
  };

  const getFilteredList = () => {
    const list = getDataList();
    const match = searchQuery.trim().toLowerCase();
    if (!match) return list;

    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(match) ||
        (item.description && item.description.toLowerCase().includes(match))
    );
  };

  const handleVoiceSearch = () => {
    setVoiceSearchVisible(true);
  };

  const getVoiceSuggestions = () => {
    const list = getDataList();
    if (!list || list.length === 0) return STRINGS.videos.voiceSearchSuggestions;
    // Extract titles and slice first 6 items for clean spacing in visual layout
    return list.slice(0, 6).map((item) => item.title);
  };

  const getScreenTitle = () => {
    switch (type) {
      case 'subject':
        return STRINGS.videos.selectSubject;
      case 'author':
        return STRINGS.videos.selectExpert;
      case 'company':
        return STRINGS.videos.selectCompany;
      default:
        return STRINGS.videos.selectDefault;
    }
  };

  const renderCardItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => onSelectItem(item)}
        activeOpacity={0.8}
        style={styles.card}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
          <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.cardDescription}>{item.description}</Text>
          ) : null}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
          <Text style={styles.backButtonText}>{STRINGS.videos.backBtn}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder={STRINGS.videos.searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
        />
        <TouchableOpacity onPress={handleVoiceSearch} style={styles.micButton}>
          <MaterialCommunityIcons name="microphone" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredList()}
        keyExtractor={(item) => item.id}
        renderItem={renderCardItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{STRINGS.common.noData}</Text>
          </View>
        }
      />

      <VoiceSearchModal
        visible={voiceSearchVisible}
        onClose={() => setVoiceSearchVisible(false)}
        onSearchResult={setSearchQuery}
        suggestions={getVoiceSuggestions()}
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
  micButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    elevation: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
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
