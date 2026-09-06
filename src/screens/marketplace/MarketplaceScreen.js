import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Linking, Image, Pressable } from 'react-native';
import { Text, FAB, Portal, Modal, SegmentedButtons, IconButton, Chip } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { fodderListingSchema } from '../../utils/schemas';
import { getFodderListings, addFodderListing } from '../../services/fodderService';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import MultiImagePicker from '../../components/MultiImagePicker';
import Select from '../../components/Select';

/**
 * Buying-Selling Marketplace Screen (खरेदी-विक्री बाजारपेठ)
 * Fodder & Agricultural Equipment / Pashu Listings Feed & Dynamic Post Form.
 */
export default function MarketplaceScreen() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter States
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all'); // all, green, dry, silage
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('');
  const [priceSortAsc, setPriceSortAsc] = useState(false);

  // Dynamic Form Hook
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fodderListingSchema),
    defaultValues: {
      photos: [],
      farmerName: '',
      callingNumber: '',
      whatsAppNumber: '',
      district: 'सोलापूर',
      taluka: 'सांगोला',
      village: '',
      category: 'green',
      subType: STRINGS.fodder.greenSubTypes[0],
      area: '',
      weight: '',
      price: '',
      unit: STRINGS.fodder.greenUnits[0],
      packingType: '',
      remarks: '',
    },
  });

  const selectedCategory = watch('category');

  // Load initial listings from fodderService
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await getFodderListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to load marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync images state with react-hook-form photos field
  const handlePhotosChange = (photosArray) => {
    setSelectedPhotos(photosArray);
    setValue('photos', photosArray, { shouldValidate: true });
  };

  // Form Submit Handler
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const createdItem = await addFodderListing(data);
      setListings((prev) => [createdItem, ...prev]);

      // Reset Modal & State
      setModalVisible(false);
      setSelectedPhotos([]);
      reset({
        photos: [],
        farmerName: '',
        callingNumber: '',
        whatsAppNumber: '',
        district: 'अहमदनगर',
        taluka: 'संगमनेर',
        village: '',
        category: 'green',
        subType: STRINGS.fodder.greenSubTypes[0],
        area: '',
        weight: '',
        price: '',
        unit: STRINGS.fodder.greenUnits[0],
        packingType: '',
        remarks: '',
      });
    } catch (error) {
      console.error('Error creating fodder ad listing:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Direct Communication Handlers
  const callFarmer = (phone) => {
    Linking.openURL(`tel:${phone}`).catch((err) =>
      console.error('Error triggering phone dial:', err)
    );
  };

  const openWhatsApp = (phone, listingTitle) => {
    const message = `नमस्कार, मी 'KisanApp' (खरेदी-विक्री बाजारपेठ) वर तुमची जाहिरात [${listingTitle}] पाहिली. याबद्दल अधिक माहिती हवी आहे.`;
    const url = `whatsapp://send?phone=91${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      // Fallback web url
      Linking.openURL(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`);
    });
  };

  // Category change inside form updates default subTypes and units
  const handleCategoryChange = (val) => {
    setValue('category', val);
    if (val === 'green') {
      setValue('subType', STRINGS.fodder.greenSubTypes[0]);
      setValue('unit', STRINGS.fodder.greenUnits[0]);
    } else if (val === 'dry') {
      setValue('subType', STRINGS.fodder.drySubTypes[0]);
      setValue('unit', STRINGS.fodder.dryUnits[0]);
    } else if (val === 'silage') {
      setValue('subType', STRINGS.fodder.silageSubTypes[0]);
      setValue('unit', 'प्रति ५० किलो बॅग');
      setValue('packingType', STRINGS.fodder.silagePackings[0]);
    }
  };

  // Filter listings based on active filter state
  const filteredListings = listings
    .filter((item) => {
      if (activeCategoryFilter !== 'all' && item.category !== activeCategoryFilter) {
        return false;
      }
      if (selectedDistrictFilter && item.district !== selectedDistrictFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (priceSortAsc) {
        return a.price - b.price;
      }
      return 0;
    });

  // Render Listing Card Feed Item
  const renderListingCard = ({ item }) => {
    const isSilage = item.category === 'silage';
    const photosList = item.photos || [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800',
    ];

    const actionsRow = (
      <View style={styles.cardActionsRow}>
        <Button
          mode="contained"
          icon="phone"
          title={STRINGS.marketplace.callBtn}
          onPress={() => callFarmer(item.callingNumber)}
          style={styles.callButton}
        />
        <Button
          mode="outlined"
          icon="whatsapp"
          title={STRINGS.marketplace.whatsAppBtn}
          onPress={() => openWhatsApp(item.whatsAppNumber || item.callingNumber, item.subType)}
          style={styles.whatsappButton}
        />
      </View>
    );

    return (
      <Card
        title={`${item.subType} (${item.category === 'green' ? 'ओला' : item.category === 'dry' ? 'सुका' : 'मुरघास'})`}
        subtitle={`📍 ${item.village ? item.village + ', ' : ''}${item.taluka}, ${item.district}`}
        actions={actionsRow}
        style={styles.listingCard}
      >
        {/* Photo Gallery Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardGallery}>
          {photosList.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.cardPhoto} />
          ))}
        </ScrollView>

        <View style={styles.cardDetails}>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>₹ {item.price}</Text>
            <Text style={styles.unitBadge}>{item.unit}</Text>
          </View>

          {item.area ? <Text style={styles.metaText}>🌾 क्षेत्र: {item.area}</Text> : null}
          {item.weight ? <Text style={styles.metaText}>⚖️ वजन/डाळ: {item.weight}</Text> : null}
          {isSilage && item.packingType ? (
            <Text style={styles.metaText}>📦 पॅकिंग: {item.packingType}</Text>
          ) : null}

          {item.remarks ? (
            <Text style={styles.remarksText} numberOfLines={2} ellipsizeMode="tail">
              📝 {item.remarks}
            </Text>
          ) : null}

          <View style={styles.farmerRow}>
            <Text style={styles.farmerLabel}>👤 शेतकरी:</Text>
            <Text style={styles.farmerName}>{item.farmerName}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Dashboard Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{STRINGS.marketplace.title}</Text>
        <Text style={styles.headerSubtitle}>
          सक्रिय जाहिराती: {filteredListings.length} | खरेदी व विक्रीसाठी शेतकऱ्यांशी थेट संपर्क करा
        </Text>
      </View>

      {/* Category Chips Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsWrapper}
        contentContainerStyle={styles.chipsContainer}
      >
        <Chip
          selected={activeCategoryFilter === 'all'}
          onPress={() => setActiveCategoryFilter('all')}
          style={styles.chip}
        >
          {STRINGS.marketplace.allCategories}
        </Chip>
        <Chip
          selected={activeCategoryFilter === 'green'}
          onPress={() => setActiveCategoryFilter('green')}
          style={styles.chip}
        >
          🟢 {STRINGS.marketplace.greenFodder}
        </Chip>
        <Chip
          selected={activeCategoryFilter === 'dry'}
          onPress={() => setActiveCategoryFilter('dry')}
          style={styles.chip}
        >
          🟡 {STRINGS.marketplace.dryFodder}
        </Chip>
        <Chip
          selected={activeCategoryFilter === 'silage'}
          onPress={() => setActiveCategoryFilter('silage')}
          style={styles.chip}
        >
          🚜 {STRINGS.marketplace.silageFodder}
        </Chip>
      </ScrollView>

      {/* Quick Filter Strip */}
      <View style={styles.filterStrip}>
        <Pressable
          style={[styles.filterToggle, priceSortAsc && styles.filterToggleActive]}
          onPress={() => setPriceSortAsc(!priceSortAsc)}
        >
          <Text style={[styles.filterText, priceSortAsc && styles.filterTextActive]}>
            📊 {STRINGS.marketplace.sortByPrice} {priceSortAsc ? '✓' : ''}
          </Text>
        </Pressable>
      </View>

      {/* Feed List */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListingCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>कोणतीही जाहिरात उपलब्ध नाही.</Text>
          </View>
        }
      />

      {/* Floating Action Button (FAB) */}
      <FAB
        icon="plus"
        label={STRINGS.marketplace.postListing}
        color="#FFFFFF"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      {/* Post Listing Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{STRINGS.marketplace.postListing}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            {/* Section 1: Farmer & Media Details */}
            <Text style={styles.sectionHeading}>{STRINGS.fodder.mediaHeader}</Text>

            <MultiImagePicker
              images={selectedPhotos}
              onImagesChange={handlePhotosChange}
            />
            {errors.photos && <Text style={styles.fieldError}>{errors.photos.message}</Text>}

            <Controller
              control={control}
              name="farmerName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.fodder.farmerName}
                  placeholder={STRINGS.fodder.farmerNamePlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.farmerName}
                  errorMessage={errors.farmerName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="callingNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.fodder.callingNumber}
                  placeholder="उदा. ९८२२१२३४५६"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.callingNumber}
                  errorMessage={errors.callingNumber?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="whatsAppNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.fodder.whatsAppNumber}
                  placeholder="उदा. ९८२२१२३४५६"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.whatsAppNumber}
                  errorMessage={errors.whatsAppNumber?.message}
                />
              )}
            />

            {/* Location cascade */}
            <Text style={styles.subSectionTitle}>{STRINGS.fodder.locationHeader}</Text>

            <Controller
              control={control}
              name="district"
              render={({ field: { onChange, value } }) => (
                <Select
                  label={STRINGS.fodder.district}
                  options={STRINGS.fodder.districts.map((d) => ({ label: d, value: d }))}
                  selectedValue={value}
                  onValueChange={onChange}
                  error={!!errors.district}
                  errorMessage={errors.district?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="taluka"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.fodder.taluka}
                  placeholder="उदा. संगमनेर"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.taluka}
                  errorMessage={errors.taluka?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="village"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.fodder.village}
                  placeholder={STRINGS.fodder.villagePlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.village}
                  errorMessage={errors.village?.message}
                />
              )}
            />

            {/* Section 2: Fodder Category Selection */}
            <Text style={styles.sectionHeading}>{STRINGS.fodder.categoryHeader}</Text>

            <View style={styles.segmentedContainer}>
              <SegmentedButtons
                value={selectedCategory}
                onValueChange={handleCategoryChange}
                buttons={[
                  {
                    value: 'green',
                    label: '🟢 ओला',
                    checkedColor: '#FFFFFF',
                    style: selectedCategory === 'green' ? { backgroundColor: COLORS.primary } : {},
                  },
                  {
                    value: 'dry',
                    label: '🟡 सुका',
                    checkedColor: '#FFFFFF',
                    style: selectedCategory === 'dry' ? { backgroundColor: COLORS.primary } : {},
                  },
                  {
                    value: 'silage',
                    label: '🚜 मुरघास',
                    checkedColor: '#FFFFFF',
                    style: selectedCategory === 'silage' ? { backgroundColor: COLORS.primary } : {},
                  },
                ]}
              />
            </View>

            {/* Dynamic SubType selector */}
            <Controller
              control={control}
              name="subType"
              render={({ field: { onChange, value } }) => (
                <Select
                  label={STRINGS.fodder.subTypeLabel}
                  options={(
                    selectedCategory === 'green'
                      ? STRINGS.fodder.greenSubTypes
                      : selectedCategory === 'dry'
                        ? STRINGS.fodder.drySubTypes
                        : STRINGS.fodder.silageSubTypes
                  ).map((st) => ({ label: st, value: st }))}
                  selectedValue={value}
                  onValueChange={onChange}
                  error={!!errors.subType}
                  errorMessage={errors.subType?.message}
                />
              )}
            />

            {/* Area & Weight for Green Fodder */}
            {selectedCategory === 'green' && (
              <>
                <Controller
                  control={control}
                  name="area"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label={STRINGS.fodder.areaLabel}
                      placeholder={STRINGS.fodder.areaPlaceholder}
                      keyboardType="numeric"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="weight"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label={STRINGS.fodder.weightLabel}
                      placeholder={STRINGS.fodder.weightPlaceholder}
                      keyboardType="numeric"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </>
            )}

            {/* Silage Packing Type */}
            {selectedCategory === 'silage' && (
              <Controller
                control={control}
                name="packingType"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label={STRINGS.fodder.packingTypeLabel}
                    options={STRINGS.fodder.silagePackings.map((p) => ({ label: p, value: p }))}
                    selectedValue={value}
                    onValueChange={onChange}
                  />
                )}
              />
            )}

            {/* Price & Unit */}
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.fodder.priceLabel}
                  placeholder="उदा. १८०००"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.price}
                  errorMessage={errors.price?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="unit"
              render={({ field: { onChange, value } }) => (
                <Select
                  label={STRINGS.fodder.selectUnitLabel}
                  options={(
                    selectedCategory === 'green'
                      ? STRINGS.fodder.greenUnits
                      : selectedCategory === 'dry'
                        ? STRINGS.fodder.dryUnits
                        : ['प्रति ५० किलो बॅग', 'प्रति १ टन बॅग', 'प्रति किलो', 'प्रति बेल']
                  ).map((u) => ({ label: u, value: u }))}
                  selectedValue={value}
                  onValueChange={onChange}
                  error={!!errors.unit}
                  errorMessage={errors.unit?.message}
                />
              )}
            />

            {/* Additional Remarks */}
            <Controller
              control={control}
              name="remarks"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.fodder.remarksLabel}
                  placeholder={STRINGS.fodder.remarksPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  multiline={true}
                  numberOfLines={3}
                  error={!!errors.remarks}
                  errorMessage={errors.remarks?.message}
                />
              )}
            />

            {/* Save Button */}
            <Button
              title={STRINGS.common.save}
              loading={submitting}
              disabled={submitting}
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
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    elevation: 3,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSizeLg,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  chipsWrapper: {
    flexGrow: 0,
    height: 52,
    maxHeight: 52,
    backgroundColor: '#FFFFFF',
  },
  chipsContainer: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  chip: {
    marginRight: SPACING.xs,
  },
  filterStrip: {
    height: 42,
    maxHeight: 42,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterToggle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
  },
  filterToggleActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  listingCard: {
    marginVertical: SPACING.xs,
  },
  cardGallery: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  cardPhoto: {
    width: 140,
    height: 100,
    borderRadius: SIZES.radiusMd,
    marginRight: SPACING.xs,
    backgroundColor: '#E0E0E0',
  },
  cardDetails: {
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  unitBadge: {
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#E8F5E9',
    color: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: SPACING.xs,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  remarksText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 6,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  farmerLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  farmerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  callButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  whatsappButton: {
    flex: 1,
    borderColor: '#25D366',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.xl,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    color: COLORS.textSecondary,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.md,
    borderRadius: SIZES.radiusLg,
    maxHeight: '90%',
  },
  modalScroll: {
    padding: SPACING.lg,
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 4,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  segmentedContainer: {
    marginVertical: SPACING.sm,
  },
  fieldError: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: 'bold',
    marginTop: 2,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});
