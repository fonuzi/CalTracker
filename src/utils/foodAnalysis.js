/**
 * Utility functions for food analysis and nutritional calculations
 */

/**
 * Calculates the total calories from macronutrients
 * @param {number} protein - Grams of protein
 * @param {number} carbs - Grams of carbohydrates
 * @param {number} fat - Grams of fat
 * @returns {number} Total calories
 */
export const calculateCaloriesFromMacros = (protein = 0, carbs = 0, fat = 0) => {
  // Calories per gram: protein (4), carbs (4), fat (9)
  return (protein * 4) + (carbs * 4) + (fat * 9);
};

/**
 * Calculates the macronutrient distribution percentages
 * @param {number} protein - Grams of protein
 * @param {number} carbs - Grams of carbohydrates
 * @param {number} fat - Grams of fat
 * @returns {Object} Percentages of each macronutrient
 */
export const calculateMacroPercentages = (protein = 0, carbs = 0, fat = 0) => {
  const proteinCals = protein * 4;
  const carbCals = carbs * 4;
  const fatCals = fat * 9;
  
  const totalCals = proteinCals + carbCals + fatCals;
  
  if (totalCals === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  return {
    protein: Math.round((proteinCals / totalCals) * 100),
    carbs: Math.round((carbCals / totalCals) * 100),
    fat: Math.round((fatCals / totalCals) * 100)
  };
};

/**
 * Formats food data for display
 * @param {Object} food - Food data object
 * @returns {Object} Formatted food data
 */
export const formatFoodData = (food) => {
  if (!food) return null;
  
  // Round numeric values for better display
  const formatted = { ...food };
  
  if (formatted.calories) formatted.calories = Math.round(formatted.calories);
  if (formatted.protein) formatted.protein = Math.round(formatted.protein);
  if (formatted.carbs) formatted.carbs = Math.round(formatted.carbs);
  if (formatted.fat) formatted.fat = Math.round(formatted.fat);
  if (formatted.fiber) formatted.fiber = Math.round(formatted.fiber);
  if (formatted.sugar) formatted.sugar = Math.round(formatted.sugar);
  
  return formatted;
};

/**
 * Calculates the remaining calories for the day
 * @param {number} goal - Calorie goal
 * @param {number} consumed - Calories consumed
 * @returns {number} Remaining calories
 */
export const calculateRemainingCalories = (goal, consumed) => {
  return Math.max(0, goal - consumed);
};

/**
 * Determines the appropriate meal type based on the time of day
 * @param {Date} date - Current date and time
 * @returns {string} Suggested meal type
 */
export const suggestMealTypeByTime = (date = new Date()) => {
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 10) {
    return 'breakfast';
  } else if (hour >= 10 && hour < 14) {
    return 'lunch';
  } else if (hour >= 14 && hour < 17) {
    return 'snack';
  } else if (hour >= 17 && hour < 22) {
    return 'dinner';
  } else {
    return 'snack';
  }
};

/**
 * Classifies a food based on its macronutrient profile
 * @param {Object} macros - Object containing protein, carbs, and fat values
 * @returns {string} Food classification
 */
export const classifyFoodByMacros = ({ protein = 0, carbs = 0, fat = 0 }) => {
  const percentages = calculateMacroPercentages(protein, carbs, fat);
  
  if (percentages.protein >= 40) {
    return 'High Protein';
  } else if (percentages.carbs >= 60) {
    return 'High Carb';
  } else if (percentages.fat >= 40) {
    return 'High Fat';
  } else {
    return 'Balanced';
  }
};

/**
 * Estimates portion size based on calories
 * @param {number} calories - Total calories
 * @returns {string} Portion size description
 */
export const estimatePortionSize = (calories) => {
  if (calories < 200) {
    return 'Small';
  } else if (calories < 500) {
    return 'Medium';
  } else if (calories < 800) {
    return 'Large';
  } else {
    return 'Very Large';
  }
};

/**
 * Generates a unique ID for a food entry
 * @returns {string} Unique ID
 * @private
 */
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};