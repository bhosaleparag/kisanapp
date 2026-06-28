import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Image, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, Portal, Modal, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePickerSDK from 'expo-image-picker';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { bullRecordSchema } from '../utils/schemas';
import { addBullRecord, updateBullRecord } from '../services/bullService';
import { useAppStore } from '../store/useAppStore';
import Input from './Input';
import Button from './Button';

export default function BullFormModal({
  visible,
  onClose,
  bull = null,
  brandId,
  brandName,
  onSuccess,
}) {
  const user = useAppStore((state) => state.user);
  const strings = STRINGS.bullInfo;

  // Date picker state variables
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  // Multi-image picker state
  const [selectedImages, setSelectedImages] = useState([]);
  const [saving, setSaving] = useState(false);

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
        mediaTypes: ['images'],
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

  const parseEvaluationDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? new Date() : new Date(parsed);
  };

  // Form Setup
  const defaultValues = useMemo(() => {
    if (bull) {
      const pedigree = bull.pedigree || {};
      const cdcbChart = bull.cdcbChart || {};
      const production = cdcbChart.production || {};
      const health = cdcbChart.health || {};
      const conformation = cdcbChart.conformation || {};

      return {
        bullName: bull.bullName || '',
        naabCode: bull.naabCode || '',
        registrationNumber: bull.registrationNumber || '',
        tpi: bull.tpi || '',
        breed: bull.breed || '',
        photoUrl: bull.photoUrl || '',
        sire: pedigree.sire || '',
        damSire: pedigree.damSire || '',
        mgs: pedigree.mgs || '',
        mgd: pedigree.mgd || '',
        mggs: pedigree.mggs || '',
        evaluationDate: cdcbChart.evaluationDate || 'June 2026',
        milkLbs: String(production.milkLbs ?? ''),
        fatLbs: String(production.fatLbs ?? ''),
        fatPercent: String(production.fatPercent ?? ''),
        proteinLbs: String(production.proteinLbs ?? ''),
        proteinPercent: String(production.proteinPercent ?? ''),
        combinedFatProtein: String(production.combinedFatProtein ?? ''),
        reliability: String(production.reliability ?? ''),
        productiveLife: String(health.productiveLife ?? ''),
        daughterPregnancyRate: String(health.daughterPregnancyRate ?? ''),
        sireConceptionRate: String(health.sireConceptionRate ?? ''),
        heiferConceptionRate: String(health.heiferConceptionRate ?? ''),
        cowConceptionRate: String(health.cowConceptionRate ?? ''),
        betaCasein: health.betaCasein || 'A2A2',
        somaticCellScore: String(health.somaticCellScore ?? ''),
        sireCalvingEase: String(health.sireCalvingEase ?? ''),
        daughterCalvingEase: String(health.daughterCalvingEase ?? ''),
        sireStillbirth: String(health.sireStillbirth ?? ''),
        daughterStillbirth: String(health.daughterStillbirth ?? ''),
        mast: String(health.mast ?? ''),
        metr: String(health.metr ?? ''),
        keto: String(health.keto ?? ''),
        repl: String(health.repl ?? ''),
        dsab: String(health.dsab ?? ''),
        mfev: String(health.mfev ?? ''),
        ptat: String(conformation.ptat ?? ''),
        udderComposite: String(conformation.udderComposite ?? ''),
        feetLegsComposite: String(conformation.feetLegsComposite ?? ''),
        bodyWeightComposite: String(conformation.bodyWeightComposite ?? ''),
      };
    }

    return {
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
      combinedFatProtein: '100',
      reliability: '90',
      productiveLife: '4.0',
      daughterPregnancyRate: '0.0',
      sireConceptionRate: '1.5',
      heiferConceptionRate: '1.2',
      cowConceptionRate: '0.5',
      betaCasein: 'A2A2',
      somaticCellScore: '2.80',
      sireCalvingEase: '2.0',
      daughterCalvingEase: '2.1',
      sireStillbirth: '5.5',
      daughterStillbirth: '6.2',
      mast: '2.0',
      metr: '1.5',
      keto: '1.5',
      repl: '0.5',
      dsab: '0.8',
      mfev: '0.3',
      ptat: '1.0',
      udderComposite: '1.0',
      feetLegsComposite: '1.0',
      bodyWeightComposite: '0.85',
    };
  }, [bull]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bullRecordSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      reset(defaultValues);
      if (bull) {
        setSelectedImages(bull.photoUrls && bull.photoUrls.length > 0 ? bull.photoUrls : (bull.photoUrl ? [bull.photoUrl] : []));
        setPickerDate(parseEvaluationDate(bull.cdcbChart?.evaluationDate));
      } else {
        setSelectedImages([]);
        setPickerDate(new Date());
      }
    }
  }, [visible, bull, reset, defaultValues]);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPickerDate(selectedDate);
      const formatted = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setValue('evaluationDate', formatted);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedImages || selectedImages.length === 0) {
      Alert.alert(STRINGS.common.errorTitle, strings.photoRequiredError);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...data,
        brandId: brandId || bull?.brandId,
        brandName: brandName || bull?.brandName,
        localImageUris: selectedImages,
      };

      let result;
      if (bull) {
        result = await updateBullRecord(bull.bullId, payload, user?.uid);
        Alert.alert(STRINGS.common.success, strings.updateBullSuccess);
      } else {
        result = await addBullRecord(payload, user?.uid);
        Alert.alert(STRINGS.common.success, strings.saveBullSuccess);
      }

      onClose();
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Failed to save bull record:', error);
      Alert.alert(STRINGS.common.errorTitle, bull ? strings.updateBullError : strings.saveBullError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => {
          if (!saving) {
            onClose();
          }
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{bull ? strings.editBull : strings.addBull}</Text>
            <IconButton
              icon="close"
              size={24}
              disabled={saving}
              onPress={onClose}
            />
          </View>

          {/* Basic Info Header */}
          <Text style={styles.sectionHeader}>{strings.basicInfoSection}</Text>

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
                disabled={saving}
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
                disabled={saving || !!bull} // Disable modifying NAAB code for existing records to keep IDs stable
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                    disabled={saving}
                    onPress={() => handleRemoveImage(index)}
                  />
                </View>
              ))}
              {selectedImages.length === 0 && (
                <Text style={styles.noImagesText}>{strings.photoUrlsPlaceholder}</Text>
              )}
            </ScrollView>

            {/* Action Triggers Row */}
            {selectedImages.length < 5 && !saving && (
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
          <Text style={styles.sectionHeader}>{strings.pedigreeSection}</Text>

          <Controller
            control={control}
            name="sire"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.sireLabel}
                placeholder={strings.sirePlaceholder}
                value={value}
                onChangeText={onChange}
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
            )}
          />

          {/* CDCB Stats Header */}
          <Text style={styles.sectionHeader}>{strings.cdcbStatsSection}</Text>

          {/* Date Time Picker field for evaluation date */}
          <Controller
            control={control}
            name="evaluationDate"
            render={({ field: { value } }) => (
              <TouchableOpacity
                onPress={() => !saving && setShowDatePicker(true)}
                activeOpacity={0.7}
                disabled={saving}
              >
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="combinedFatProtein"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.combinedFatProteinLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                placeholder={strings.combinedFatProteinPlaceholder}
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="productiveLife"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.productiveLifeLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
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
                disabled={saving}
              />
            )}
          />

          <Text style={styles.subSectionHeader}>{strings.fertilityTitle}</Text>

          <Controller
            control={control}
            name="daughterPregnancyRate"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.dprLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="sireConceptionRate"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.scrLabel}
                placeholder={strings.scrPlaceholder}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
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
                disabled={saving}
              />
            )}
          />

          <Text style={styles.subSectionHeader}>{strings.healthTitle}</Text>

          <Controller
            control={control}
            name="heiferConceptionRate"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.hcrLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="mast"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.mastLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="metr"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.metrLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="keto"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.ketoLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="repl"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.replLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="dsab"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.dsabLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="mfev"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.mfevLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
              />
            )}
          />

          <Text style={styles.subSectionHeader}>{strings.calvingTitle}</Text>

          <Controller
            control={control}
            name="sireCalvingEase"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.sceLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="udderComposite"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.udderCompositeLabel || strings.udcLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
              />
            )}
          />

          <Controller
            control={control}
            name="feetLegsComposite"
            render={({ field: { onChange, value } }) => (
              <Input
                label={strings.feetLegsCompositeLabel || strings.flcLabel}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                disabled={saving}
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
                disabled={saving}
              />
            )}
          />

          {/* Save Button */}
          <Button
            title={strings.saveBullBtn}
            onPress={handleSubmit(onSubmit)}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
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
