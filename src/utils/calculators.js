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
  // Convert height to meters
  const heightM = heightCm / 100;
  
  // Calculate BMI (weight in kg / height in m^2)
  const bmi = weightKg / (heightM * heightM);
  
  // Round to one decimal place
  return Math.round(bmi * 10) / 10;
};

/**
 * Gets BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {Object} Category name and color
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) {
    return { category: 'Underweight', color: '#6BBCED' }; // Blue
  } else if (bmi < 25) {
    return { category: 'Normal', color: '#4ECDC4' }; // Teal
  } else if (bmi < 30) {
    return { category: 'Overweight', color: '#FFD166' }; // Yellow
  } else if (bmi < 35) {
    return { category: 'Obese Class I', color: '#FF9F43' }; // Orange
  } else {
    return { category: 'Obese Class II+', color: '#FF6B6B' }; // Red
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
  let bmr;
  
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
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
  let multiplier;
  
  switch (activityLevel) {
    case 'sedentary':
      multiplier = 1.2; // Little or no exercise
      break;
    case 'light':
      multiplier = 1.375; // Light exercise 1-3 days/week
      break;
    case 'moderate':
      multiplier = 1.55; // Moderate exercise 3-5 days/week
      break;
    case 'active':
      multiplier = 1.725; // Hard exercise 6-7 days/week
      break;
    case 'very active':
      multiplier = 1.9; // Very hard exercise & physical job
      break;
    default:
      multiplier = 1.55; // Default to moderate
  }
  
  return Math.round(bmr * multiplier);
};

/**
 * Calculates daily calorie goal based on TDEE and fitness goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} fitnessGoal - Fitness goal
 * @returns {number} Daily calorie goal
 */
export const calculateCalorieGoal = (tdee, fitnessGoal) => {
  switch (fitnessGoal) {
    case 'lose':
      return Math.round(tdee * 0.85); // 15% deficit
    case 'gain':
      return Math.round(tdee * 1.15); // 15% surplus
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
  let proteinPercentage, carbsPercentage, fatPercentage;
  
  switch (fitnessGoal) {
    case 'lose':
      proteinPercentage = 0.35; // Higher protein for satiety
      carbsPercentage = 0.35;
      fatPercentage = 0.3;
      break;
    case 'gain':
      proteinPercentage = 0.3;
      carbsPercentage = 0.45; // Higher carbs for energy
      fatPercentage = 0.25;
      break;
    default:
      proteinPercentage = 0.3;
      carbsPercentage = 0.4;
      fatPercentage = 0.3;
  }
  
  // Calculate grams of each macro
  const proteinGrams = Math.round((calorieGoal * proteinPercentage) / 4); // 4 calories per gram
  const carbsGrams = Math.round((calorieGoal * carbsPercentage) / 4); // 4 calories per gram
  const fatGrams = Math.round((calorieGoal * fatPercentage) / 9); // 9 calories per gram
  
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
  // Average calories burned per mile (1609 steps) based on weight
  const caloriesPerMile = 0.57 * weightKg;
  
  // Convert steps to miles
  const miles = steps / 1609;
  
  // Calculate calories
  const calories = miles * caloriesPerMile;
  
  return Math.round(calories);
};

/**
 * Converts steps to distance
 * @param {number} steps - Number of steps
 * @param {number} heightCm - Height in centimeters
 * @returns {number} Distance in kilometers
 */
export const stepsToDistance = (steps, heightCm = 170) => {
  // Calculate stride length based on height (rough approximation)
  const strideLengthM = heightCm * 0.415 / 100;
  
  // Calculate distance in kilometers
  const distanceKm = (steps * strideLengthM) / 1000;
  
  // Round to one decimal place
  return Math.round(distanceKm * 10) / 10;
};

/**
 * Calculates water intake recommendation
 * @param {number} weightKg - Weight in kilograms
 * @param {number} activityLevel - Activity level (1-5, where 1 is sedentary and 5 is very active)
 * @returns {number} Recommended water intake in liters
 */
export const calculateWaterIntake = (weightKg, activityLevel = 1) => {
  // Base recommendation: 30-35ml per kg body weight
  const baseIntake = weightKg * 0.03;
  
  // Adjust for activity level
  const activityAdjustment = 0.0007 * weightKg * activityLevel;
  
  // Calculate total recommendation
  const totalIntake = baseIntake + activityAdjustment;
  
  // Round to one decimal place
  return Math.round(totalIntake * 10) / 10;
};