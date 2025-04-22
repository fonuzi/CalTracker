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
  // Calculate calories from each macronutrient
  const proteinCals = protein * 4; // 4 calories per gram of protein
  const carbsCals = carbs * 4; // 4 calories per gram of carbs
  const fatCals = fat * 9; // 9 calories per gram of fat
  
  // Return the sum
  return proteinCals + carbsCals + fatCals;
};

/**
 * Calculates the macronutrient distribution percentages
 * @param {number} protein - Grams of protein
 * @param {number} carbs - Grams of carbohydrates
 * @param {number} fat - Grams of fat
 * @returns {Object} Percentages of each macronutrient
 */
export const calculateMacroPercentages = (protein = 0, carbs = 0, fat = 0) => {
  // Calculate calories from each macronutrient
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  
  // Calculate total calories
  const totalCals = proteinCals + carbsCals + fatCals;
  
  // Avoid division by zero
  if (totalCals === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  // Calculate percentages
  const proteinPercentage = Math.round((proteinCals / totalCals) * 100);
  const carbsPercentage = Math.round((carbsCals / totalCals) * 100);
  const fatPercentage = Math.round((fatCals / totalCals) * 100);
  
  // Ensure percentages add up to 100%
  let adjustedProteinPercentage = proteinPercentage;
  let adjustedCarbsPercentage = carbsPercentage;
  let adjustedFatPercentage = fatPercentage;
  
  const totalPercentage = proteinPercentage + carbsPercentage + fatPercentage;
  if (totalPercentage !== 100) {
    const difference = 100 - totalPercentage;
    
    // Distribute the difference
    if (proteinPercentage >= carbsPercentage && proteinPercentage >= fatPercentage) {
      adjustedProteinPercentage += difference;
    } else if (carbsPercentage >= proteinPercentage && carbsPercentage >= fatPercentage) {
      adjustedCarbsPercentage += difference;
    } else {
      adjustedFatPercentage += difference;
    }
  }
  
  return {
    protein: adjustedProteinPercentage,
    carbs: adjustedCarbsPercentage,
    fat: adjustedFatPercentage,
  };
};

/**
 * Formats food data for display
 * @param {Object} food - Food data object
 * @returns {Object} Formatted food data
 */
export const formatFoodData = (food) => {
  const result = { ...food };
  
  // Round numerical values
  if (result.calories) result.calories = Math.round(result.calories);
  if (result.protein) result.protein = Math.round(result.protein);
  if (result.carbs) result.carbs = Math.round(result.carbs);
  if (result.fat) result.fat = Math.round(result.fat);
  if (result.fiber) result.fiber = Math.round(result.fiber);
  if (result.sugar) result.sugar = Math.round(result.sugar);
  
  // Calculate macros if not provided but calories are
  if (result.calories && (!result.protein || !result.carbs || !result.fat)) {
    // Estimate macros based on calories (this is an approximation)
    const estimatedProtein = Math.round(result.calories * 0.25 / 4);
    const estimatedFat = Math.round(result.calories * 0.3 / 9);
    const estimatedCarbs = Math.round(result.calories * 0.45 / 4);
    
    if (!result.protein) result.protein = estimatedProtein;
    if (!result.carbs) result.carbs = estimatedCarbs;
    if (!result.fat) result.fat = estimatedFat;
  }
  
  // Calculate calories if not provided but macros are
  if (!result.calories && (result.protein || result.carbs || result.fat)) {
    result.calories = calculateCaloriesFromMacros(
      result.protein || 0,
      result.carbs || 0,
      result.fat || 0
    );
  }
  
  // Add meal type if not present
  if (!result.mealType) {
    result.mealType = suggestMealTypeByTime();
  }
  
  return result;
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
  } else if (hour >= 14 && hour < 18) {
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
  // Calculate total calories from macros
  const totalCals = calculateCaloriesFromMacros(protein, carbs, fat);
  
  // Calculate percentages
  const percentages = calculateMacroPercentages(protein, carbs, fat);
  
  // Classify based on dominant macronutrient
  if (percentages.protein >= 40) {
    return 'high-protein';
  } else if (percentages.carbs >= 60) {
    return 'high-carb';
  } else if (percentages.fat >= 40) {
    return 'high-fat';
  } else {
    return 'balanced';
  }
};

/**
 * Estimates portion size based on calories
 * @param {number} calories - Total calories
 * @returns {string} Portion size description
 */
export const estimatePortionSize = (calories) => {
  if (calories < 150) {
    return 'small';
  } else if (calories < 350) {
    return 'medium';
  } else if (calories < 600) {
    return 'large';
  } else {
    return 'extra large';
  }
};

/**
 * Generates a unique ID for a food entry
 * @returns {string} Unique ID
 * @private
 */
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};