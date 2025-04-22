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
  return protein * 4 + carbs * 4 + fat * 9;
};

/**
 * Calculates the macronutrient distribution percentages
 * @param {number} protein - Grams of protein
 * @param {number} carbs - Grams of carbohydrates
 * @param {number} fat - Grams of fat
 * @returns {Object} Percentages of each macronutrient
 */
export const calculateMacroPercentages = (protein = 0, carbs = 0, fat = 0) => {
  const totalCalories = calculateCaloriesFromMacros(protein, carbs, fat);
  
  if (totalCalories === 0) {
    return { proteinPercentage: 0, carbsPercentage: 0, fatPercentage: 0 };
  }
  
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;
  
  return {
    proteinPercentage: Math.round((proteinCalories / totalCalories) * 100),
    carbsPercentage: Math.round((carbsCalories / totalCalories) * 100),
    fatPercentage: Math.round((fatCalories / totalCalories) * 100)
  };
};

/**
 * Formats food data for display
 * @param {Object} food - Food data object
 * @returns {Object} Formatted food data
 */
export const formatFoodData = (food) => {
  const formattedFood = { ...food };
  
  // Generate an ID if not present
  if (!formattedFood.id) {
    formattedFood.id = generateFoodId();
  }
  
  // Set default meal type if not present
  if (!formattedFood.mealType) {
    formattedFood.mealType = suggestMealTypeByTime();
  }
  
  // Set timestamp if not present
  if (!formattedFood.timestamp) {
    formattedFood.timestamp = new Date().toISOString();
  }
  
  // Set method if not present
  if (!formattedFood.method) {
    formattedFood.method = 'text';
  }
  
  // Round macros
  if (formattedFood.protein) formattedFood.protein = Math.round(formattedFood.protein);
  if (formattedFood.carbs) formattedFood.carbs = Math.round(formattedFood.carbs);
  if (formattedFood.fat) formattedFood.fat = Math.round(formattedFood.fat);
  if (formattedFood.calories) formattedFood.calories = Math.round(formattedFood.calories);
  
  // Calculate calories if not present but macros are
  if (!formattedFood.calories && (formattedFood.protein || formattedFood.carbs || formattedFood.fat)) {
    formattedFood.calories = calculateCaloriesFromMacros(
      formattedFood.protein || 0,
      formattedFood.carbs || 0,
      formattedFood.fat || 0
    );
  }
  
  return formattedFood;
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
  
  if (hour >= 4 && hour < 10) {
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
  const { proteinPercentage, carbsPercentage, fatPercentage } = calculateMacroPercentages(protein, carbs, fat);
  
  if (proteinPercentage > 40) {
    return 'high-protein';
  } else if (carbsPercentage > 60) {
    return 'high-carb';
  } else if (fatPercentage > 50) {
    return 'high-fat';
  } else if (protein > 0 && carbs > 0 && fat > 0) {
    return 'balanced';
  } else {
    return 'unknown';
  }
};

/**
 * Estimates portion size based on calories
 * @param {number} calories - Total calories
 * @returns {string} Portion size description
 */
export const estimatePortionSize = (calories) => {
  if (!calories) return 'Unknown';
  
  if (calories < 200) {
    return 'Small';
  } else if (calories < 500) {
    return 'Medium';
  } else if (calories < 800) {
    return 'Large';
  } else {
    return 'Extra Large';
  }
};

/**
 * Generates a unique ID for a food entry
 * @returns {string} Unique ID
 * @private
 */
const generateFoodId = () => {
  return 'food_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};