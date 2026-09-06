import React from 'react';
import { StyleSheet, View, Image, ScrollView, Alert, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import * as ImagePickerSDK from 'expo-image-picker';
import { COLORS, SIZES, TYPOGRAPHY, SPACING } from '../constants/theme';
import { STRINGS } from '../constants/strings';

/**
 * MultiImagePicker Component (Upload Min-1, Max-5 Photos)
 * Enables farmers to attach 1 to 5 photos using camera or gallery.
 */
export default function MultiImagePicker({ images = [], onImagesChange }) {
  const maxPhotos = 5;

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

  const takePhoto = async () => {
    if (images.length >= maxPhotos) {
      Alert.alert(STRINGS.common.appName, STRINGS.fodder.maxPhotoReq);
      return;
    }
    const hasPermission = await requestCameraAccess();
    if (!hasPermission) return;

    try {
      const result = await ImagePickerSDK.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImagesChange([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error launching camera:', error);
    }
  };

  const selectPhoto = async () => {
    if (images.length >= maxPhotos) {
      Alert.alert(STRINGS.common.appName, STRINGS.fodder.maxPhotoReq);
      return;
    }
    const hasPermission = await requestLibraryAccess();
    if (!hasPermission) return;

    try {
      const result = await ImagePickerSDK.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImagesChange([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
    }
  };

  const removePhoto = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    onImagesChange(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{STRINGS.fodder.photosLabel}</Text>
      <Text style={styles.subLabel}>
        {images.length} / {maxPhotos} {STRINGS.fodder.photoCountLabel}
      </Text>

      {/* Horizontal thumbnail list */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {images.map((uri, idx) => (
          <View key={idx} style={styles.thumbnailWrapper}>
            <Image source={{ uri }} style={styles.thumbnail} />
            <Pressable
              style={styles.deleteBadge}
              onPress={() => removePhoto(idx)}
              hitSlop={10}
            >
              <IconButton icon="close" size={14} iconColor="#FFFFFF" style={{ margin: 0 }} />
            </Pressable>
          </View>
        ))}

        {images.length < maxPhotos && (
          <View style={styles.actionRow}>
            <Pressable style={styles.addBtn} onPress={takePhoto}>
              <IconButton icon="camera" size={24} iconColor={COLORS.primary} />
              <Text style={styles.btnText}>{STRINGS.common.camera}</Text>
            </Pressable>
            <Pressable style={styles.addBtn} onPress={selectPhoto}>
              <IconButton icon="image-multiple" size={24} iconColor={COLORS.primary} />
              <Text style={styles.btnText}>{STRINGS.common.gallery}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  subLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  scroll: {
    flexDirection: 'row',
  },
  thumbnailWrapper: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  thumbnail: {
    width: 85,
    height: 85,
    borderRadius: SIZES.radiusMd,
    backgroundColor: '#F0F0F0',
  },
  deleteBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  actionRow: {
    flexDirection: 'row',
  },
  addBtn: {
    width: 85,
    height: 85,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    backgroundColor: '#F9FBF9',
  },
  btnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: -4,
  },
});
