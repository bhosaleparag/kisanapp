import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { onboardingSchema } from '../../utils/schemas';
import { useAppStore } from '../../store/useAppStore';
import Input from '../../components/Input';
import Button from '../../components/Button';

import { getProfile, saveProfile } from '../../services/profileService';
import { signInWithGoogle, signOutUser } from '../../services/authService';

export default function LoginScreen() {
  const setUser = useAppStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const handleGoogleLogin = async (data) => {
    setLoading(true);
    try {
      // 1. Trigger Google Sign-in flow (mock or real based on env)
      const result = await signInWithGoogle(data.name, data.phone);
      const uid = result.user.uid;

      // 2. Fetch profile from Firestore
      let profile = await getProfile(uid);

      if (!profile) {
        // User does not exist, provision user document with entered details
        const baseProfile = {
          uid,
          phone: data.phone,
          name: data.name,
          role: 'farmer',
          village: '',
          taluka: '',
          district: '',
          pincode: '',
          farmDetails: {
            totalArea: '',
            cultivatedArea: '',
            mainCrop: '',
          },
          stats: {
            animalsCount: 0,
            dailyMilkYield: 0,
          },
          rating: 5.0,
          isBlocked: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save profile to database
        profile = await saveProfile(uid, baseProfile);
      } else {
        // Returning user: Check active/block status
        if (profile.isBlocked) {
          await signOutUser();
          Alert.alert(STRINGS.common.appName, STRINGS.auth.userBlocked);
          setLoading(false);
          return;
        }
        if (profile.isActive === false) {
          await signOutUser();
          Alert.alert(STRINGS.common.appName, STRINGS.auth.userInactive);
          setLoading(false);
          return;
        }
      }

      // Set global session user
      setUser(profile);
    } catch (error) {
      console.error('[KisanApp Auth] Google Sign-in failure:', error);
      Alert.alert(STRINGS.common.appName, STRINGS.auth.googleError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        {/* App Title Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/app-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appNameText}>{STRINGS.common.appName}</Text>
          <Text style={styles.taglineText}>{STRINGS.splash.tagline}</Text>
        </View>


        {/* Onboarding Form */}
        <View style={styles.authCard}>
          <Text style={styles.welcomeText}>{STRINGS.auth.onboardingWelcome}</Text>

          <View style={styles.formContainer}>
            {/* Name Input */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.auth.nameLabel}
                  placeholder={STRINGS.auth.namePlaceholder}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.name}
                  errorMessage={errors.name?.message}
                  leftIcon="account"
                />
              )}
            />

            {/* Mobile Number Input */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={STRINGS.auth.phoneLabel}
                  placeholder={STRINGS.auth.phonePlaceholder}
                  keyboardType="numeric"
                  maxLength={10}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.phone}
                  errorMessage={errors.phone?.message}
                  leftIcon="phone"
                />
              )}
            />

            {/* Google Login button */}
            <Button
              title={STRINGS.auth.googleLogin}
              onPress={handleSubmit(handleGoogleLogin)}
              style={styles.authButton}
              disabled={loading}
              icon="google"
            />
          </View>
        </View>
      </ScrollView>

      {/* Full screen loading backdrop for clean blocking */}
      {loading && (
        <View style={styles.loadingBackdrop}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{STRINGS.common.loading}</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: SPACING.xs,
  },
  appNameText: {
    fontSize: TYPOGRAPHY.fontSizeXl,
    color: COLORS.primary,
    fontWeight: '900',
    lineHeight: TYPOGRAPHY.lineHeightXl,
  },
  taglineText: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  authCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SPACING.lg,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSizeLg,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  formContainer: {
    width: '100%',
  },
  authButton: {
    marginTop: SPACING.md,
    height: 56,
  },
  loadingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
});
