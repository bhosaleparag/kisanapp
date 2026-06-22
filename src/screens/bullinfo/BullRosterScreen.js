import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, FlatList, Image, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, ActivityIndicator, FAB, Portal, Modal, IconButton, Searchbar, Menu } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePickerSDK from 'expo-image-picker';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { bullRecordSchema } from '../../utils/schemas';
import { getBullsByBrand, addBullRecord } from '../../services/bullService';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

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

  // Date picker state variables
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  // Multi-image picker state
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const strings = STRINGS.bullInfo;

  const requestCameraAccess = async () => {
    const { status } = await ImagePickerSDK.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(STRINGS.common.appName, STRINGS.common.permissionDenied);
      return false;
    }
    return true;
  };

  const requestLibraryAccess = async () => {
    const { status } = await ImagePickerSDK.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(STRINGS.common.appName, STRINGS.common.permissionDenied);
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraAccess();
    if (!hasPermission) return;
    if (selectedImages.length >= 5) {
      Alert.alert(STRINGS.common.appName, strings.maxImagesAlert);
      return;
    }
    try {
      const result = await ImagePickerSDK.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSelectPhotos = async () => {
    const hasPermission = await requestLibraryAccess();
    if (!hasPermission) return;
    if (selectedImages.length >= 5) {
      Alert.alert(STRINGS.common.appName, strings.maxImagesAlert);
      return;
    }
    try {
      const result = await ImagePickerSDK.launchImageLibraryAsync({
        mediaTypes: ImagePickerSDK.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5 - selectedImages.length,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => {
          const combined = [...prev, ...newUris];
          return combined.slice(0, 5);
        });
      }
    } catch (error) {
      console.error('Error selecting photos:', error);
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

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
  }, [brandId]);

  // Form Setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bullRecordSchema),
    defaultValues: {
      bullName: '',
      naabCode: '',
      registrationNumber: '',
      tpi: '',
      breed: '',
      photoUrl: '',
      sire: '',
      damSire: '',
      mgs: '',
      mgd: '',
      mggs: '',
      evaluationDate: 'June 2026',
      milkLbs: '1000',
      fatLbs: '50',
      fatPercent: '0.05',
      proteinLbs: '30',
      proteinPercent: '0.02',
      reliability: '90',
      productiveLife: '4.0',
      daughterPregnancyRate: '0.0',
      heiferConceptionRate: '1.2',
      cowConceptionRate: '0.5',
      betaCasein: 'A2A2',
      somaticCellScore: '2.80',
      sireCalvingEase: '2.0',
      daughterCalvingEase: '2.1',
      sireStillbirth: '5.5',
      daughterStillbirth: '6.2',
      ptat: '1.0',
      udderComposite: '1.0',
      feetLegsComposite: '1.0',
      bodyWeightComposite: '0.85',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        brandId,
        brandName,
        localImageUris: selectedImages,
      };
      await addBullRecord(payload, user?.uid);
      setModalVisible(false);
      setSelectedImages([]);
      reset();
      await fetchBulls();
      Alert.alert(STRINGS.common.success, strings.saveBullSuccess);
    } catch (error) {
      setLoading(false);
      Alert.alert(STRINGS.common.errorTitle, strings.saveBullError);
    }
  };

  // Date Change Handler
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPickerDate(selectedDate);
      const formatted = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setValue('evaluationDate', formatted);
    }
  };

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
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xs }]}>
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
                {selectedBreed === 'all' ? strings.filterBtn : selectedBreed} ▽
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
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setSelectedImages([]);
            reset();
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{strings.addBull}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedImages([]);
                  reset();
                }}
              />
            </View>

            {/* Basic Info Header */}
            <Text style={styles.sectionHeader}>१. प्राथमिक माहिती (Basic Info)</Text>

            <Controller
              control={control}
              name="bullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.bullNameLabel}
                  placeholder={strings.bullNamePlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.bullName}
                  errorMessage={errors.bullName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="naabCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.naabCodeLabel}
                  placeholder={strings.naabCodePlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.naabCode}
                  errorMessage={errors.naabCode?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="registrationNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.regNoLabel}
                  placeholder={strings.regNoPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.registrationNumber}
                  errorMessage={errors.registrationNumber?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="tpi"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.tpiLabel}
                  placeholder={strings.tpiPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.tpi}
                  errorMessage={errors.tpi?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="breed"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.breedLabelForm}
                  placeholder={strings.breedPlaceholderForm}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.breed}
                  errorMessage={errors.breed?.message}
                />
              )}
            />

            {/* Multi-Image Selector */}
            <View style={styles.imageSelectorContainer}>
              <Text style={styles.imageSectionTitle}>{strings.photoUrlsLabel}</Text>
              
              {/* Selected Images Thumbnail Slider */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailList}>
                {selectedImages.map((uri, index) => (
                  <View key={uri} style={styles.thumbnailContainer}>
                    <Image source={{ uri }} style={styles.thumbnailImage} />
                    <IconButton
                      icon="close-circle"
                      size={20}
                      iconColor={COLORS.error}
                      style={styles.removeThumbnailBtn}
                      onPress={() => handleRemoveImage(index)}
                    />
                  </View>
                ))}
                {selectedImages.length === 0 && (
                  <Text style={styles.noImagesText}>{strings.photoUrlsPlaceholder}</Text>
                )}
              </ScrollView>

              {/* Action Triggers Row */}
              {selectedImages.length < 5 && (
                <View style={styles.imageActionButtons}>
                  <Button
                    title={strings.cameraOption}
                    icon="camera"
                    mode="outlined"
                    onPress={handleTakePhoto}
                    style={styles.pickerButton}
                    labelStyle={styles.pickerButtonLabel}
                  />
                  <Button
                    title={strings.galleryOption}
                    icon="image-multiple"
                    mode="outlined"
                    onPress={handleSelectPhotos}
                    style={styles.pickerButton}
                    labelStyle={styles.pickerButtonLabel}
                  />
                </View>
              )}
            </View>

            {/* Pedigree Header */}
            <Text style={styles.sectionHeader}>२. वंशावळ (Pedigree)</Text>

            <Controller
              control={control}
              name="sire"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.sireLabel}
                  placeholder={strings.sirePlaceholder}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="damSire"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.damSireLabel}
                  placeholder={strings.damSirePlaceholder}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="mgs"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.mgsLabel}
                  placeholder={strings.mgsPlaceholder}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="mgd"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.mgdLabel}
                  placeholder={strings.mgdPlaceholder}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="mggs"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.mggsLabel}
                  placeholder={strings.mggsPlaceholder}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            {/* CDCB Stats Header */}
            <Text style={styles.sectionHeader}>३. CDCB आकडेवारी (CDCB Stats)</Text>

            {/* Date Time Picker field for evaluation date */}
            <Controller
              control={control}
              name="evaluationDate"
              render={({ field: { value } }) => (
                <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                  <View pointerEvents="none">
                    <Input
                      label={strings.evalDateLabel}
                      placeholder={strings.evalDatePlaceholder}
                      value={value}
                      editable={false}
                      rightIcon="calendar"
                    />
                  </View>
                </TouchableOpacity>
              )}
            />
            {showDatePicker && (
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}

            <Text style={styles.subSectionHeader}>{strings.productionTitle}</Text>

            <Controller
              control={control}
              name="milkLbs"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.milkLbsLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="fatLbs"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.fatLbsLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="fatPercent"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.fatPercentLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="proteinLbs"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.proteinLbsLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="proteinPercent"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.proteinPercentLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="reliability"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.reliabilityLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Text style={styles.subSectionHeader}>{strings.healthTitle}</Text>

            <Controller
              control={control}
              name="productiveLife"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.productiveLifeLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="daughterPregnancyRate"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.dprLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="heiferConceptionRate"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.hcrLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="cowConceptionRate"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.ccrLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="betaCasein"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.betaCaseinLabel}
                  placeholder={strings.betaCaseinPlaceholder}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="somaticCellScore"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.scsLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="sireCalvingEase"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.sceLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="daughterCalvingEase"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.dceLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="sireStillbirth"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.ssbLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="daughterStillbirth"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.dsbLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Text style={styles.subSectionHeader}>{strings.conformationTitle}</Text>

            <Controller
              control={control}
              name="ptat"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.ptatLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="udderComposite"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.udcLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="feetLegsComposite"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.flcLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="bodyWeightComposite"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.bwcLabel}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            {/* Save Button */}
            <Button
              title={strings.saveBullBtn}
              onPress={handleSubmit(onSubmit)}
              style={styles.saveButton}
            />
          </ScrollView>
        </Modal>
      </Portal>
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
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.lg,
    borderRadius: SIZES.radiusLg,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalScroll: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  subSectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 2,
  },
  imageSelectorContainer: {
    marginVertical: SPACING.sm,
  },
  imageSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  thumbnailList: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    minHeight: 80,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeThumbnailBtn: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#FFFFFF',
    margin: 0,
  },
  noImagesText: {
    fontSize: TYPOGRAPHY.fontSizeXs,
    color: COLORS.textSecondary,
    alignSelf: 'center',
    paddingLeft: SPACING.xs,
  },
  imageActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  pickerButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    minHeight: 44,
  },
  pickerButtonLabel: {
    fontSize: 12,
    lineHeight: 14,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});
