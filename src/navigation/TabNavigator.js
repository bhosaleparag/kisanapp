import React from 'react';
import { Image, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { STRINGS } from '../constants/strings';
// import HomeScreen from '../screens/shared/HomeScreen';
// import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
// import ServicesScreen from '../screens/services/ServicesScreen';
import VideosScreen from '../screens/videos/VideosScreen';
// import CowshedScreen from '../screens/cowshed/CowshedScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Marketplace':
              iconName = 'storefront';
              break;
            case 'Services':
              iconName = 'tractor';
              break;
            case 'Videos':
              iconName = 'play-box';
              break;
            case 'Cowshed':
              iconName = 'cow';
              break;
            default:
              iconName = 'help-circle';
          }

          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          display: 'none', // Hide bottom tab bar as we only have the video section
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.sm,
          paddingTop: SPACING.xs,
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontSize: 13, // Larger readable font size for Marathi text
          fontWeight: 'bold',
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
          elevation: 4,
          shadowOpacity: 0.15,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontSize: TYPOGRAPHY.fontSizeLg,
          fontWeight: 'bold',
        },
        // Premium brand logo on left of header for all screens
        headerLeft: () => (
          <Image
            source={require('../../assets/app-logo.png')}
            style={{
              width: 70,
              height: 70,
              marginLeft: SPACING.md,
            }}
            resizeMode="contain"
          />
        ),
        // Unified profile trigger on right of header for all screens
        headerRight: () => (
          <IconButton
            icon="account-circle"
            iconColor="#FFFFFF"
            size={28}
            onPress={() => {
              navigation.navigate('Profile');
            }}
          />
        ),
      })}
    >
      {/*
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: STRINGS.nav.home,
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          title: STRINGS.nav.marketplace,
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          title: STRINGS.nav.services,
        }}
      />
      */}
      <Tab.Screen
        name="Videos"
        component={VideosScreen}
        options={{
          title: STRINGS.nav.videos,
        }}
      />
      {/*
      <Tab.Screen
        name="Cowshed"
        component={CowshedScreen}
        options={{
          title: STRINGS.nav.cowshed,
        }}
      />
      */}
    </Tab.Navigator>
  );
}
