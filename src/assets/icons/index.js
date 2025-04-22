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
  HOME: 'home',
  FOOD_LOG: 'book',
  CAMERA: 'camera',
  ACTIVITY: 'activity',
  SETTINGS: 'settings',
  PROFILE: 'user',
  ADD: 'plus',
  REMOVE: 'minus',
  EDIT: 'edit',
  DELETE: 'trash-2',
  SEARCH: 'search',
  CALENDAR: 'calendar',
  INFO: 'info',
  WARNING: 'alert-triangle',
  SUCCESS: 'check-circle',
  ERROR: 'x-circle',
  BACK: 'arrow-left',
  FORWARD: 'arrow-right',
  MENU: 'menu',
  CLOSE: 'x',
  BREAKFAST: 'coffee',
  LUNCH: 'sun',
  DINNER: 'moon',
  SNACK: 'apple',
  PROTEIN: 'egg',
  CARBS: 'bread',
  FAT: 'oil',
  WEIGHT: 'anchor',
  HEIGHT: 'chevrons-up',
  WATER: 'droplet',
  STEPS: 'activity',
  SLEEP: 'moon',
  LOGOUT: 'log-out'
};

/**
 * Get the appropriate icon for a meal type
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack, etc.)
 * @returns {string} Icon name from ICONS
 */
export const getMealTypeIcon = (mealType) => {
  if (!mealType) return ICONS.FOOD_LOG;
  
  const type = mealType.toLowerCase();
  
  if (type.includes('breakfast')) return ICONS.BREAKFAST;
  if (type.includes('lunch')) return ICONS.LUNCH;
  if (type.includes('dinner')) return ICONS.DINNER;
  if (type.includes('snack')) return ICONS.SNACK;
  
  // Default fallback
  return ICONS.FOOD_LOG;
};

/**
 * Get the appropriate color for a meal type
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack, etc.)
 * @returns {string} Color hex code
 */
export const getMealTypeColor = (mealType) => {
  if (!mealType) return '#6C63FF'; // Default primary color
  
  const type = mealType.toLowerCase();
  
  if (type.includes('breakfast')) return '#5E60CE'; // Purple
  if (type.includes('lunch')) return '#64DFDF'; // Teal
  if (type.includes('dinner')) return '#6C63FF'; // Primary purple
  if (type.includes('snack')) return '#FCBF49'; // Yellow/orange
  
  // Default fallback
  return '#6C63FF'; // Primary color
};

/**
 * Get the appropriate icon for a nutrient type
 * @param {string} nutrientType - Type of nutrient (protein, carbs, fat)
 * @returns {string} Icon name from ICONS
 */
export const getNutrientIcon = (nutrientType) => {
  if (!nutrientType) return ICONS.FOOD_LOG;
  
  const type = nutrientType.toLowerCase();
  
  if (type.includes('protein')) return ICONS.PROTEIN;
  if (type.includes('carb')) return ICONS.CARBS;
  if (type.includes('fat')) return ICONS.FAT;
  
  // Default fallback
  return ICONS.FOOD_LOG;
};

/**
 * Get the appropriate color for a nutrient type
 * @param {string} nutrientType - Type of nutrient (protein, carbs, fat)
 * @returns {string} Color hex code
 */
export const getNutrientColor = (nutrientType) => {
  if (!nutrientType) return '#6C63FF'; // Default primary color
  
  const type = nutrientType.toLowerCase();
  
  if (type.includes('protein')) return '#5E60CE'; // Purple
  if (type.includes('carb')) return '#64DFDF'; // Teal
  if (type.includes('fat')) return '#FCBF49'; // Yellow/orange
  
  // Default fallback
  return '#6C63FF'; // Primary color
};