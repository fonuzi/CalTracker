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
  if (!weightKg || !heightCm) return 0;
  
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
};

/**
 * Gets BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {Object} Category name and color
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) {
    return { category: 'Underweight', color: '#FFD166' };
  } else if (bmi < 25) {
    return { category: 'Normal', color: '#06D6A0' };
  } else if (bmi < 30) {
    return { category: 'Overweight', color: '#FF9F43' };
  } else {
    return { category: 'Obese', color: '#FF6B6B' };
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
  if (!weightKg || !heightCm || !age || !gender) return 0;
  
  // Mifflin-St Jeor Equation
  let bmr;
  
  if (gender.toLowerCase() === 'male') {
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
  if (!bmr) return 0;
  
  let multiplier;
  
  switch (activityLevel) {
    case 'sedentary':
      multiplier = 1.2;
      break;
    case 'light':
      multiplier = 1.375;
      break;
    case 'moderate':
      multiplier = 1.55;
      break;
    case 'active':
      multiplier = 1.725;
      break;
    case 'very_active':
      multiplier = 1.9;
      break;
    default:
      multiplier = 1.2;
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
  if (!tdee) return 0;
  
  switch (fitnessGoal) {
    case 'lose':
      return Math.round(tdee * 0.8); // 20% deficit
    case 'maintain':
      return tdee;
    case 'gain':
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
    return {
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }
  
  let proteinRatio, carbsRatio, fatRatio;
  
  switch (fitnessGoal) {
    case 'lose':
      proteinRatio = 0.4; // 40% protein
      carbsRatio = 0.3;   // 30% carbs
      fatRatio = 0.3;     // 30% fat
      break;
    case 'maintain':
      proteinRatio = 0.3; // 30% protein
      carbsRatio = 0.4;   // 40% carbs
      fatRatio = 0.3;     // 30% fat
      break;
    case 'gain':
      proteinRatio = 0.3; // 30% protein
      carbsRatio = 0.45;  // 45% carbs
      fatRatio = 0.25;    // 25% fat
      break;
    default:
      proteinRatio = 0.3;
      carbsRatio = 0.4;
      fatRatio = 0.3;
  }
  
  // Calculate grams based on ratios and calorie goal
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram
  const proteinCals = calorieGoal * proteinRatio;
  const carbsCals = calorieGoal * carbsRatio;
  const fatCals = calorieGoal * fatRatio;
  
  return {
    protein: Math.round(proteinCals / 4),
    carbs: Math.round(carbsCals / 4),
    fat: Math.round(fatCals / 9)
  };
};

/**
 * Calculates calories burned from steps
 * @param {number} steps - Number of steps
 * @param {number} weightKg - Weight in kilograms
 * @returns {number} Calories burned
 */
export const calculateCaloriesBurned = (steps, weightKg = 70) => {
  // Average calories burned per step per kg of body weight
  const caloriesPerStepPerKg = 0.0004;
  
  return Math.round(steps * caloriesPerStepPerKg * weightKg);
};

/**
 * Converts steps to distance
 * @param {number} steps - Number of steps
 * @param {number} heightCm - Height in centimeters
 * @returns {number} Distance in kilometers
 */
export const stepsToDistance = (steps, heightCm = 170) => {
  // Average stride length is approximately 42% of height
  const strideLength = heightCm * 0.42 / 100; // in meters
  
  // Distance = steps * stride length
  const distanceMeters = steps * strideLength;
  
  // Convert to kilometers
  return +(distanceMeters / 1000).toFixed(2);
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
  let baseIntake = weightKg * 33 / 1000;
  
  // Adjust for activity level
  const activityMultiplier = 1 + (activityLevel - 1) * 0.1;
  
  return +(baseIntake * activityMultiplier).toFixed(1);
};