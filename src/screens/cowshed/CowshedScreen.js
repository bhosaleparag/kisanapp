import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Text, FAB, Portal, Modal, SegmentedButtons, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { cowshedSchema } from '../../utils/schemas';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function CowshedScreen() {
  const [cows, setCows] = useState([
    { id: '1', cowName: 'गंगा (Tag 101)', breed: 'गीर', age: 4, milkYield: 12, healthStatus: 'healthy' },
    { id: '2', cowName: 'लक्ष्मी (Tag 102)', breed: 'खिलार', age: 5, milkYield: 8, healthStatus: 'healthy' },
    { id: '3', cowName: 'गौरी (Tag 103)', breed: 'देवणी', age: 3, milkYield: 10, healthStatus: 'sick' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cowshedSchema),
    defaultValues: {
      cowName: '',
      breed: '',
      age: '',
      milkYield: '',
      healthStatus: 'healthy',
    },
  });

  // Form Submit callback
  const onSubmit = (data) => {
    const newCow = {
      id: Date.now().toString(),
      cowName: data.cowName,
      breed: data.breed,
      age: parseFloat(data.age),
      milkYield: parseFloat(data.milkYield),
      healthStatus: data.healthStatus,
    };

    // Prepend new livestock record to the list
    setCows((prevCows) => [newCow, ...prevCows]);

    // Close modal & reset fields
    setModalVisible(false);
    reset({
      cowName: '',
      breed: '',
      age: '',
      milkYield: '',
      healthStatus: 'healthy',
    });
  };

  // Render individual livestock items in our custom premium Card
  const renderCowItem = ({ item }) => (
    <Card
      title={item.cowName}
      subtitle={`${STRINGS.cowshed.breed}: ${item.breed}`}
      style={styles.cowCard}
    >
      <View style={styles.cardDetails}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statLabel}>{STRINGS.cowshed.age}</Text>
          <Text style={styles.statValue}>{item.age} वर्षे</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🥛</Text>
          <Text style={styles.statLabel}>दैनिक दूध</Text>
          <Text style={styles.statValue}>{item.milkYield} लिटर</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={styles.statLabel}>आरोग्य</Text>
          <View style={[
            styles.healthBadge,
            item.healthStatus === 'healthy' ? styles.healthyBadge : styles.sickBadge
          ]}>
            <Text style={styles.badgeText}>
              {item.healthStatus === 'healthy' ? STRINGS.cowshed.healthy : STRINGS.cowshed.sick}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/*Live Dashboard Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          एकूण जनावरे: {cows.length} | एकूण दैनिक दूध: {cows.reduce((sum, c) => sum + c.milkYield, 0)} लिटर
        </Text>
      </View>

      {/* List Feed */}
      <FlatList
        data={cows}
        keyExtractor={(item) => item.id}
        renderItem={renderCowItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{STRINGS.common.noData}</Text>
          </View>
        }
      />

      {/*Floating Action Button (FAB) to Add Animal */}
      <FAB
        icon="plus"
        label={STRINGS.cowshed.addCow}
        color="#FFFFFF"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      {/*Portal for modal forms (lays over tab nav cleanly) */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{STRINGS.cowshed.addCow}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            {/* Input: Cow Name */}
            <Controller
              control={control}
              name="cowName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.cowshed.cowName}
                  placeholder="उदा. गंगा, लक्ष्मी"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.cowName}
                  errorMessage={errors.cowName?.message}
                />
              )}
            />

            {/* Input: Breed */}
            <Controller
              control={control}
              name="breed"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.cowshed.breed}
                  placeholder="उदा. गीर, खिलार, जर्सी"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.breed}
                  errorMessage={errors.breed?.message}
                />
              )}
            />

            {/* Input: Age */}
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.cowshed.age}
                  placeholder="उदा. ५"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.age}
                  errorMessage={errors.age?.message}
                />
              )}
            />

            {/* Input: Milk Yield */}
            <Controller
              control={control}
              name="milkYield"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.cowshed.milkYield}
                  placeholder="उदा. १०"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.milkYield}
                  errorMessage={errors.milkYield?.message}
                />
              )}
            />

            {/* Segmented Button: Health Status */}
            <Controller
              control={control}
              name="healthStatus"
              render={({ field: { onChange, value } }) => (
                <View style={styles.segmentedContainer}>
                  <Text style={styles.segmentedLabel}>{STRINGS.cowshed.healthStatus}</Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    style={styles.segmentedButtons}
                    buttons={[
                      {
                        value: 'healthy',
                        label: STRINGS.cowshed.healthy,
                        checkedColor: '#FFFFFF',
                        style: value === 'healthy' ? { backgroundColor: COLORS.success } : {},
                      },
                      {
                        value: 'sick',
                        label: STRINGS.cowshed.sick,
                        checkedColor: '#FFFFFF',
                        style: value === 'sick' ? { backgroundColor: COLORS.error } : {},
                      },
                    ]}
                  />
                  {errors.healthStatus && (
                    <Text style={styles.fieldError}>{errors.healthStatus.message}</Text>
                  )}
                </View>
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
    paddingBottom: 90, // Leave padding for FAB button overlaps
  },
  cowCard: {
    marginVertical: SPACING.xs,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  healthBadge: {
    borderRadius: SIZES.radiusRound,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  healthyBadge: {
    backgroundColor: COLORS.success,
  },
  sickBadge: {
    backgroundColor: COLORS.error,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    maxHeight: '100%',
    overflow: 'hidden',
  },
  modalScroll: {
    padding: SPACING.lg,
    paddingBottom: 40, // Ensures scrollable forms have breathing room and avoid bottom rounded corner clipping on iOS
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
