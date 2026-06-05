import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Theme and Navigation imports
import { COLORS } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';

// Firebase compilation & initialization check
import { auth, db, isMock } from './src/services/firebase';
console.log('[KisanApp Firebase] Core modules compiled and loaded successfully! Mock Mode:', isMock);


// Create a cost-efficient React Query Client
// Optimized specifically to minimize Firebase Firestore read charges
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes (no redundant reads when clicking tabs/back)
      staleTime: 1000 * 60 * 5,
      // Keep cached items in memory for 10 minutes before garbage collection
      gcTime: 1000 * 60 * 10,
      // Disable refetching on window focus (major cost saver when switching apps)
      refetchOnWindowFocus: false,
      // Retain previous screen data during background refetches (smooth paginated loading)
      placeholderData: (previousData) => previousData,
    },
  },
});

// Configure React Native Paper to use our high-contrast farmer-friendly theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.accent,
    error: COLORS.error,
    background: COLORS.background,
    surface: COLORS.surface,
    onPrimary: '#FFFFFF',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <StatusBar style="light" backgroundColor={COLORS.primary} />
          <AppNavigator />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

