import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAppStore } from '../store/useAppStore';
import { getProfile } from '../services/profileService';

// Import navigators and screens
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);

  // Subscribe to Firebase Auth state updates
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getProfile(firebaseUser.uid);
        if (profile) {
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser]);

  const isLoggedIn = !!user; 

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
