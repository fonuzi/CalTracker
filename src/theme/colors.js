import { DefaultTheme, DarkTheme } from 'react-native-paper';

// Dark theme colors
export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#8B5CF6', // Vivid purple
    accent: '#6366F1', // Indigo
    background: '#111827', // Dark background
    surface: '#1F2937', // Surface color for cards
    text: '#F9FAFB', // Text color
    secondaryText: '#9CA3AF', // Secondary text color
    disabled: '#4B5563', // Disabled state color
    placeholder: '#6B7280', // Placeholder text color
    border: '#374151', // Border color
    error: '#F87171', // Error color
    success: '#34D399', // Success color
    warning: '#FBBF24', // Warning color
    info: '#60A5FA', // Info color
    
    // App-specific colors
    protein: '#EC4899', // Pink
    carbs: '#3B82F6', // Blue
    fat: '#F59E0B', // Yellow/Orange
  },
  // Custom fonts and spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: 12,
};

// Light theme colors
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#8B5CF6', // Same purple as dark theme
    accent: '#6366F1', // Indigo
    background: '#F9FAFB', // Light background
    surface: '#FFFFFF', // Surface color for cards
    text: '#111827', // Text color
    secondaryText: '#4B5563', // Secondary text color
    disabled: '#D1D5DB', // Disabled state color
    placeholder: '#9CA3AF', // Placeholder text color
    border: '#E5E7EB', // Border color
    error: '#EF4444', // Error color
    success: '#10B981', // Success color
    warning: '#F59E0B', // Warning color
    info: '#3B82F6', // Info color
    
    // App-specific colors
    protein: '#EC4899', // Pink
    carbs: '#3B82F6', // Blue
    fat: '#F59E0B', // Yellow/Orange
  },
  // Custom fonts and spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: 12,
};