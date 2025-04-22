/**
 * Utility functions for calculations related to health and fitness
 */

/**
 * Calculates Body Mass Index (BMI)
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {number} BMI value
 */
export const calculateBMI = (weightKg, heightCm) => {
  // Convert height from cm to meters and square it
  const heightM = heightCm / 100;
  const heightSquared = heightM * heightM;
  
  // Calculate BMI
  return weightKg / heightSquared;
};

/**
 * Gets BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {Object} Category name and color
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) {
    return { category: 'Underweight', color: '#5AC8FA' }; // Blue
  } else if (bmi >= 18.5 && bmi < 25) {
    return { category: 'Normal', color: '#34C759' }; // Green
  } else if (bmi >= 25 && bmi < 30) {
    return { category: 'Overweight', color: '#FF9500' }; // Orange
  } else {
    return { category: 'Obese', color: '#FF3B30' }; // Red
  }
};

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in calories per day
 */
export const calculateBMR = (weightKg, heightCm, age, gender) => {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE in calories per day
 */
export const calculateTDEE = (bmr, activityLevel) => {
  // Activity multipliers
  const multipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    'very active': 1.9, // Very hard exercise & physical job or 2x training
  };
  
  // Get the appropriate multiplier or default to moderate
  const multiplier = multipliers[activityLevel] || multipliers.moderate;
  
  // Calculate TDEE
  return Math.round(bmr * multiplier);
};

/**
 * Calculates daily calorie goal based on TDEE and fitness goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} fitnessGoal - Fitness goal
 * @returns {number} Daily calorie goal
 */
export const calculateCalorieGoal = (tdee, fitnessGoal) => {
  // Adjust TDEE based on fitness goal
  switch (fitnessGoal) {
    case 'lose':
      return Math.round(tdee * 0.8); // 20% deficit for weight loss
    case 'gain':
      return Math.round(tdee * 1.1); // 10% surplus for weight gain
    case 'maintain':
    default:
      return tdee; // Maintain weight
  }
};

/**
 * Calculates daily macronutrient goals based on calorie goal and fitness goal
 * @param {number} calorieGoal - Daily calorie goal
 * @param {string} fitnessGoal - Fitness goal
 * @param {number} weightKg - Weight in kilograms
 * @returns {Object} Macronutrient goals in grams
 */
export const calculateMacroGoals = (calorieGoal, fitnessGoal, weightKg) => {
  // Default macro ratios based on fitness goal
  let proteinRatio, carbsRatio, fatRatio;
  
  switch (fitnessGoal) {
    case 'lose':
      // Higher protein, lower carbs for weight loss
      proteinRatio = 0.35;
      carbsRatio = 0.4;
      fatRatio = 0.25;
      break;
    case 'gain':
      // Higher carbs, moderate protein for muscle gain
      proteinRatio = 0.3;
      carbsRatio = 0.5;
      fatRatio = 0.2;
      break;
    case 'maintain':
    default:
      // Balanced macros for maintenance
      proteinRatio = 0.3;
      carbsRatio = 0.45;
      fatRatio = 0.25;
      break;
  }
  
  // Calculate protein based on body weight (higher priority)
  // For muscle gain/preservation, target 1.6-2.2g per kg bodyweight
  let proteinG;
  if (fitnessGoal === 'gain') {
    proteinG = weightKg * 2.2; // 2.2g per kg for muscle gain
  } else if (fitnessGoal === 'lose') {
    proteinG = weightKg * 2.0; // 2.0g per kg for weight loss (preserve muscle)
  } else {
    proteinG = weightKg * 1.6; // 1.6g per kg for maintenance
  }
  
  // Calculate calories from protein
  const proteinCals = proteinG * 4;
  
  // Adjust remaining calories for carbs and fat
  const remainingCals = calorieGoal - proteinCals;
  const remainingRatio = carbsRatio + fatRatio;
  
  // Recalculate carbs and fat ratios to distribute remaining calories
  const adjustedCarbsRatio = carbsRatio / remainingRatio;
  const adjustedFatRatio = fatRatio / remainingRatio;
  
  // Calculate grams of carbs and fat
  const carbsG = Math.round((remainingCals * adjustedCarbsRatio) / 4);
  const fatG = Math.round((remainingCals * adjustedFatRatio) / 9);
  
  return {
    protein: Math.round(proteinG),
    carbs: carbsG,
    fat: fatG,
  };
};

/**
 * Calculates calories burned from steps
 * @param {number} steps - Number of steps
 * @param {number} weightKg - Weight in kilograms
 * @returns {number} Calories burned
 */
export const calculateCaloriesBurned = (steps, weightKg = 70) => {
  // Average calorie burn is approximately 0.04 calories per step per kg of body weight
  // Simplified model: calories = steps * weight * 0.0004
  
  return Math.round(steps * weightKg * 0.0004);
};

/**
 * Converts steps to distance
 * @param {number} steps - Number of steps
 * @param {number} heightCm - Height in centimeters
 * @returns {number} Distance in kilometers
 */
export const stepsToDistance = (steps, heightCm = 170) => {
  // Calculate stride length based on height (approximately 0.415 * height)
  const strideLength = heightCm * 0.415 / 100; // in meters
  
  // Calculate distance
  const distanceM = steps * strideLength;
  
  // Convert to kilometers
  return distanceM / 1000;
};

/**
 * Calculates water intake recommendation
 * @param {number} weightKg - Weight in kilograms
 * @param {number} activityLevel - Activity level (1-5, where 1 is sedentary and 5 is very active)
 * @returns {number} Recommended water intake in liters
 */
export const calculateWaterIntake = (weightKg, activityLevel = 1) => {
  // Base recommendation: 0.03L per kg of body weight
  let waterIntake = weightKg * 0.03;
  
  // Adjust for activity level
  const activityMultiplier = 1 + (activityLevel - 1) * 0.15;
  waterIntake *= activityMultiplier;
  
  // Round to 1 decimal place
  return Math.round(waterIntake * 10) / 10;
};