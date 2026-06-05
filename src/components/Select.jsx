import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, FlatList, Dimensions, Platform } from 'react-native';
import { TextInput, HelperText, Text, Divider, IconButton } from 'react-native-paper';
import { COLORS, SIZES, TYPOGRAPHY, SPACING } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Premium Dropdown / Select Component for Agricultural/Field Environments
 * Uses a slide-up bottom sheet modal instead of native dropdowns, ensuring excellent
 * visibility, readability, and a highly customizable search interface.
 */
export default function Select({
  label,
  selectedValue,
  onValueChange,
  options = [],
  placeholder = 'निवडा...',
  error = false,
  errorMessage = '',
  disabled = false,
  searchable = true,
  searchPlaceholder = 'शोधण्यासाठी येथे टाईप करा...',
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle open picker
  const handleOpen = () => {
    if (disabled) return;
    setSearchQuery('');
    setModalVisible(true);
  };

  // Filtered options based on user search query
  const filteredOptions = options.filter((option) => {
    const text = typeof option === 'string' ? option : option.label || '';
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Render individual option item in the list
  const renderItem = ({ item }) => {
    const value = typeof item === 'string' ? item : item.value;
    const labelText = typeof item === 'string' ? item : item.label;
    const isSelected = value === selectedValue;

    return (
      <TouchableOpacity
        style={[styles.optionItem, isSelected && styles.optionItemActive]}
        onPress={() => {
          onValueChange(value);
          setModalVisible(false);
        }}
      >
        <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
          {labelText}
        </Text>
        {isSelected && (
          <IconButton icon="check-circle" iconColor={COLORS.primary} size={22} style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOpen} activeOpacity={disabled ? 1 : 0.7} style={styles.triggerWrapper}>
        <TextInput
          mode="outlined"
          label={label}
          value={selectedValue ? (typeof options.find(o => (typeof o === 'string' ? o === selectedValue : o.value === selectedValue)) === 'string' ? selectedValue : (options.find(o => o.value === selectedValue)?.label || selectedValue)) : ''}
          placeholder={placeholder}
          editable={false}
          error={error}
          disabled={disabled}
          pointerEvents="none" // Prevent physical keyboard trigger
          style={styles.triggerInput}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
          textColor={COLORS.textPrimary}
          theme={{
            roundness: SIZES.radiusMd,
            colors: {
              background: COLORS.surface,
            },
          }}
          right={
            <TextInput.Icon
              icon="chevron-down"
              color={disabled ? COLORS.textSecondary : COLORS.primary}
              onPress={handleOpen}
            />
          }
        />
      </TouchableOpacity>

      {error && errorMessage ? (
        <HelperText type="error" visible={error} style={styles.errorText}>
          {errorMessage}
        </HelperText>
      ) : null}

      {/* Bottom Sheet Dropdown Overlay */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.sheetContainer} onStartShouldSetResponder={() => true}>
            
            {/* Sheet Header Drag Indicator & Title */}
            <View style={styles.sheetHeader}>
              <View style={styles.dragIndicator} />
              <View style={styles.headerTitleRow}>
                <Text style={styles.sheetTitle}>{label} निवडा</Text>
                <IconButton
                  icon="close"
                  size={22}
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                />
              </View>
            </View>

            {/* Search Input segment */}
            {searchable && (
              <View style={styles.searchWrapper}>
                <TextInput
                  mode="outlined"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                  textColor={COLORS.textPrimary}
                  left={<TextInput.Icon icon="magnify" color={COLORS.textSecondary} />}
                  right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : null}
                  theme={{
                    roundness: SIZES.radiusSm,
                  }}
                />
              </View>
            )}

            {/* Scrollable list options */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => (typeof item === 'string' ? item : item.value || index.toString())}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <Divider style={styles.divider} />}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>कोणतेही पर्याय सापडले नाहीत</Text>
                </View>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.xs,
  },
  triggerWrapper: {
    width: '100%',
  },
  triggerInput: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    height: 60,
    backgroundColor: COLORS.surface,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    fontWeight: 'bold',
    marginTop: 2,
    paddingLeft: SPACING.xs,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: SIZES.radiusLg * 1.5,
    borderTopRightRadius: SIZES.radiusLg * 1.5,
    maxHeight: SCREEN_HEIGHT * 0.75,
    minHeight: SCREEN_HEIGHT * 0.4,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: SPACING.md,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: SPACING.xs,
  },
  sheetTitle: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeButton: {
    margin: 0,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  searchInput: {
    height: 50,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.xs,
  },
  optionItemActive: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusSm,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  checkIcon: {
    margin: 0,
  },
  divider: {
    backgroundColor: COLORS.border,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
