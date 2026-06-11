import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut } from '@react-native-firebase/auth';
import { auth } from '../services/firebase';
import { useAppStore } from '../store/useAppStore';
import { getProfile } from '../services/profileService';
import { STRINGS } from '../constants/strings';

// Import navigators and screens
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import SplashScreen from '../screens/shared/SplashScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);

  // Subscribe to Firebase Auth state updates
  useEffect(() => {
    if (!auth) {
      console.warn('[KisanApp AppNavigator] Firebase Auth is not initialized. Bypassing state checks.');
      setAuthResolved(true);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            const profile = await getProfile(firebaseUser.uid);
            if (profile) {
              // Check active/block status on startup
              if (profile.isBlocked) {
                await signOut(auth);
                setUser(null);
                Alert.alert(STRINGS.common.appName, STRINGS.auth.userBlocked);
                return;
              }
              if (profile.isActive === false) {
                await signOut(auth);
                setUser(null);
                Alert.alert(STRINGS.common.appName, STRINGS.auth.userInactive);
                return;
              }
              setUser(profile);
            } else {
              // Profile document doesn't exist, set base profile to trigger warning banner
              setUser({
                uid: firebaseUser.uid,
                phone: firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace('+91', '') : '',
                name: '',
                role: '',
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
              });
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('[KisanApp AppNavigator] Failed to resolve auth or profile:', error);
          setUser(null);
        } finally {
          setAuthResolved(true);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error('[KisanApp AppNavigator] Failed to subscribe to auth state updates:', error);
      setAuthResolved(true);
    }
  }, [setUser]);

  const isLoggedIn = !!user;

  if (isInitializing) {
    return (
      <SplashScreen
        authResolved={authResolved}
        onFinish={() => setIsInitializing(false)}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Main flow with bottom tabs and profile stack screen
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: 'माझी प्रोफाईल',
                headerStyle: { backgroundColor: '#1B5E20' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' }
              }}
            />
          </>
        ) : (
          // Auth flow
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
