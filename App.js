import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import { darkTheme } from './src/theme/colors';

// Main app component wrapped with providers
export default function App() {
  return (
    <UserProvider>
      <StatusBar style="light" />
      <AppNavigator theme={darkTheme} />
    </UserProvider>
  );
}