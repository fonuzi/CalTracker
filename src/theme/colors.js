import { DefaultTheme } from 'react-native-paper';

// Dark theme colors for the app
export const darkTheme = {
  ...DefaultTheme,
  dark: true,
  // Custom colors object for React Navigation
  colors: {
    ...DefaultTheme.colors,
    primary: '#6C63FF', // Main purple accent
    accent: '#64DFDF', // Teal accent
    background: '#121212', // Primary background
    surface: '#1E1E1E', // Cards and surfaces
    text: '#FFFFFF', // Regular text
    secondaryText: '#B1B1B1', // Secondary text
    disabled: '#757575', // Disabled elements
    placeholder: '#9E9E9E', // Placeholder text
    onSurface: '#FFFFFF', // Text on surface
    notification: '#FF453A', // Notification badge
    error: '#FF453A', // Error state
    success: '#34C759', // Success state
    warning: '#FCBF49', // Warning state
    // Custom theme colors not in DefaultTheme
    card: '#1E1E1E',
    border: '#2C2C2C', 
    protein: '#5E60CE', // Protein color 
    carbs: '#64DFDF', // Carbs color
    fat: '#FCBF49', // Fat color
    dark: '#0D0D0D', // Extra dark for contrasts
    header: '#1A1A1A', // Header background
    drawerActiveBackground: 'rgba(108, 99, 255, 0.15)', // Active drawer item background
  },
};

// Light theme colors - kept for potential future toggle
export const lightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6C63FF',
    accent: '#64DFDF',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#000000',
    secondaryText: '#6B6B6B',
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
    onSurface: '#000000',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    // Custom theme colors not in DefaultTheme
    card: '#FFFFFF',
    border: '#E0E0E0',
    protein: '#5E60CE',
    carbs: '#64DFDF',
    fat: '#FCBF49',
    dark: '#FFFFFF', 
    header: '#F8F8F8',
    drawerActiveBackground: 'rgba(108, 99, 255, 0.15)',
  },
};