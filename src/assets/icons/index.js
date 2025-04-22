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
  // Navigation icons
  HOME: 'home',
  FOOD_LOG: 'book',
  CAMERA: 'camera',
  ACTIVITY: 'activity',
  SETTINGS: 'settings',
  
  // Food related icons
  BREAKFAST: 'sunrise',
  LUNCH: 'sun',
  DINNER: 'sunset',
  SNACK: 'coffee',
  
  // Nutrient icons
  PROTEIN: 'box',
  CARBS: 'circle',
  FAT: 'droplet',
  
  // Action icons
  ADD: 'plus',
  EDIT: 'edit',
  DELETE: 'trash-2',
  SAVE: 'check',
  CANCEL: 'x',
  
  // Other icons
  PROFILE: 'user',
  STEPS: 'trending-up',
  CALORIES: 'zap',
  WEIGHT: 'anchor',
  WATER: 'droplet',
  SLEEP: 'moon',
  
  // Theme icons
  DARK_MODE: 'moon',
  LIGHT_MODE: 'sun',
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
      return ICONS.FOOD_LOG;
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
      return '#FF6B6B'; // Red
    default:
      return '#8E7CFF'; // Default Purple
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
    default:
      return ICONS.CALORIES;
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
    default:
      return '#8E7CFF'; // Default Purple
  }
};