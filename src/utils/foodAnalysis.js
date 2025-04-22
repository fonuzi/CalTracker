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
  const proteinCalories = protein * 4; // 4 calories per gram
  const carbsCalories = carbs * 4; // 4 calories per gram
  const fatCalories = fat * 9; // 9 calories per gram
  
  return Math.round(proteinCalories + carbsCalories + fatCalories);
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
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  const proteinPercentage = Math.round((protein * 4 / totalCalories) * 100);
  const carbsPercentage = Math.round((carbs * 4 / totalCalories) * 100);
  const fatPercentage = Math.round((fat * 9 / totalCalories) * 100);
  
  // Adjust to ensure they sum to 100%
  const sum = proteinPercentage + carbsPercentage + fatPercentage;
  if (sum !== 100 && sum !== 0) {
    // If sum is not 100%, adjust the largest value
    const diff = 100 - sum;
    if (proteinPercentage >= carbsPercentage && proteinPercentage >= fatPercentage) {
      return { protein: proteinPercentage + diff, carbs: carbsPercentage, fat: fatPercentage };
    } else if (carbsPercentage >= proteinPercentage && carbsPercentage >= fatPercentage) {
      return { protein: proteinPercentage, carbs: carbsPercentage + diff, fat: fatPercentage };
    } else {
      return { protein: proteinPercentage, carbs: carbsPercentage, fat: fatPercentage + diff };
    }
  }
  
  return { protein: proteinPercentage, carbs: carbsPercentage, fat: fatPercentage };
};

/**
 * Formats food data for display
 * @param {Object} food - Food data object
 * @returns {Object} Formatted food data
 */
export const formatFoodData = (food) => {
  // Ensure all numeric values are numbers
  const formattedFood = {
    ...food,
    calories: food.calories !== undefined ? Number(food.calories) : 0,
    protein: food.protein !== undefined ? Number(food.protein) : 0,
    carbs: food.carbs !== undefined ? Number(food.carbs) : 0,
    fat: food.fat !== undefined ? Number(food.fat) : 0,
    fiber: food.fiber !== undefined ? Number(food.fiber) : 0,
    sugar: food.sugar !== undefined ? Number(food.sugar) : 0,
  };
  
  // Calculate calories if not provided but macros are
  if (!formattedFood.calories && (formattedFood.protein || formattedFood.carbs || formattedFood.fat)) {
    formattedFood.calories = calculateCaloriesFromMacros(
      formattedFood.protein,
      formattedFood.carbs,
      formattedFood.fat
    );
  }
  
  // Calculate macro percentages
  const macroPercentages = calculateMacroPercentages(
    formattedFood.protein,
    formattedFood.carbs,
    formattedFood.fat
  );
  
  formattedFood.macroPercentages = macroPercentages;
  
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
    return 'Breakfast';
  } else if (hour >= 10 && hour < 12) {
    return 'Morning Snack';
  } else if (hour >= 12 && hour < 15) {
    return 'Lunch';
  } else if (hour >= 15 && hour < 18) {
    return 'Afternoon Snack';
  } else if (hour >= 18 && hour < 21) {
    return 'Dinner';
  } else {
    return 'Evening Snack';
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
  } else if (percentages.carbs >= 40 && percentages.protein >= 25) {
    return 'Balanced (Carb-Protein)';
  } else if (percentages.carbs >= 40 && percentages.fat >= 25) {
    return 'Balanced (Carb-Fat)';
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
  if (calories <= 100) {
    return 'Small Snack';
  } else if (calories <= 300) {
    return 'Large Snack / Small Meal';
  } else if (calories <= 600) {
    return 'Regular Meal';
  } else if (calories <= 900) {
    return 'Large Meal';
  } else {
    return 'Very Large Meal';
  }
};