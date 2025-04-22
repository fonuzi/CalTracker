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
  // Navigation
  HOME: 'home',
  FOOD_LOG: 'book-open',
  CAMERA: 'camera',
  PROFILE: 'user',
  SETTINGS: 'settings',
  STEPS: 'activity',
  
  // Food
  FOOD: 'coffee',
  MEAL: 'pie-chart',
  WATER: 'droplet',
  
  // Nutrition
  PROTEIN: 'target',
  CARBS: 'circle',
  FAT: 'triangle',
  FIBER: 'zap',
  CALORIES: 'activity',
  
  // Actions
  ADD: 'plus',
  REMOVE: 'minus',
  EDIT: 'edit-2',
  DELETE: 'trash-2',
  SAVE: 'save',
  BACK: 'arrow-left',
  NEXT: 'arrow-right',
  
  // UI
  SEARCH: 'search',
  CALENDAR: 'calendar',
  FILTER: 'filter',
  ALERT: 'alert-circle',
  INFO: 'info',
  CHECK: 'check',
  
  // Meal types
  BREAKFAST: 'sunrise',
  LUNCH: 'sun',
  DINNER: 'sunset',
  SNACK: 'coffee',
  
  // Misc
  LIGHT: 'sun',
  DARK: 'moon',
  CAMERA_SWITCH: 'refresh-cw',
  GALLERY: 'image',
  BARCODE: 'maximize',
};

/**
 * Get the appropriate icon for a meal type
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack, etc.)
 * @returns {string} Icon name from ICONS
 */
export const getMealTypeIcon = (mealType) => {
  if (!mealType) return ICONS.FOOD;
  
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      return ICONS.BREAKFAST;
    case 'lunch':
      return ICONS.LUNCH;
    case 'dinner':
      return ICONS.DINNER;
    case 'snack':
      return ICONS.SNACK;
    default:
      return ICONS.FOOD;
  }
};

/**
 * Get the appropriate color for a meal type
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack, etc.)
 * @returns {string} Color hex code
 */
export const getMealTypeColor = (mealType) => {
  if (!mealType) return '#6C63FF'; // Default purple
  
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      return '#FF9E7A'; // Orange
    case 'lunch':
      return '#7ACDFF'; // Blue
    case 'dinner':
      return '#B08FFF'; // Purple
    case 'snack':
      return '#FFD07A'; // Yellow
    default:
      return '#6C63FF'; // Default purple
  }
};

/**
 * Get the appropriate icon for a nutrient type
 * @param {string} nutrientType - Type of nutrient (protein, carbs, fat)
 * @returns {string} Icon name from ICONS
 */
export const getNutrientIcon = (nutrientType) => {
  if (!nutrientType) return ICONS.FOOD;
  
  switch (nutrientType.toLowerCase()) {
    case 'protein':
      return ICONS.PROTEIN;
    case 'carbs':
    case 'carbohydrates':
      return ICONS.CARBS;
    case 'fat':
    case 'fats':
      return ICONS.FAT;
    case 'fiber':
      return ICONS.FIBER;
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
  if (!nutrientType) return '#6C63FF'; // Default purple
  
  switch (nutrientType.toLowerCase()) {
    case 'protein':
      return '#FF6B6B'; // Red
    case 'carbs':
    case 'carbohydrates':
      return '#4ECDC4'; // Teal
    case 'fat':
    case 'fats':
      return '#FFD166'; // Yellow
    case 'fiber':
      return '#6BD490'; // Green
    case 'calories':
      return '#4A7DFC'; // Blue
    default:
      return '#6C63FF'; // Default purple
  }
};