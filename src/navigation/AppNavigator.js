import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import CameraScreen from '../screens/CameraScreen';
import StepTrackingScreen from '../screens/StepTrackingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import context
import { UserContext } from '../context/UserContext';

// Create navigation components
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
const TabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Food Log') {
            iconName = 'book';
          } else if (route.name === 'Camera') {
            iconName = 'camera';
          } else if (route.name === 'Activity') {
            iconName = 'activity';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Food Log" component={FoodLogScreen} />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{
          tabBarStyle: { display: 'none' }, // Hide tab bar on camera screen
        }}
      />
      <Tab.Screen name="Activity" component={StepTrackingScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Main navigation component
const AppNavigator = ({ isDarkMode, toggleTheme }) => {
  const { userProfile, isLoading } = useContext(UserContext);
  const theme = useTheme();
  
  // If still loading user data, return null or a loading screen
  if (isLoading) return null;
  
  // Determine initial route based on whether user has completed onboarding
  const hasCompletedOnboarding = userProfile !== null;
  
  return (
    <Stack.Navigator
      initialRouteName={hasCompletedOnboarding ? 'Main' : 'Onboarding'}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Your Profile',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;