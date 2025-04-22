import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Icon } from '../assets/icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import CameraScreen from '../screens/CameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StepTrackingScreen from '../screens/StepTrackingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = ({ theme }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Food Log') {
            iconName = 'book-open';
          } else if (route.name === 'Camera') {
            iconName = 'camera';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} initialParams={{ theme }} />
      <Tab.Screen name="Food Log" component={FoodLogScreen} initialParams={{ theme }} />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        initialParams={{ theme }}
        options={{
          tabBarLabel: 'Add Food',
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ theme }} />
    </Tab.Navigator>
  );
};

const AppNavigator = ({ onboardingComplete, theme }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={onboardingComplete ? 'Main' : 'Onboarding'}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          initialParams={{ theme }}
        />
        <Stack.Screen name="Main">
          {(props) => <MainTabNavigator {...props} theme={theme} />}
        </Stack.Screen>
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          initialParams={{ theme }}
          options={{
            headerShown: true,
            title: 'Settings',
            headerTintColor: theme.colors.text,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="Step Tracking"
          component={StepTrackingScreen}
          initialParams={{ theme }}
          options={{
            headerShown: true,
            title: 'Step Tracking',
            headerTintColor: theme.colors.text,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;