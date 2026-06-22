import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Image, ScrollView, Alert } from 'react-native';
import { Text, ActivityIndicator, FAB, Portal, Modal, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { semenBrandSchema } from '../../utils/schemas';
import { getSemenBrands, addSemenBrand } from '../../services/semenBrandService';
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

  const strings = STRINGS.bullInfo;

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
      await addSemenBrand(data);
      setModalVisible(false);
      reset();
      // Refresh list
      await fetchBrands();
      Alert.alert(STRINGS.common.success, strings.saveBrandSuccess);
    } catch (error) {
      setLoading(false);
      Alert.alert(STRINGS.common.errorTitle, strings.saveBrandError);
    }
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
        onPress={() => handleBrandPress(item)}
        style={styles.brandCard}
      >
        <View style={styles.brandRow}>
          <Image source={{ uri: item.logoUrl }} style={styles.brandLogo} resizeMode="cover" />
          <Text style={styles.brandNameText}>{item.brandName}</Text>
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

      {/* Add Brand Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            reset();
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{strings.addBrand}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => {
                  setModalVisible(false);
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

            {/* Logo URL Input */}
            <Controller
              control={control}
              name="logoUrl"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={strings.logoUrlLabel}
                  placeholder={strings.logoUrlPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.logoUrl}
                  errorMessage={errors.logoUrl?.message}
                />
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
});
