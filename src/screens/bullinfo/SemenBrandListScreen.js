import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, FAB, Portal, Modal, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePickerSDK from 'expo-image-picker';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { semenBrandSchema } from '../../utils/schemas';
import { getSemenBrands, addSemenBrand, updateSemenBrand, deleteSemenBrand } from '../../services/semenBrandService';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function SemenBrandListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAppStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const strings = STRINGS.bullInfo;

  // Safe permission checking & request
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

  // Launch Camera capture
  const handleTakePhoto = async (onChange) => {
    const hasPermission = await requestCameraAccess();
    if (!hasPermission) return;

    try {
      const result = await ImagePickerSDK.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square logo is optimal
        quality: 0.7,   // High-contrast compression to keep size low
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  // Launch Gallery selector
  const handleSelectPhoto = async (onChange) => {
    const hasPermission = await requestLibraryAccess();
    if (!hasPermission) return;

    try {
      const result = await ImagePickerSDK.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
    }
  };

  // Load brands on mount
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await getSemenBrands();
      setBrands(data);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Form Setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(semenBrandSchema),
    defaultValues: {
      brandName: '',
      logoUrl: '',
      isActive: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (editingBrand) {
        await updateSemenBrand(editingBrand.brandId, data);
        Alert.alert(STRINGS.common.success, strings.updateBrandSuccess);
      } else {
        await addSemenBrand(data);
        Alert.alert(STRINGS.common.success, strings.saveBrandSuccess);
      }
      setModalVisible(false);
      setEditingBrand(null);
      reset();
      // Refresh list
      await fetchBrands();
    } catch (error) {
      setLoading(false);
      Alert.alert(
        STRINGS.common.errorTitle,
        editingBrand ? strings.updateBrandError : strings.saveBrandError
      );
    }
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    reset({
      brandName: brand.brandName,
      logoUrl: brand.logoUrl || '',
      isActive: brand.isActive !== undefined ? brand.isActive : true,
    });
    setModalVisible(true);
  };

  const handleDeleteBrand = (brand) => {
    Alert.alert(
      strings.deleteBrandConfirmTitle,
      strings.deleteBrandConfirmDesc,
      [
        {
          text: STRINGS.common.cancel,
          style: 'cancel',
        },
        {
          text: STRINGS.common.confirm,
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSemenBrand(brand.brandId);
              Alert.alert(STRINGS.common.success, strings.deleteBrandSuccess);
              await fetchBrands();
            } catch (error) {
              setLoading(false);
              Alert.alert(STRINGS.common.errorTitle, strings.deleteBrandError);
            }
          },
        },
      ]
    );
  };

  const handleBrandPress = (brand) => {
    // Navigate to BullRoster stack screen, passing brand ID and name
    navigation.navigate('BullRoster', {
      brandId: brand.brandId,
      brandName: brand.brandName,
    });
  };

  const renderBrandItem = ({ item }) => {
    return (
      <Card
        style={styles.brandCard}
      >
        <View style={styles.brandRow}>
          <TouchableOpacity
            style={styles.brandMainInfo}
            onPress={() => handleBrandPress(item)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.logoUrl }} style={styles.brandLogo} resizeMode="cover" />
            <Text style={styles.brandNameText}>{item.brandName}</Text>
          </TouchableOpacity>

          {isAdmin && (
            <View style={styles.actionButtonsContainer}>
              <IconButton
                icon="pencil"
                iconColor={COLORS.primary}
                size={22}
                onPress={() => handleEditBrand(item)}
                style={styles.actionBtn}
              />
              <IconButton
                icon="delete"
                iconColor={COLORS.error}
                size={22}
                onPress={() => handleDeleteBrand(item)}
                style={styles.actionBtn}
              />
            </View>
          )}
        </View>
      </Card>
    );
  };

  if (loading && brands.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.title}>{strings.semenBrandsTitle}</Text>
        <Text style={styles.subtitle}>{strings.semenBrandsSubtitle}</Text>
      </View>

      {/* Brand Grid List */}
      <FlatList
        data={brands}
        keyExtractor={(item) => item.brandId}
        renderItem={renderBrandItem}
        contentContainerStyle={styles.listContent}
        numColumns={1}
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
          label={strings.addBrand}
          color="#FFFFFF"
          style={[styles.fab, { bottom: insets.bottom + SPACING.xl }]}
          onPress={() => setModalVisible(true)}
        />
      )}

      {/* Add/Edit Brand Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setEditingBrand(null);
            reset();
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBrand ? strings.editBrand : strings.addBrand}
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => {
                  setModalVisible(false);
                  setEditingBrand(null);
                  reset();
                }}
              />
            </View>

            {/* Brand Name Input */}
            <Controller
              control={control}
              name="brandName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.brandNameLabel}
                  placeholder={strings.brandNamePlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.brandName}
                  errorMessage={errors.brandName?.message}
                />
              )}
            />

            {/* Logo Image Picker */}
            <Controller
              control={control}
              name="logoUrl"
              render={({ field: { onChange, value } }) => (
                <View style={styles.imageSelectorContainer}>
                  <Text style={styles.imageSectionTitle}>{strings.logoUrlLabel}</Text>
                  
                  {value ? (
                    <View style={styles.selectedContainer}>
                      <Text style={styles.selectedText}>✅ {strings.logoSelected}</Text>
                      <IconButton
                        icon="close-circle"
                        size={20}
                        iconColor={COLORS.error}
                        style={styles.removeBtn}
                        onPress={() => onChange('')}
                      />
                    </View>
                  ) : (
                    <Text style={styles.noImagesText}>{strings.logoUrlPlaceholder}</Text>
                  )}

                  {!value && (
                    <View style={styles.imageActionButtons}>
                      <Button
                        title={strings.cameraOption}
                        icon="camera"
                        mode="outlined"
                        onPress={() => handleTakePhoto(onChange)}
                        style={styles.pickerButton}
                        labelStyle={styles.pickerButtonLabel}
                      />
                      <Button
                        title={strings.galleryOption}
                        icon="image-multiple"
                        mode="outlined"
                        onPress={() => handleSelectPhoto(onChange)}
                        style={styles.pickerButton}
                        labelStyle={styles.pickerButtonLabel}
                      />
                    </View>
                  )}
                  {!!errors.logoUrl && (
                    <Text style={styles.errorText}>{errors.logoUrl?.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Save Button */}
            <Button
              title={strings.saveBrandBtn}
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
    padding: SPACING.md,
    paddingBottom: 90,
  },
  brandCard: {
    marginVertical: SPACING.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusSm,
    marginRight: SPACING.md,
  },
  brandNameText: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
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
    maxHeight: '100%',
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
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
  imageSelectorContainer: {
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  imageSectionTitle: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  noImagesText: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radiusSm,
  },
  selectedText: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
  removeBtn: {
    margin: 0,
  },
  imageActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  pickerButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  pickerButtonLabel: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  brandMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    margin: 0,
  },
});
