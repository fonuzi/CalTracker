import React from 'react';
import { Feather } from '@expo/vector-icons';

/**
 * Icon component for the app that uses Feather icons
 * @param {string} name - Name of the icon
 * @param {number} size - Size of the icon (default: 24)
 * @param {string} color - Color of the icon (default: white)
 * @returns {React.Component} Feather icon component
 */
export const Icon = ({ name, size = 24, color = '#FFFFFF', style }) => {
  return <Feather name={name} size={size} color={color} style={style} />;
};

/**
 * Icons used throughout the app
 */
export const ICONS = {
  // Meal types
  breakfast: 'coffee',
  lunch: 'sun',
  dinner: 'moon',
  snack: 'aperture',
  
  // Nutrients
  protein: 'check-square',
  carbs: 'circle',
  fat: 'triangle',
  
  // Navigation
  home: 'home',
  camera: 'camera',
  foodLog: 'book',
  profile: 'user',
  settings: 'settings',
  
  // Actions
  add: 'plus',
  edit: 'edit-2',
  delete: 'trash-2',
  save: 'check',
  cancel: 'x',
  back: 'arrow-left',
  
  // Status
  success: 'check-circle',
  error: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info',
  
  // Other
  search: 'search',
  calendar: 'calendar',
  activity: 'activity',
  steps: 'trending-up',
  water: 'droplet',
  sleep: 'moon',
  weight: 'bar-chart-2',
};

/**
 * Get the appropriate icon for a meal type
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack, etc.)
 * @returns {string} Icon name from ICONS
 */
export const getMealTypeIcon = (mealType) => {
  const mealTypeIcons = {
    breakfast: 'coffee',
    lunch: 'sun',
    dinner: 'moon',
    snack: 'aperture',
  };
  
  return mealTypeIcons[mealType?.toLowerCase()] || 'help-circle';
};

/**
 * Get the appropriate color for a meal type
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack, etc.)
 * @returns {string} Color hex code
 */
export const getMealTypeColor = (mealType) => {
  const mealTypeColors = {
    breakfast: '#5AC8FA', // Blue
    lunch: '#FFCC00', // Yellow
    dinner: '#5856D6', // Purple
    snack: '#FF9500', // Orange
  };
  
  return mealTypeColors[mealType?.toLowerCase()] || '#AAAAAA';
};

/**
 * Get the appropriate icon for a nutrient type
 * @param {string} nutrientType - Type of nutrient (protein, carbs, fat)
 * @returns {string} Icon name from ICONS
 */
export const getNutrientIcon = (nutrientType) => {
  const nutrientIcons = {
    protein: 'check-square',
    carbs: 'circle',
    fat: 'triangle',
    fiber: 'hexagon',
    sugar: 'octagon',
    sodium: 'hash',
    water: 'droplet',
  };
  
  return nutrientIcons[nutrientType?.toLowerCase()] || 'help-circle';
};

/**
 * Get the appropriate color for a nutrient type
 * @param {string} nutrientType - Type of nutrient (protein, carbs, fat)
 * @returns {string} Color hex code
 */
export const getNutrientColor = (nutrientType) => {
  const nutrientColors = {
    protein: '#5856D6', // Purple
    carbs: '#FF9500', // Orange
    fat: '#FF3B30', // Red
    fiber: '#34C759', // Green
    sugar: '#FF2D55', // Pink
    sodium: '#5AC8FA', // Blue
    water: '#007AFF', // Blue
  };
  
  return nutrientColors[nutrientType?.toLowerCase()] || '#AAAAAA';
};