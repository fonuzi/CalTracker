import React from 'react';
import { Feather } from '@expo/vector-icons';

/**
 * Icon component for the app that uses Feather icons
 * @param {string} name - Name of the icon
 * @param {number} size - Size of the icon (default: 24)
 * @param {string} color - Color of the icon (default: white)
 * @returns {React.Component} Feather icon component
 */
export const Icon = ({ name, size = 24, color = '#FFFFFF' }) => {
  return <Feather name={name} size={size} color={color} />;
};

/**
 * Icons used throughout the app
 */
export const ICONS = {
  // Navigation
  HOME: 'home',
  CAMERA: 'camera',
  FOOD_LOG: 'book',
  STEPS: 'activity',
  SETTINGS: 'settings',
  PROFILE: 'user',
  
  // Actions
  ADD: 'plus',
  EDIT: 'edit',
  DELETE: 'trash-2',
  BACK: 'arrow-left',
  CLOSE: 'x',
  SEARCH: 'search',
  SAVE: 'save',
  REFRESH: 'refresh-cw',
  
  // Meal types
  BREAKFAST: 'sunrise',
  LUNCH: 'sun',
  DINNER: 'moon',
  SNACK: 'coffee',
  OTHER: 'package',
  
  // Nutrients
  PROTEIN: 'battery-charging',
  CARBS: 'pie-chart',
  FAT: 'droplet',
  CALORIES: 'zap',
  
  // Misc
  DARK_MODE: 'moon',
  LIGHT_MODE: 'sun',
  NOTIFICATION: 'bell',
  INFO: 'info',
  WARNING: 'alert-triangle',
  SUCCESS: 'check-circle',
  ERROR: 'alert-circle',
};

/**
 * Get the appropriate icon for a meal type
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack, etc.)
 * @returns {string} Icon name from ICONS
 */
export const getMealTypeIcon = (mealType) => {
  const type = mealType ? mealType.toLowerCase() : '';
  
  switch (type) {
    case 'breakfast':
      return ICONS.BREAKFAST;
    case 'lunch':
      return ICONS.LUNCH;
    case 'dinner':
      return ICONS.DINNER;
    case 'snack':
      return ICONS.SNACK;
    default:
      return ICONS.OTHER;
  }
};

/**
 * Get the appropriate color for a meal type
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack, etc.)
 * @returns {string} Color hex code
 */
export const getMealTypeColor = (mealType) => {
  const type = mealType ? mealType.toLowerCase() : '';
  
  switch (type) {
    case 'breakfast':
      return '#F59E0B'; // Yellow/Orange
    case 'lunch':
      return '#3B82F6'; // Blue
    case 'dinner':
      return '#8B5CF6'; // Purple
    case 'snack':
      return '#10B981'; // Green
    default:
      return '#6B7280'; // Gray
  }
};

/**
 * Get the appropriate icon for a nutrient type
 * @param {string} nutrientType - Type of nutrient (protein, carbs, fat)
 * @returns {string} Icon name from ICONS
 */
export const getNutrientIcon = (nutrientType) => {
  const type = nutrientType ? nutrientType.toLowerCase() : '';
  
  switch (type) {
    case 'protein':
      return ICONS.PROTEIN;
    case 'carbs':
      return ICONS.CARBS;
    case 'fat':
      return ICONS.FAT;
    case 'calories':
      return ICONS.CALORIES;
    default:
      return 'circle';
  }
};

/**
 * Get the appropriate color for a nutrient type
 * @param {string} nutrientType - Type of nutrient (protein, carbs, fat)
 * @returns {string} Color hex code
 */
export const getNutrientColor = (nutrientType) => {
  const type = nutrientType ? nutrientType.toLowerCase() : '';
  
  switch (type) {
    case 'protein':
      return '#EC4899'; // Pink
    case 'carbs':
      return '#3B82F6'; // Blue
    case 'fat':
      return '#F59E0B'; // Yellow/Orange
    case 'calories':
      return '#8B5CF6'; // Purple
    default:
      return '#6B7280'; // Gray
  }
};