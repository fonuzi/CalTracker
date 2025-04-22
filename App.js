import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import custom components and navigation
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { darkTheme, lightTheme } from './src/theme/colors';

// Main app component
export default function App() {
  // State for theme and initial loading
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference on app start
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem('theme_preference');
        if (themePreference !== null) {
          setIsDarkMode(themePreference === 'dark');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Toggle between dark and light mode
  const toggleTheme = async () => {
    try {
      const newThemeValue = !isDarkMode;
      setIsDarkMode(newThemeValue);
      await AsyncStorage.setItem('theme_preference', newThemeValue ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // If still loading, you could show a splash screen or loading indicator
  if (isLoading) {
    return null; // Or a loading component
  }

  // Use the appropriate theme based on isDarkMode
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <UserProvider>
          <NavigationContainer theme={theme}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <AppNavigator isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </NavigationContainer>
        </UserProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}