import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SemenBrandListScreen from '../screens/bullinfo/SemenBrandListScreen';
import BullRosterScreen from '../screens/bullinfo/BullRosterScreen';
import CdcbDataSheetScreen from '../screens/bullinfo/CdcbDataSheetScreen';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function BullInfoNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SemenBrandList"
        component={SemenBrandListScreen}
        options={{ headerShown: false }} // Tab navigator header will show
      />
      <Stack.Screen
        name="BullRoster"
        component={BullRosterScreen}
        options={{ headerShown: false }} // Custom header with back button on screen
      />
      <Stack.Screen
        name="CdcbDataSheet"
        component={CdcbDataSheetScreen}
        options={{ headerShown: false }} // Custom header with back button on screen
      />
    </Stack.Navigator>
  );
}
