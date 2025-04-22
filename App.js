import React, { useState, useEffect } from 'react';
import { View, StatusBar, useColorScheme, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getAppSettings, saveAppSettings } from './src/services/StorageService';
import { lightTheme, darkTheme } from './src/theme/colors';
import { Icon } from './src/assets/icons';
import { UserProvider } from './src/context/UserContext';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import FoodLogScreen from './src/screens/FoodLogScreen';
import CameraScreen from './src/screens/CameraScreen';
import StepTrackingScreen from './src/screens/StepTrackingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main app component
export default function App() {
  // Get device color scheme
  const deviceColorScheme = useColorScheme();
  
  // State for theme and onboarding
  const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // Effect to load settings on app start
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load app settings
        const settings = await getAppSettings();
        
        // Set theme preference from settings if available
        if (settings && settings.theme) {
          setIsDarkMode(settings.theme === 'dark');
        }
        
        // Check if onboarding is complete
        if (settings && settings.onboardingComplete) {
          setOnboardingComplete(true);
        }
      } catch (error) {
        console.error('Error loading app settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Function to toggle theme
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      
      // Save theme preference
      const settings = await getAppSettings() || {};
      settings.theme = newTheme ? 'dark' : 'light';
      await saveAppSettings(settings);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  // Function to complete onboarding
  const completeOnboarding = async () => {
    try {
      setOnboardingComplete(true);
      
      // Save onboarding status
      const settings = await getAppSettings() || {};
      settings.onboardingComplete = true;
      await saveAppSettings(settings);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };
  
  // Current theme
  const theme = isDarkMode ? darkTheme : lightTheme;
  theme.isDark = isDarkMode;
  theme.toggleTheme = toggleTheme;
  
  // Loading screen
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }
  
  // Main app structure
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <UserProvider>
        <NavigationContainer
          theme={{
            colors: {
              background: theme.colors.background,
              card: theme.colors.surface,
              text: theme.colors.text,
              border: theme.colors.border,
              primary: theme.colors.primary,
            },
            dark: isDarkMode,
          }}
        >
          {!onboardingComplete ? (
            // Onboarding flow
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Onboarding">
                {(props) => (
                  <OnboardingScreen
                    {...props}
                    theme={theme}
                    onComplete={completeOnboarding}
                  />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          ) : (
            // Main app flow
            <Stack.Navigator
              initialRouteName="MainTabs"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
              }}
            >
              <Stack.Screen name="MainTabs">
                {() => (
                  <Tab.Navigator
                    screenOptions={({ route }) => ({
                      headerShown: false,
                      tabBarActiveTintColor: theme.colors.primary,
                      tabBarInactiveTintColor: theme.colors.tertiaryText,
                      tabBarStyle: {
                        backgroundColor: theme.colors.surface,
                        borderTopColor: theme.colors.border,
                        paddingTop: 5,
                        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                        height: Platform.OS === 'ios' ? 85 : 65,
                      },
                      tabBarIcon: ({ color, size }) => {
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
                        
                        return <Icon name={iconName} size={size} color={color} />;
                      },
                    })}
                  >
                    <Tab.Screen name="Home">
                      {(props) => <HomeScreen {...props} theme={theme} />}
                    </Tab.Screen>
                    <Tab.Screen name="Food Log">
                      {(props) => <FoodLogScreen {...props} theme={theme} />}
                    </Tab.Screen>
                    <Tab.Screen name="Camera">
                      {(props) => <CameraScreen {...props} theme={theme} />}
                    </Tab.Screen>
                    <Tab.Screen name="Activity">
                      {(props) => <StepTrackingScreen {...props} theme={theme} />}
                    </Tab.Screen>
                    <Tab.Screen name="Settings">
                      {(props) => <SettingsScreen {...props} theme={theme} />}
                    </Tab.Screen>
                  </Tab.Navigator>
                )}
              </Stack.Screen>
              
              <Stack.Screen
                name="Profile"
                options={{
                  headerShown: true,
                  headerTitle: 'Edit Profile',
                  headerStyle: {
                    backgroundColor: theme.colors.surface,
                  },
                  headerTintColor: theme.colors.text,
                }}
              >
                {(props) => <ProfileScreen {...props} theme={theme} />}
              </Stack.Screen>
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}