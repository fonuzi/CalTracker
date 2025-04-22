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
  // Protein and carbs have 4 calories per gram, fat has 9 calories per gram
  const proteinCalories = protein * 4;
  const carbCalories = carbs * 4;
  const fatCalories = fat * 9;
  
  return Math.round(proteinCalories + carbCalories + fatCalories);
};

/**
 * Calculates the macronutrient distribution percentages
 * @param {number} protein - Grams of protein
 * @param {number} carbs - Grams of carbohydrates
 * @param {number} fat - Grams of fat
 * @returns {Object} Percentages of each macronutrient
 */
export const calculateMacroPercentages = (protein = 0, carbs = 0, fat = 0) => {
  const proteinCalories = protein * 4;
  const carbCalories = carbs * 4;
  const fatCalories = fat * 9;
  
  const totalCalories = proteinCalories + carbCalories + fatCalories;
  
  if (totalCalories === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  return {
    protein: Math.round((proteinCalories / totalCalories) * 100),
    carbs: Math.round((carbCalories / totalCalories) * 100),
    fat: Math.round((fatCalories / totalCalories) * 100),
  };
};

/**
 * Formats food data for display
 * @param {Object} food - Food data object
 * @returns {Object} Formatted food data
 */
export const formatFoodData = (food) => {
  // Ensure all required fields are present
  const formattedFood = {
    id: food.id || generateFoodId(),
    name: food.name || 'Unknown Food',
    calories: food.calories || 0,
    protein: food.protein || 0,
    carbs: food.carbs || 0,
    fat: food.fat || 0,
    fiber: food.fiber || 0,
    sugar: food.sugar || 0,
    description: food.description || '',
    healthScore: food.healthScore || 0,
    tips: food.tips || '',
    mealType: food.mealType || suggestMealTypeByTime(),
    timestamp: food.timestamp || new Date().toISOString(),
  };
  
  // Calculate calories if not provided but macros are
  if (!formattedFood.calories && (formattedFood.protein || formattedFood.carbs || formattedFood.fat)) {
    formattedFood.calories = calculateCaloriesFromMacros(
      formattedFood.protein,
      formattedFood.carbs,
      formattedFood.fat
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
  
  if (hour >= 5 && hour < 10) {
    return 'breakfast';
  } else if (hour >= 10 && hour < 12) {
    return 'snack';
  } else if (hour >= 12 && hour < 15) {
    return 'lunch';
  } else if (hour >= 15 && hour < 18) {
    return 'snack';
  } else if (hour >= 18 && hour < 22) {
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
  
  if (percentages.protein > 40) {
    return 'High Protein';
  } else if (percentages.carbs > 60) {
    return 'High Carb';
  } else if (percentages.fat > 40) {
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
    return 'Small Snack';
  } else if (calories < 400) {
    return 'Large Snack / Small Meal';
  } else if (calories < 700) {
    return 'Regular Meal';
  } else {
    return 'Large Meal';
  }
};

/**
 * Generates a unique ID for a food entry
 * @returns {string} Unique ID
 * @private
 */
const generateFoodId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};