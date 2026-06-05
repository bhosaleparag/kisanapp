import React from 'react';
import { StyleSheet, View, Image, Pressable, Alert } from 'react-native';
import { Card, Text, Avatar, IconButton } from 'react-native-paper';
import * as ImagePickerSDK from 'expo-image-picker';
import { COLORS, SIZES, TYPOGRAPHY, SPACING } from '../constants/theme';
import { STRINGS } from '../constants/strings';

/**
 * Premium Farmer-Focused ImagePicker Component
 * Supports direct camera capture and gallery browsing with optimized square compression.
 */
export default function ImagePicker({ imageUri, onImageSelected }) {
  // Safe permission checking & request
  const requestCameraAccess = async () => {
    const { status } = await ImagePickerSDK.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        STRINGS.common.appName,
        STRINGS.common.permissionDenied
      );
      return false;
    }
    return true;
  };

  const requestLibraryAccess = async () => {
    const { status } = await ImagePickerSDK.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        STRINGS.common.appName,
        STRINGS.common.permissionDenied
      );
      return false;
    }
    return true;
  };

  // Launch Camera capture
  const takePhoto = async () => {
    const hasPermission = await requestCameraAccess();
    if (!hasPermission) return;

    try {
      const result = await ImagePickerSDK.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square is optimal for marketplace crop/animal logs
        quality: 0.7,   // High-contrast compression to keep data usage low in rural networks
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  // Launch Gallery selector
  const selectPhoto = async () => {
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
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
    }
  };

  // Discard/Remove active image
  const removePhoto = () => {
    onImageSelected(null);
  };

  return (
    <Card style={styles.card} mode="outlined">
      {imageUri ? (
        // Preview Frame
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <IconButton
            icon="close-circle"
            size={36}
            iconColor={COLORS.error}
            style={styles.deleteButton}
            onPress={removePhoto}
            accessibilityLabel={STRINGS.common.removePhoto}
          />
        </View>
      ) : (
        // Action Chooser Frame
        <View style={styles.chooserContainer}>
          <Text style={styles.title}>{STRINGS.marketplace.uploadImage}</Text>
          <View style={styles.buttonRow}>
            {/* Camera Trigger */}
            <Pressable
              style={({ pressed }) => [
                styles.actionBox,
                pressed && styles.pressed,
              ]}
              onPress={takePhoto}
            >
              <Avatar.Icon
                size={64}
                icon="camera"
                color={COLORS.primary}
                style={styles.avatar}
              />
              <Text style={styles.actionLabel}>{STRINGS.common.camera}</Text>
            </Pressable>

            {/* Gallery Trigger */}
            <Pressable
              style={({ pressed }) => [
                styles.actionBox,
                pressed && styles.pressed,
              ]}
              onPress={selectPhoto}
            >
              <Avatar.Icon
                size={64}
                icon="image-multiple"
                color={COLORS.primary}
                style={styles.avatar}
              />
              <Text style={styles.actionLabel}>{STRINGS.common.gallery}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: SIZES.radiusLg,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
    width: '100%',
  },
  previewContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  chooserContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionBox: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    width: '45%',
  },
  pressed: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.9,
  },
  avatar: {
    backgroundColor: COLORS.primaryLight,
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
});
