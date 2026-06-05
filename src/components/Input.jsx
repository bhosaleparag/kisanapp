import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { COLORS, SIZES, TYPOGRAPHY, SPACING } from '../constants/theme';

/**
 * Farmer-Friendly Premium TextInput
 * Wraps react-native-paper's TextInput with outline styling, custom labels, and Marathi helper errors.
 */
export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error = false,
  errorMessage = '',
  leftIcon,
  rightIcon,
  style = {},
  ...props
}) {
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        error={error}
        style={[styles.input, style]}
        outlineColor={COLORS.border}
        activeOutlineColor={COLORS.primary}
        placeholderTextColor={COLORS.textSecondary}
        textColor={COLORS.textPrimary}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} color={COLORS.textSecondary} /> : null}
        right={rightIcon ? <TextInput.Icon icon={rightIcon} color={COLORS.textSecondary} /> : null}
        theme={{
          roundness: SIZES.radiusMd,
          colors: {
            background: COLORS.surface,
          },
        }}
        {...props}
      />
      {error && errorMessage ? (
        <HelperText type="error" visible={error} style={styles.errorText}>
          {errorMessage}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.xs,
  },
  input: {
    fontSize: TYPOGRAPHY.fontSizeMd, // 18px body font for optimal legibility in daylight
    height: 60, // Premium large field height for easy entry
    backgroundColor: COLORS.surface,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSizeSm,
    fontWeight: 'bold',
    marginTop: 2,
    paddingLeft: SPACING.xs,
  },
});
