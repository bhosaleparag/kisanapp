import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Portal, Modal, IconButton, TextInput } from 'react-native-paper';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { bulkUpdateMilkLbs } from '../services/bullService';
import Button from './Button';

export default function BulkEditMilkLbsModal({
  visible,
  onClose,
  bulls = [],
  onSuccess,
}) {
  const strings = STRINGS.bullInfo;

  const [localLbs, setLocalLbs] = useState({});
  const [quickSetValue, setQuickSetValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize values when modal opens
  useEffect(() => {
    if (visible && bulls) {
      const initialMap = {};
      bulls.forEach((b) => {
        initialMap[b.bullId] = String(b.cdcbChart?.production?.milkLbs ?? '');
      });
      setLocalLbs(initialMap);
      setQuickSetValue('');
    }
  }, [visible, bulls]);

  const handleApplyToAll = () => {
    if (!quickSetValue.trim()) {
      return;
    }
    const val = quickSetValue.replace(/[^0-9]/g, '');
    const updated = { ...localLbs };
    Object.keys(updated).forEach((id) => {
      updated[id] = val;
    });
    setLocalLbs(updated);
  };

  const handleSingleChange = (bullId, text) => {
    const val = text.replace(/[^0-9]/g, '');
    setLocalLbs((prev) => ({
      ...prev,
      [bullId]: val,
    }));
  };

  const handleSave = async () => {
    const updates = Object.entries(localLbs).map(([bullId, milkLbs]) => ({
      bullId,
      milkLbs,
    }));

    if (updates.length === 0) {
      Alert.alert(STRINGS.common.appName, strings.bulkUpdateNoBulls);
      return;
    }

    setSaving(true);
    try {
      await bulkUpdateMilkLbs(updates);
      Alert.alert(STRINGS.common.success, strings.bulkUpdateSuccess);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('[BulkEditMilkLbsModal] Failed to bulk update:', error);
      Alert.alert(STRINGS.common.errorTitle, strings.bulkUpdateError);
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

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{strings.bulkEditTitle}</Text>
            <IconButton
              icon="close"
              size={24}
              disabled={saving}
              onPress={onClose}
              style={styles.closeBtn}
            />
          </View>

          {/* Quick Set Section */}
          <View style={styles.quickSetContainer}>
            <Text style={styles.quickSetLabel}>{strings.quickSetLabel}</Text>
            <View style={styles.quickSetRow}>
              <TextInput
                mode="outlined"
                placeholder={strings.quickSetPlaceholder}
                value={quickSetValue}
                onChangeText={(text) => setQuickSetValue(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.quickSetInput}
                disabled={saving}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                theme={{
                  roundness: SIZES.radiusSm,
                  colors: { background: COLORS.surface },
                }}
              />
              <Button
                title={strings.applyToAllBtn}
                onPress={handleApplyToAll}
                mode="contained"
                disabled={saving || !quickSetValue.trim()}
                style={styles.applyBtn}
                labelStyle={styles.applyBtnLabel}
              />
            </View>
          </View>

          {/* Scrollable list of bulls */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {bulls.map((bull) => {
              const value = localLbs[bull.bullId] ?? '';
              return (
                <View key={bull.bullId} style={styles.bullRow}>
                  {/* Photo & Identity details */}
                  <Image
                    source={{ uri: bull.photoUrl }}
                    style={styles.bullPhoto}
                    resizeMode="cover"
                  />
                  <View style={styles.bullInfoContainer}>
                    <Text style={styles.bullCodeText}>{bull.naabCode}</Text>
                    <Text numberOfLines={1} style={styles.bullNameText}>
                      {bull.bullName}
                    </Text>
                  </View>

                  {/* Milk Lbs Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      mode="outlined"
                      dense
                      placeholder="0"
                      value={value}
                      onChangeText={(text) => handleSingleChange(bull.bullId, text)}
                      keyboardType="numeric"
                      style={styles.lbsInput}
                      disabled={saving}
                      outlineColor={COLORS.border}
                      activeOutlineColor={COLORS.primary}
                      theme={{
                        roundness: SIZES.radiusSm,
                        colors: { background: COLORS.surface },
                      }}
                    />
                    <Text style={styles.lbsUnit}>Lbs</Text>
                  </View>
                </View>
              );
            })}

            {bulls.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{strings.noBulls}</Text>
              </View>
            )}
          </ScrollView>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <Button
              title={STRINGS.common.cancel}
              onPress={onClose}
              mode="outlined"
              disabled={saving}
              style={styles.actionBtn}
            />
            <Button
              title={strings.saveAllBtn}
              onPress={handleSave}
              mode="contained"
              loading={saving}
              disabled={saving}
              style={styles.actionBtn}
            />
          </View>

      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.md,
    borderRadius: SIZES.radiusLg,
    maxHeight: '90%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    padding: SPACING.md,
  },
  scrollView: {
    flexShrink: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeBtn: {
    margin: 0,
  },
  quickSetContainer: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.1)',
  },
  quickSetLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
  },
  quickSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickSetInput: {
    flex: 2,
    height: 48,
    fontSize: 14,
    backgroundColor: COLORS.surface,
  },
  applyBtn: {
    flex: 1,
    marginLeft: SPACING.sm,
    minHeight: 48,
    marginVertical: 0,
    borderRadius: SIZES.radiusSm,
  },
  applyBtnLabel: {
    fontSize: 14,
  },
  scrollContent: {
    paddingVertical: SPACING.xs,
  },
  bullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: SIZES.radiusMd,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bullPhoto: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusSm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  bullInfoContainer: {
    flex: 2,
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  bullCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bullNameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  inputContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  lbsInput: {
    width: 80,
    height: 48,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: COLORS.surface,
  },
  lbsUnit: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    width: 30,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});
