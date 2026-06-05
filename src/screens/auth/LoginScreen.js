import React, { useState } from 'react';
import { StyleSheet, View, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { authSchema } from '../../utils/schemas';
import { auth as firebaseAuth } from '../../services/firebase';
import { signInWithPhoneNumber } from 'firebase/auth';
import { useAppStore } from '../../store/useAppStore';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen() {
  const setUser = useAppStore((state) => state.setUser);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneVal, setPhoneVal] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      phone: '',
    },
  });

  // Callback: Send SMS OTP Trigger
  const handleRequestOtp = async (data) => {
    setLoading(true);
    setPhoneVal(data.phone);

    try {
      // Enable app verification bypass for whitelisted testing numbers in development
      firebaseAuth.settings.appVerificationDisabledForTesting = true;

      // Dummy ApplicationVerifier to satisfy Web SDK's required appVerifier parameter in React Native
      const dummyVerifier = {
        type: 'recaptcha',
        verify: () => Promise.resolve(''),
        _reset: () => { },
      };

      const formattedPhone = `+91${data.phone}`;
      const confirmation = await signInWithPhoneNumber(
        firebaseAuth,
        formattedPhone,
        dummyVerifier
      );
      setConfirmationResult(confirmation);
      setOtpSent(true);
      Alert.alert(STRINGS.common.appName, STRINGS.auth.otpSent);
    } catch (error) {
      console.error('[KisanApp Auth] OTP request failure:', error);
      Alert.alert(
        STRINGS.common.appName,
        'ओटीपी पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा किंवा चाचणीसाठी मॉक मोड वापरा.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify Code Trigger
  const handleVerifyOtp = async () => {
    if (!/^[0-9]{6}$/.test(otpCode)) {
      Alert.alert(STRINGS.common.appName, 'कृपया अचूक ६ अंकी ओटीपी कोड प्रविष्ट करा.');
      return;
    }

    setLoading(true);

    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(otpCode);
        // AppNavigator's onAuthStateChanged listener automatically hydra-sets the session
        setUser({
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
        });
      } else {
        throw new Error('No Firebase confirmation context found.');
      }
    } catch (error) {
      console.error('[KisanApp Auth] Verification failure:', error);
      Alert.alert(STRINGS.common.appName, 'ओटीपी पडताळणी अयशस्वी. कृपया अचूक कोड टाका.');
    } finally {
      setLoading(false);
    }
  };

  // Back action to change phone number
  const handleBackToPhone = () => {
    setOtpSent(false);
    setOtpCode('');
    setConfirmationResult(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.authCard}>
          {/* Logo Card Section */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../../assets/app-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.welcomeText}>{STRINGS.common.welcome}</Text>
          <Text style={styles.appNameText}>{STRINGS.common.appName}</Text>

          {!otpSent ? (
            // Stage 1: Phone input form
            <View style={styles.formContainer}>
              <Text style={styles.instructionText}>{STRINGS.auth.enterPhone}</Text>

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={STRINGS.common.phone}
                    placeholder="उदा. ९८७६५४३२१०"
                    keyboardType="numeric"
                    maxLength={10}
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.phone}
                    errorMessage={errors.phone?.message}
                    left={<IconButton icon="phone" size={24} style={styles.inputIcon} />}
                  />
                )}
              />

              <Button
                title="ओटीपी (OTP) पाठवा"
                onPress={handleSubmit(handleRequestOtp)}
                style={styles.authButton}
                disabled={loading}
              />
            </View>
          ) : (
            // Stage 2: OTP verification form
            <View style={styles.formContainer}>
              <View style={styles.phoneHeaderRow}>
                <Text style={styles.otpSentText}>
                  नंबर: +९१ {phoneVal}
                </Text>
                <IconButton
                  icon="pencil"
                  size={18}
                  iconColor={COLORS.primary}
                  onPress={handleBackToPhone}
                  style={styles.editButton}
                />
              </View>

              <Text style={styles.instructionText}>{STRINGS.auth.verifyOtp}</Text>

              <Input
                label="६-अंकी ओटीपी (OTP) प्रविष्ट करा"
                placeholder="उदा. १२३४५६"
                keyboardType="numeric"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
                left={<IconButton icon="lock" size={24} style={styles.inputIcon} />}
              />

              <Button
                title={STRINGS.auth.verifyOtp}
                onPress={handleVerifyOtp}
                style={styles.authButton}
                disabled={loading}
              />

              <Button
                title="मागे जा"
                mode="outlined"
                onPress={handleBackToPhone}
                style={styles.backButton}
                disabled={loading}
              />
            </View>
          )}
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
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  logoWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSizeMd,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  appNameText: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '900',
    marginBottom: SPACING.lg,
  },
  formContainer: {
    width: '100%',
    marginTop: SPACING.xs,
  },
  instructionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  inputIcon: {
    margin: 0,
  },
  authButton: {
    marginTop: SPACING.md,
    height: 54,
  },
  backButton: {
    marginTop: SPACING.sm,
    height: 54,
  },
  phoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusMd,
    alignSelf: 'center',
    marginBottom: SPACING.md,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  otpSentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  editButton: {
    margin: 0,
    marginLeft: 4,
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
