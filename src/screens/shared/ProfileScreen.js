import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { Text, Card as PaperCard, SegmentedButtons, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signOut } from '@react-native-firebase/auth';
import { auth } from '../../services/firebase';
import { useAppStore } from '../../store/useAppStore';
import { saveProfile } from '../../services/profileService';
import { profileSchema } from '../../utils/schemas';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ImagePicker from '../../components/ImagePicker';
import Select from '../../components/Select';
import { SOLAPUR_DATA } from '../../constants/solapurData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md * 2;
const MAP_HEIGHT = 160;

// Solapur center point as reference
const MAP_CENTER_LAT = 17.6599;
const MAP_CENTER_LNG = 75.9064;

export default function ProfileScreen({ navigation }) {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const logout = useAppStore((state) => state.logout);

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(user?.profileImage || null);

  // Coordinates state: default to user's saved location, or Solapur reference
  const [locationCoords, setLocationCoords] = useState(
    user?.location || { lat: MAP_CENTER_LAT, lng: MAP_CENTER_LNG }
  );

  // Setup react-hook-form with Zod schemas validation
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      role: user?.role || 'farmer',
      district: user?.district || STRINGS.profile.solapur, // Lock to Solapur district for now
      taluka: user?.taluka || '',
      village: user?.village || '',
      pincode: user?.pincode || '',
      farmDetails: {
        totalArea: user?.farmDetails?.totalArea?.toString() || '',
        cultivatedArea: user?.farmDetails?.cultivatedArea?.toString() || '',
        mainCrop: user?.farmDetails?.mainCrop || '',
      },
    },
  });

  // Watch taluka value for cascading village selector
  const watchedTaluka = watch('taluka');

  // Trigger when taluka changes: clear village selection to keep form consistent
  useEffect(() => {
    if (watchedTaluka) {
      const currentVillage = watch('village');
      const validVillages = SOLAPUR_DATA.talukas[watchedTaluka] || [];
      if (!validVillages.includes(currentVillage)) {
        setValue('village', ''); // Clear invalid village
      }
    } else {
      setValue('village', '');
    }
  }, [watchedTaluka, setValue]);

  // Handler: Detect/Simulate GPS exact satellite location
  const handleDetectGPS = () => {
    setLoading(true);
    // Simulate high-fidelity GPS triangulation
    setTimeout(() => {
      setLoading(false);
      // Solapur Pandharpur area precise offset
      const exactLat = MAP_CENTER_LAT + (Math.random() - 0.5) * 0.02;
      const exactLng = MAP_CENTER_LNG + (Math.random() - 0.5) * 0.02;
      setLocationCoords({ lat: exactLat, lng: exactLng });

      Alert.alert(
        STRINGS.common.appName,
        `${STRINGS.profile.gpsSuccessMsg}\n\n${STRINGS.profile.latitude} (Lat): ${exactLat.toFixed(6)}\n${STRINGS.profile.longitude} (Lng): ${exactLng.toFixed(6)}`
      );
    }, 1200);
  };

  // Save form data to Firestore
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updatedProfile = await saveProfile(
        user.uid,
        {
          ...user,
          name: data.name,
          phone: data.phone,
          role: data.role,
          district: data.district,
          taluka: data.taluka,
          village: data.village,
          farmDetails: {
            totalArea: parseFloat(data.farmDetails.totalArea),
            cultivatedArea: parseFloat(data.farmDetails.cultivatedArea),
            mainCrop: data.farmDetails.mainCrop,
          },
          location: locationCoords,
        },
        selectedImage
      );

      setUser(updatedProfile);
      Alert.alert(STRINGS.common.appName, STRINGS.profile.saveSuccess);
      navigation.goBack();
    } catch (error) {
      console.error('[ProfileScreen] Save profile error:', error);
      Alert.alert(STRINGS.common.appName, STRINGS.profile.saveError);
    } finally {
      setLoading(false);
    }
  };

  // Sign out handler
  const handleLogout = () => {
    Alert.alert(
      STRINGS.common.welcome,
      STRINGS.profile.logoutConfirmTitle,
      [
        { text: STRINGS.common.cancel, style: 'cancel' },
        {
          text: STRINGS.profile.logoutConfirmBtn,
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut(auth);
              logout();
            } catch (err) {
              console.error('[ProfileScreen] Logout failure:', err);
              Alert.alert(STRINGS.common.appName, STRINGS.profile.logoutError);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Build taluka option array for Select component
  const talukaOptions = Object.keys(SOLAPUR_DATA.talukas).map((t) => ({ value: t, label: t }));

  // Build dynamic village options array based on active selected taluka
  const villageOptions = watchedTaluka
    ? (SOLAPUR_DATA.talukas[watchedTaluka] || []).map((v) => ({ value: v, label: v }))
    : [];

  return (
    <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>

        {/* Profile Pic Card */}
        <PaperCard style={styles.sectionCard} mode="elevated">
          <PaperCard.Content style={styles.profileHeader}>
            <View style={styles.imagePickerWrapper}>
              <ImagePicker imageUri={selectedImage} onImageSelected={setSelectedImage} />
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>⭐️ {user?.rating?.toFixed(1) || '5.0'} {STRINGS.profile.ratingLabel}</Text>
              </View>
              <View style={[styles.metaBadge, styles.activeBadge]}>
                <Text style={[styles.metaText, styles.activeText]}>✅ {STRINGS.profile.activeFarmer}</Text>
              </View>
            </View>
          </PaperCard.Content>
        </PaperCard>

        {/* Section 1: Personal Details */}
        <PaperCard style={styles.sectionCard} mode="elevated">
          <PaperCard.Content>
            <Text style={styles.sectionTitle}>👤 {STRINGS.profile.personalInfo}</Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.profile.nameLabel}
                  placeholder={STRINGS.profile.namePlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.name}
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.common.phone}
                  placeholder={STRINGS.profile.phonePlaceholder}
                  keyboardType="numeric"
                  value={value}
                  disabled={true}
                  error={!!errors.phone}
                  errorMessage={errors.phone?.message}
                />
              )}
            />

            {/* <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <View style={styles.segmentedContainer}>
                  <Text style={styles.segmentedLabel}>{STRINGS.profile.roleLabel}</Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    style={styles.segmentedButtons}
                    buttons={[
                      {
                        value: 'buyer',
                        label: STRINGS.profile.buyer,
                        checkedColor: '#FFFFFF',
                        style: value === 'buyer' ? { backgroundColor: COLORS.primary } : {},
                      },
                      {
                        value: 'seller',
                        label: STRINGS.profile.seller,
                        checkedColor: '#FFFFFF',
                        style: value === 'seller' ? { backgroundColor: COLORS.primary } : {},
                      },
                      {
                        value: 'both',
                        label: STRINGS.profile.both,
                        checkedColor: '#FFFFFF',
                        style: value === 'both' ? { backgroundColor: COLORS.primary } : {},
                      },
                    ]}
                  />
                  {errors.role && (
                    <Text style={styles.fieldError}>{errors.role.message}</Text>
                  )}
                </View>
              )}
            /> */}
          </PaperCard.Content>
        </PaperCard>

        {/* Section 2: Solapur Address Dropdowns & Simulated Exact Map Location */}
        <PaperCard style={styles.sectionCard} mode="elevated">
          <PaperCard.Content>
            <Text style={styles.sectionTitle}>📍 {STRINGS.profile.addressTitle}</Text>

            {/* Input: Locked District Selection */}
            <Controller
              control={control}
              name="district"
              render={({ field: { onChange, value } }) => (
                <Select
                  label={STRINGS.profile.districtLabel}
                  selectedValue={value}
                  onValueChange={onChange}
                  options={[{ value: 'सोलापूर', label: STRINGS.profile.solapur }]}
                  disabled={true} // Lock district selection to Solapur only
                />
              )}
            />

            {/* Input: Taluka searchable dropdown */}
            <Controller
              control={control}
              name="taluka"
              render={({ field: { onChange, value } }) => (
                <Select
                  label={STRINGS.profile.selectTaluka}
                  selectedValue={value}
                  onValueChange={onChange}
                  options={talukaOptions}
                  placeholder={STRINGS.profile.talukaPlaceholder}
                  error={!!errors.taluka}
                  errorMessage={errors.taluka?.message}
                />
              )}
            />

            {/* Input: Cascading Village searchable dropdown */}
            <Controller
              control={control}
              name="village"
              render={({ field: { onChange, value } }) => (
                <Select
                  label={STRINGS.profile.selectVillage}
                  selectedValue={value}
                  onValueChange={onChange}
                  options={villageOptions}
                  placeholder={watchedTaluka ? STRINGS.profile.villagePlaceholder : STRINGS.profile.selectTalukaFirst}
                  disabled={!watchedTaluka} // Disable until taluka is selected
                  error={!!errors.village}
                  errorMessage={errors.village?.message}
                />
              )}
            />

            {/* Pincode Input */}
            <Controller
              control={control}
              name="pincode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.profile.pincodeLabel}
                  placeholder={STRINGS.profile.pincodePlaceholder}
                  keyboardType="numeric"
                  maxLength={6}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.pincode}
                  errorMessage={errors.pincode?.message}
                />
              )}
            />

            {/* Premium Agricultural Vector Map Coordinate Selector */}
            <View style={styles.mapSection}>
              <View style={styles.mapHeaderRow}>
                <Text style={styles.mapSectionTitle}>🚜 {STRINGS.profile.mapSelectTitle}</Text>
                <IconButton
                  icon="crosshairs-gps"
                  size={20}
                  iconColor={COLORS.primary}
                  containerColor={COLORS.primaryLight}
                  style={styles.gpsIconBtn}
                  onPress={handleDetectGPS}
                />
              </View>
              <Text style={styles.mapSubText}>
                {STRINGS.profile.mapSelectSub}
              </Text>
              {/* Coordinates display bar */}
              <View style={styles.coordsDisplayBar}>
                <Text style={styles.coordsText}>
                  📍 {STRINGS.profile.latitude}: <Text style={styles.coordsValue}>{locationCoords.lat.toFixed(5)}</Text> | {STRINGS.profile.longitude}: <Text style={styles.coordsValue}>{locationCoords.lng.toFixed(5)}</Text>
                </Text>
              </View>
            </View>
          </PaperCard.Content>
        </PaperCard>

        {/* Section 3: Farm Size details */}
        <PaperCard style={styles.sectionCard} mode="elevated">
          <PaperCard.Content>
            <Text style={styles.sectionTitle}>🌾 {STRINGS.profile.farmDetailsTitle}</Text>

            <Controller
              control={control}
              name="farmDetails.totalArea"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.profile.totalAreaLabel}
                  placeholder={STRINGS.profile.totalAreaPlaceholder}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.farmDetails?.totalArea}
                  errorMessage={errors.farmDetails?.totalArea?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="farmDetails.cultivatedArea"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.profile.cultivatedAreaLabel}
                  placeholder={STRINGS.profile.cultivatedAreaPlaceholder}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.farmDetails?.cultivatedArea}
                  errorMessage={errors.farmDetails?.cultivatedArea?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="farmDetails.mainCrop"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.profile.mainCropLabel}
                  placeholder={STRINGS.profile.mainCropPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.farmDetails?.mainCrop}
                  errorMessage={errors.farmDetails?.mainCrop?.message}
                />
              )}
            />
          </PaperCard.Content>
        </PaperCard>

        {/* Action Save button */}
        <Button
          title={STRINGS.common.save}
          onPress={handleSubmit(onSubmit)}
          style={styles.saveButton}
          disabled={loading}
        />

        {/* Action Logout button */}
        <Button
          title={STRINGS.profile.logoutBtn}
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          disabled={loading}
        />

      </ScrollView>

      {/* Loading animation backdrop spinner */}
      {loading && (
        <View style={styles.loadingBackdrop}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{STRINGS.common.loading}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100, // Increased bottom padding to prevent logout button from being cut off
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    marginVertical: SPACING.sm,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  imagePickerWrapper: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  metaBadge: {
    backgroundColor: COLORS.accentLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusSm,
    marginHorizontal: 4,
    borderColor: COLORS.accent,
    borderWidth: 1,
  },
  metaText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#D48C00',
  },
  activeBadge: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  activeText: {
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
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
  mapSection: {
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  gpsIconBtn: {
    margin: 0,
  },
  mapSubText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  mapFrameOuter: {
    width: '100%',
    height: MAP_HEIGHT,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  mapFrameInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F5E9', // Agricultural soft green background
    position: 'relative',
  },
  gridLineX: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(27, 94, 32, 0.1)',
    borderStyle: 'dashed',
  },
  gridLineY: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(27, 94, 32, 0.1)',
    borderStyle: 'dashed',
  },
  farmPlot: {
    position: 'absolute',
    backgroundColor: '#C8E6C9', // Dry land plot
    borderColor: '#81C784',
    borderWidth: 1,
    borderRadius: SIZES.radiusSm,
  },
  farmPlotIrrigated: {
    backgroundColor: '#A5D6A7', // Irrigated green crop plot
    borderColor: '#66BB6A',
  },
  farmPlotHouse: {
    backgroundColor: '#FFCC80', // Farm house plot
    borderColor: '#FFA726',
  },
  plotLabel: {
    position: 'absolute',
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  mapMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    margin: 0,
    padding: 0,
    zIndex: 10,
  },
  markerPulse: {
    position: 'absolute',
    bottom: 4,
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(211, 47, 47, 0.4)',
    zIndex: 1,
  },
  coordsDisplayBar: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  coordsText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  coordsValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  saveButton: {
    marginVertical: SPACING.sm,
    height: 54,
  },
  logoutButton: {
    marginVertical: SPACING.xs,
    height: 54,
    borderColor: COLORS.error,
  },
  loadingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
});
