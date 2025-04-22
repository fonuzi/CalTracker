import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserContext } from '../context/UserContext';
import { Icon } from '../assets/icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import CameraScreen from '../screens/CameraScreen';
import StepTrackingScreen from '../screens/StepTrackingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Create navigation stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
const TabNavigator = ({ theme }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Food Log"
        component={FoodLogScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Add Food"
        component={CameraScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="camera" size={size} color={color} />
          ),
          headerShown: false,
          tabBarLabel: 'Add Food',
        }}
      />
      <Tab.Screen
        name="Activity"
        component={StepTrackingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="activity" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = ({ theme }) => {
  const { userProfile, isLoading } = useContext(UserContext);
  
  // Show loading screen while checking if user is logged in
  if (isLoading) {
    return null; // You could create a loading screen component
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      >
        {!userProfile ? (
          // Onboarding flow
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Main app flow
          <>
            <Stack.Screen
              name="Main"
              options={{ headerShown: false }}
            >
              {props => <TabNavigator {...props} theme={theme} />}
            </Stack.Screen>
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;