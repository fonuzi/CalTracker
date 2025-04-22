import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserContext } from '../context/UserContext';
import { getAppSettings, saveAppSettings } from '../services/StorageService';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import CameraScreen from '../screens/CameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import StepTrackingScreen from '../screens/StepTrackingScreen';

// Components
import { Icon } from '../assets/icons';
import DarkModeToggle from '../components/DarkModeToggle';

// Theme
import { darkTheme, lightTheme } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
const MainTabs = ({ theme }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} theme={theme} />}
      </Tab.Screen>
      
      <Tab.Screen
        name="Food Log"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" size={size} color={color} />
          ),
        }}
      >
        {(props) => <FoodLogScreen {...props} theme={theme} />}
      </Tab.Screen>
      
      <Tab.Screen
        name="Camera"
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.cameraTabIcon}>
              <Icon name="camera" size={size} color="#FFFFFF" />
            </View>
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 10, marginTop: -5 }}>Add Food</Text>
          ),
        }}
      >
        {(props) => <CameraScreen {...props} theme={theme} />}
      </Tab.Screen>
      
      <Tab.Screen
        name="Steps"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="activity" size={size} color={color} />
          ),
        }}
      >
        {(props) => <StepTrackingScreen {...props} theme={theme} />}
      </Tab.Screen>
      
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      >
        {(props) => <ProfileScreen {...props} theme={theme} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// App navigator component
const AppNavigator = () => {
  const { onboarded, loading } = useContext(UserContext);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  // Get the current theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Load app settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getAppSettings();
        setIsDarkMode(settings.darkMode);
      } catch (error) {
        console.error('Error loading app settings:', error);
      } finally {
        setSettingsLoaded(true);
      }
    };
    
    loadSettings();
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      await saveAppSettings({ darkMode: newDarkMode, notifications: true });
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  };
  
  // Custom header right component with dark mode toggle
  const HeaderRight = () => (
    <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} theme={theme} />
  );
  
  // Loading state
  if (loading || !settingsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading...
        </Text>
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => <HeaderRight />,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        {!onboarded ? (
          <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
            {(props) => <OnboardingScreen {...props} theme={theme} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              options={{ headerShown: false }}
            >
              {() => <MainTabs theme={theme} />}
            </Stack.Screen>
            
            <Stack.Screen name="Settings">
              {(props) => <SettingsScreen {...props} theme={theme} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />}
            </Stack.Screen>
            
            <Stack.Screen
              name="Step Tracking"
              options={{
                title: 'Step Tracking',
              }}
            >
              {(props) => <StepTrackingScreen {...props} theme={theme} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  cameraTabIcon: {
    backgroundColor: '#34C759',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default AppNavigator;