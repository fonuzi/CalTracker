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
  FOOD_LOG: 'book',
  CAMERA: 'camera',
  ACTIVITY: 'activity',
  SETTINGS: 'settings',
  
  // Actions
  ADD: 'plus',
  EDIT: 'edit-2',
  DELETE: 'trash-2',
  SAVE: 'save',
  SHARE: 'share',
  BACK: 'arrow-left',
  
  // UI elements
  CLOSE: 'x',
  MENU: 'menu',
  SEARCH: 'search',
  CHECK: 'check',
  INFO: 'info',
  WARNING: 'alert-triangle',
  ERROR: 'alert-circle',
  
  // User
  USER: 'user',
  PROFILE: 'user',
  
  // Food related
  FOOD: 'coffee',
  MEAL: 'pie-chart',
  WATER: 'droplet',
  
  // Nutrition
  PROTEIN: 'box',
  CARBS: 'circle',
  FAT: 'droplet',
  CALORIES: 'zap',
  
  // Activity
  STEPS: 'activity',
  WEIGHT: 'trending-up',
  SLEEP: 'moon',
  
  // Misc
  CALENDAR: 'calendar',
  CLOCK: 'clock',
  SETTINGS_ALT: 'settings',
  CHART: 'bar-chart-2',
  FLASH: 'zap',
  CAMERA_ALT: 'camera',
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
      return 'sunrise';
    case 'lunch':
      return 'sun';
    case 'dinner':
      return 'sunset';
    case 'snack':
      return 'coffee';
    default:
      return 'pie-chart';
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
      return '#FF9F43'; // Orange
    case 'lunch':
      return '#4ECDC4'; // Teal
    case 'dinner':
      return '#8E7CFF'; // Purple
    case 'snack':
      return '#FFD166'; // Yellow
    default:
      return '#4ECDC4'; // Default teal
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
    case 'carbohydrates':
      return ICONS.CARBS;
    case 'fat':
      return ICONS.FAT;
    case 'calories':
      return ICONS.CALORIES;
    default:
      return ICONS.FOOD;
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
      return '#FF6B6B'; // Red
    case 'carbs':
    case 'carbohydrates':
      return '#4ECDC4'; // Teal
    case 'fat':
      return '#FFD166'; // Yellow
    case 'calories':
      return '#8E7CFF'; // Purple
    default:
      return '#8E7CFF'; // Default purple
  }
};