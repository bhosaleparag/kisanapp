import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Linking } from 'react-native';
import { Text, FAB, Portal, Modal, SegmentedButtons, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { marketplaceSchema } from '../../utils/schemas';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ImagePicker from '../../components/ImagePicker';

export default function MarketplaceScreen() {
  //Mock marketplace listings initial state (includes direct images)
  const [listings, setListings] = useState([
    {
      id: '1',
      title: 'गीर गाय विक्रीसाठी (१० लिटर क्षमता)',
      category: 'पशु',
      price: 65000,
      sellerName: 'रमेश चव्हाण',
      contactPhone: '9876543210',
      description: 'दुसऱ्या विताची अतिशय शांत आणि निरोगी गाय आहे.',
      imageUri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=800',
    },
    {
      id: '2',
      title: 'सुपर नेपिअर ओला घास चारा (१० पेंढ्या)',
      category: 'चारा',
      price: 1500,
      sellerName: 'ज्ञानेश्वर कदम',
      contactPhone: '9123456789',
      description: 'ताज्या कापणीचा हिरवा चारा उपलब्ध आहे. जागेवर डिलिव्हरी मिळेल.',
      imageUri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  //Setup react-hook-form with Zod validation resolver
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(marketplaceSchema),
    defaultValues: {
      title: '',
      category: 'पशु',
      price: '',
      sellerName: '',
      contactPhone: '',
      description: '',
    },
  });

  //Form Submit Callback
  const onSubmit = (data) => {
    const newListing = {
      id: Date.now().toString(),
      title: data.title,
      category: data.category,
      price: parseFloat(data.price),
      sellerName: data.sellerName,
      contactPhone: data.contactPhone,
      description: data.description || '',
      imageUri: selectedImage, // Attach selected picture from picker!
    };

    // Prepend new listing record to the catalog feed
    setListings((prevListings) => [newListing, ...prevListings]);

    // Close modal & reset fields
    setModalVisible(false);
    setSelectedImage(null);
    reset({
      title: '',
      category: 'पशु',
      price: '',
      sellerName: '',
      contactPhone: '',
      description: '',
    });
  };

  //Dial call launcher
  const callSeller = (phone) => {
    Linking.openURL(`tel:${phone}`).catch((err) =>
      console.error('Error triggering phone dial:', err)
    );
  };

  //Render individual marketplace items inside our custom Card
  const renderListingItem = ({ item }) => {
    // Action trigger button strip
    const actionsRow = (
      <Button
        mode="outlined"
        icon="phone"
        title={STRINGS.marketplace.contact}
        onPress={() => callSeller(item.contactPhone)}
        style={styles.cardCallButton}
      />
    );

    return (
      <Card
        title={item.title}
        subtitle={`${item.category} | ₹${item.price}`}
        coverImage={item.imageUri}
        actions={actionsRow}
        style={styles.listingCard}
      >
        <View style={styles.cardContent}>
          <Text style={styles.descriptionText}>{item.description}</Text>
          <View style={styles.sellerRow}>
            <Text style={styles.sellerLabel}>विक्रेता:</Text>
            <Text style={styles.sellerValue}>{item.sellerName}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* 6. Dashboard Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          एकूण सक्रिय जाहिराती: {listings.length} | खरेदी किंवा विक्रीसाठी संपर्क करा
        </Text>
      </View>

      {/* 7. Catalog Feed list */}
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderListingItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{STRINGS.common.noData}</Text>
          </View>
        }
      />

      {/* 8. Floating Action Button (FAB) to Post Listing */}
      <FAB
        icon="plus"
        label={STRINGS.marketplace.postListing}
        color="#FFFFFF"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      {/* 9. Portal for modal forms (lays over tab navigation cleanly) */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{STRINGS.marketplace.postListing}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            {/* Photo Picker segment */}
            <View style={styles.pickerSection}>
              <ImagePicker imageUri={selectedImage} onImageSelected={setSelectedImage} />
            </View>

            {/* Input: Title */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="जाहिरातीचे नाव"
                  placeholder="उदा. गीर बैल विक्री, सेंद्रिय खत"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.title}
                  errorMessage={errors.title?.message}
                />
              )}
            />

            {/* Input: Category */}
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View style={styles.segmentedContainer}>
                  <Text style={styles.segmentedLabel}>वर्ग निवडा</Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    style={styles.segmentedButtons}
                    buttons={[
                      {
                        value: 'पशु',
                        label: 'पशु',
                        checkedColor: '#FFFFFF',
                        style: value === 'पशु' ? { backgroundColor: COLORS.primary } : {},
                      },
                      {
                        value: 'चारा',
                        label: 'चारा',
                        checkedColor: '#FFFFFF',
                        style: value === 'चारा' ? { backgroundColor: COLORS.primary } : {},
                      },
                      {
                        value: 'खते/औषधे',
                        label: 'खते/औषध',
                        checkedColor: '#FFFFFF',
                        style: value === 'खते/औषधे' ? { backgroundColor: COLORS.primary } : {},
                      },
                    ]}
                  />
                  {errors.category && (
                    <Text style={styles.fieldError}>{errors.category.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Input: Price */}
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="किंमत (₹)"
                  placeholder="उदा. ५००००"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.price}
                  errorMessage={errors.price?.message}
                />
              )}
            />

            {/* Input: Seller Name */}
            <Controller
              control={control}
              name="sellerName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.marketplace.seller}
                  placeholder="उदा. रमेश चव्हाण"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.sellerName}
                  errorMessage={errors.sellerName?.message}
                />
              )}
            />

            {/* Input: Phone Number */}
            <Controller
              control={control}
              name="contactPhone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.common.phone}
                  placeholder="उदा. ९८७६५४३२१०"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.contactPhone}
                  errorMessage={errors.contactPhone?.message}
                />
              )}
            />

            {/* Input: Description */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="सविस्तर माहिती (पर्यायी)"
                  placeholder="वय, दूध क्षमता किंवा माहिती लिहा..."
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.description}
                  errorMessage={errors.description?.message}
                  multiline={true}
                  numberOfLines={3}
                />
              )}
            />

            {/* Save Button */}
            <Button
              title={STRINGS.common.save}
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
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizeLg,
    lineHeight: TYPOGRAPHY.lineHeightLg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.primaryLight,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 90,
  },
  listingCard: {
    marginVertical: SPACING.xs,
  },
  cardContent: {
    marginVertical: SPACING.xs,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sellerLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  sellerValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardCallButton: {
    flex: 1,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.xl,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    color: COLORS.textSecondary,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.lg,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  modalScroll: {
    padding: SPACING.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pickerSection: {
    marginBottom: SPACING.xs,
  },
  segmentedContainer: {
    marginVertical: SPACING.sm,
    width: '100%',
  },
  segmentedLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  segmentedButtons: {
    borderRadius: SIZES.radiusMd,
  },
  fieldError: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: 'bold',
    marginTop: 4,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
});
