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
  if (!weightKg || !heightCm || heightCm === 0) return 0;
  
  // Convert height from cm to meters
  const heightM = heightCm / 100;
  
  // Calculate BMI: weight (kg) / height (m)^2
  const bmi = weightKg / (heightM * heightM);
  
  // Round to 1 decimal place
  return Math.round(bmi * 10) / 10;
};

/**
 * Gets BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {Object} Category name and color
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) {
    return { category: 'Underweight', color: '#3B82F6' }; // Blue
  } else if (bmi < 25) {
    return { category: 'Normal weight', color: '#10B981' }; // Green
  } else if (bmi < 30) {
    return { category: 'Overweight', color: '#F59E0B' }; // Yellow/Orange
  } else {
    return { category: 'Obesity', color: '#EF4444' }; // Red
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
  if (!weightKg || !heightCm || !age) return 0;
  
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender && gender.toLowerCase() === 'female') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  }
  
  return Math.round(bmr);
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE in calories per day
 */
export const calculateTDEE = (bmr, activityLevel) => {
  if (!bmr) return 0;
  
  // Activity multipliers
  const multipliers = {
    'sedentary': 1.2, // Little or no exercise
    'light': 1.375, // Light exercise 1-3 days/week
    'moderate': 1.55, // Moderate exercise 3-5 days/week
    'active': 1.725, // Active - Hard exercise 6-7 days/week
    'very active': 1.9 // Very active - Hard exercise & physical job or 2x training
  };
  
  const level = activityLevel ? activityLevel.toLowerCase() : 'sedentary';
  const multiplier = multipliers[level] || 1.2; // Default to sedentary if level not found
  
  return Math.round(bmr * multiplier);
};

/**
 * Calculates daily calorie goal based on TDEE and fitness goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} fitnessGoal - Fitness goal
 * @returns {number} Daily calorie goal
 */
export const calculateCalorieGoal = (tdee, fitnessGoal) => {
  if (!tdee) return 0;
  
  // Calorie adjustments based on fitness goal
  switch (fitnessGoal && fitnessGoal.toLowerCase()) {
    case 'lose weight':
      return Math.round(tdee * 0.8); // 20% deficit
    case 'maintain weight':
      return tdee;
    case 'gain weight':
    case 'build muscle':
      return Math.round(tdee * 1.1); // 10% surplus
    default:
      return tdee;
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
  if (!calorieGoal || !weightKg) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  let proteinRatio, carbsRatio, fatRatio;
  
  // Set macronutrient ratios based on fitness goal
  switch (fitnessGoal && fitnessGoal.toLowerCase()) {
    case 'lose weight':
      proteinRatio = 0.35; // 35% of calories from protein
      fatRatio = 0.30; // 30% of calories from fat
      carbsRatio = 0.35; // 35% of calories from carbs
      break;
    case 'build muscle':
      proteinRatio = 0.30; // 30% of calories from protein
      fatRatio = 0.25; // 25% of calories from fat
      carbsRatio = 0.45; // 45% of calories from carbs
      break;
    case 'maintain weight':
    default:
      proteinRatio = 0.25; // 25% of calories from protein
      fatRatio = 0.30; // 30% of calories from fat
      carbsRatio = 0.45; // 45% of calories from carbs
      break;
  }
  
  // Calculate grams of each macronutrient
  // Protein and carbs have 4 calories per gram, fat has 9 calories per gram
  const proteinGrams = Math.round((calorieGoal * proteinRatio) / 4);
  const carbsGrams = Math.round((calorieGoal * carbsRatio) / 4);
  const fatGrams = Math.round((calorieGoal * fatRatio) / 9);
  
  return {
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams
  };
};

/**
 * Calculates calories burned from steps
 * @param {number} steps - Number of steps
 * @param {number} weightKg - Weight in kilograms
 * @returns {number} Calories burned
 */
export const calculateCaloriesBurned = (steps, weightKg = 70) => {
  if (!steps) return 0;
  
  // Average calorie burn is 0.04 calories per step per kg of body weight
  const caloriesPerStep = 0.04;
  
  // Calculate calories burned
  const caloriesBurned = steps * caloriesPerStep * (weightKg / 70);
  
  return Math.round(caloriesBurned);
};

/**
 * Converts steps to distance
 * @param {number} steps - Number of steps
 * @param {number} heightCm - Height in centimeters
 * @returns {number} Distance in kilometers
 */
export const stepsToDistance = (steps, heightCm = 170) => {
  if (!steps) return 0;
  
  // Calculate stride length based on height (approx. 0.415 times height)
  const strideLength = heightCm * 0.415 / 100; // in meters
  
  // Calculate distance
  const distanceM = steps * strideLength;
  const distanceKm = distanceM / 1000;
  
  // Round to 2 decimal places
  return Math.round(distanceKm * 100) / 100;
};

/**
 * Calculates water intake recommendation
 * @param {number} weightKg - Weight in kilograms
 * @param {number} activityLevel - Activity level (1-5, where 1 is sedentary and 5 is very active)
 * @returns {number} Recommended water intake in liters
 */
export const calculateWaterIntake = (weightKg, activityLevel = 1) => {
  if (!weightKg) return 0;
  
  // Base recommendation: 30-35 ml per kg of body weight
  const baseIntake = weightKg * 33 / 1000; // in liters
  
  // Adjust for activity level (add 0.5 liters for each level above sedentary)
  const activityAdjustment = Math.max(0, Math.min(4, activityLevel - 1)) * 0.25;
  
  // Total recommended intake
  const totalIntake = baseIntake + activityAdjustment;
  
  // Round to 1 decimal place
  return Math.round(totalIntake * 10) / 10;
};