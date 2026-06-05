// High-contrast, farmer-friendly theme configuration

export const COLORS = {
  // Primary brand color (represents growth, safety, farming)
  primary: '#1B5E20', // Forest Green
  primaryLight: '#E8F5E9', // Light green tint
  primaryDark: '#0D3C12', // Deep forest green
  
  // Secondary brand color (represents earth, warmth, reliability)
  secondary: '#8D6E63', // Clay brown
  secondaryLight: '#EFEBE9',
  
  // Interactive UI colors
  accent: '#FFB300', // Warning/Alert Gold (high contrast for status)
  accentLight: '#FFF8E1',
  
  // Neutral colors (slate/charcoal instead of pure black for better legibility)
  textPrimary: '#1E293B', // Slate 800 (very dark)
  textSecondary: '#64748B', // Slate 500 (readable info text)
  background: '#F8FAFC', // Slate 50 (soft white background)
  surface: '#FFFFFF', // Pure White for cards/containers
  border: '#E2E8F0', // Slate 200 (subtle dividers)
  
  // Standard semantic feedback colors
  error: '#D32F2F', // High contrast error red
  errorLight: '#FFEBEE',
  success: '#2E7D32',
  warning: '#F57C00',
  info: '#0288D1',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 36,
};

export const SIZES = {
  // Minimum touch target sizes for agricultural/field environments
  minTouchTarget: 48,
  largeTouchTarget: 60,
  
  // Border Radii
  radiusSm: 6,
  radiusMd: 12,
  radiusLg: 16,
  radiusRound: 999,
};

export const TYPOGRAPHY = {
  // Marathi and Hindi fonts require slightly larger font sizes and higher line heights 
  // than English for optimal readability.
  fontSizeXs: 13,
  fontSizeSm: 15,
  fontSizeMd: 18, // Standard readable body text
  fontSizeLg: 22,
  fontSizeXl: 28,
  fontSizeXxl: 34,
  
  lineHeightXs: 18,
  lineHeightSm: 22,
  lineHeightMd: 26,
  lineHeightLg: 32,
  lineHeightXl: 38,
};
