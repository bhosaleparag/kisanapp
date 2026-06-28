import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, FAB, IconButton, Searchbar, Menu } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { getBullsByBrand } from '../../services/bullService';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import BullFormModal from '../../components/BullFormModal';
import BulkEditMilkLbsModal from '../../components/BulkEditMilkLbsModal';

export default function BullRosterScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAppStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const { brandId, brandName } = route.params || {};

  const [bulls, setBulls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [breedFilterVisible, setBreedFilterVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);

  const strings = STRINGS.bullInfo;

  // Load bulls on mount
  const fetchBulls = async () => {
    setLoading(true);
    try {
      const data = await getBullsByBrand(brandId);
      setBulls(data);
    } catch (error) {
      console.error('Failed to load bulls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulls();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBulls();
    });
    return unsubscribe;
  }, [brandId, navigation]);

  // Get list of unique breeds for filtering
  const availableBreeds = useMemo(() => {
    const list = new Set();
    bulls.forEach((b) => {
      if (b.breed) list.add(b.breed);
    });
    return ['all', ...Array.from(list)];
  }, [bulls]);

  // Filtered bulls for display
  const filteredBulls = useMemo(() => {
    let list = bulls;

    // Filter by breed
    if (selectedBreed !== 'all') {
      list = list.filter((b) => b.breed === selectedBreed);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.bullName.toLowerCase().includes(q) ||
          b.naabCode.toLowerCase().includes(q) ||
          b.breed.toLowerCase().includes(q)
      );
    }

    return list;
  }, [bulls, selectedBreed, searchQuery]);

  const handleBullPress = (bull) => {
    navigation.navigate('CdcbDataSheet', { bull });
  };

  const renderBullItem = ({ item }) => {
    return (
      <Card
        onPress={() => handleBullPress(item)}
        style={styles.bullCard}
      >
        <View style={styles.bullRow}>
          <Image source={{ uri: item.photoUrl }} style={styles.bullPhoto} resizeMode="cover" />
          <View style={styles.bullDetails}>
            {/* Display NAAB code and name together, e.g. 29HO18817 ABS Jeronimo */}
            <Text style={styles.bullNameText}>
              {item.naabCode} {item.bullName}
            </Text>
            <Text style={styles.bullSubText}>
              Reg: {item.registrationNumber} | Breed: {item.breed}{item.tpi ? ` | TPI: +${item.tpi}` : ''}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading && bulls.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header Bar */}
      <View style={[styles.header, { paddingTop: SPACING.xs }]}>
        <View style={styles.headerLeftRow}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          />
          <Text style={styles.title}>{brandName} {strings.rosterTitleSuffix}</Text>
        </View>

        {/* Bulk Edit Button (Admins only, visible when bulls exist) */}
        {isAdmin && bulls.length > 0 && (
          <IconButton
            icon="playlist-edit"
            iconColor="#FFFFFF"
            size={26}
            onPress={() => setBulkModalVisible(true)}
            style={styles.headerIconBtn}
          />
        )}

        {/* Dropdown Menu for Filtering */}
        <Menu
          visible={breedFilterVisible}
          onDismiss={() => setBreedFilterVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setBreedFilterVisible(true)}
              style={styles.filterChip}
            >
              <Text style={styles.filterChipText}>
                {selectedBreed === 'all' ? strings.filterBtn : selectedBreed}
              </Text>
            </TouchableOpacity>
          }
        >
          {availableBreeds.map((breed) => (
            <Menu.Item
              key={breed}
              onPress={() => {
                setSelectedBreed(breed);
                setBreedFilterVisible(false);
              }}
              title={breed === 'all' ? strings.breedAll : breed}
            />
          ))}
        </Menu>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={strings.searchBullPlaceholder}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          placeholderTextColor={COLORS.textSecondary}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Bull Lineup List */}
      <FlatList
        data={filteredBulls}
        keyExtractor={(item) => item.bullId}
        renderItem={renderBullItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{strings.noBulls}</Text>
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* Floating Action Button for Admins */}
      {isAdmin && (
        <FAB
          icon="plus"
          label={strings.addBull}
          color="#FFFFFF"
          style={[styles.fab, { bottom: insets.bottom + SPACING.xs }]}
          onPress={() => setModalVisible(true)}
        />
      )}

      {/* Add Bull Modal Form */}
      <BullFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        brandId={brandId}
        brandName={brandName}
        onSuccess={fetchBulls}
      />

      {/* Bulk Edit Milk Lbs Modal */}
      <BulkEditMilkLbsModal
        visible={bulkModalVisible}
        onClose={() => setBulkModalVisible(false)}
        bulls={bulls}
        onSuccess={fetchBulls}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.sm,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    margin: 0,
  },
  headerIconBtn: {
    margin: 0,
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radiusRound,
    marginRight: SPACING.sm,
  },
  filterChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  bullCard: {
    marginVertical: SPACING.xs,
  },
  bullRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullPhoto: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusSm,
    marginRight: SPACING.md,
    backgroundColor: COLORS.background,
  },
  bullDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bullNameText: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  bullSubText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.xl,
    right: 0,
    backgroundColor: COLORS.primary,
  },
});
