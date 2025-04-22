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
  
  // Convert height to meters
  const heightM = heightCm / 100;
  
  // BMI formula: weight (kg) / height^2 (m)
  return weightKg / (heightM * heightM);
};

/**
 * Gets BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {Object} Category name and color
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) {
    return { category: 'Underweight', color: '#4ECDC4' };
  } else if (bmi >= 18.5 && bmi < 25) {
    return { category: 'Healthy Weight', color: '#4CAF50' };
  } else if (bmi >= 25 && bmi < 30) {
    return { category: 'Overweight', color: '#FFB100' };
  } else {
    return { category: 'Obesity', color: '#FF5252' };
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
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
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
    sedentary: 1.2,       // Little or no exercise
    light: 1.375,          // Light exercise 1-3 days/week
    moderate: 1.55,        // Moderate exercise 3-5 days/week
    active: 1.725,         // Active - Hard exercise 6-7 days/week
    veryActive: 1.9        // Very active - Hard daily exercise & physical job
  };
  
  const multiplier = multipliers[activityLevel] || multipliers.moderate;
  
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
  
  // Adjust calories based on fitness goal
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
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  let proteinRatio, carbsRatio, fatRatio;
  
  // Set macronutrient ratios based on fitness goal
  switch (fitnessGoal) {
    case 'lose':
      // Higher protein, moderate fat, lower carbs for weight loss
      proteinRatio = 0.4; // 40% of calories from protein
      fatRatio = 0.35;    // 35% of calories from fat
      carbsRatio = 0.25;  // 25% of calories from carbs
      break;
    case 'gain':
      // Higher carbs, moderate protein, moderate fat for muscle gain
      proteinRatio = 0.3; // 30% of calories from protein
      fatRatio = 0.25;    // 25% of calories from fat
      carbsRatio = 0.45;  // 45% of calories from carbs
      break;
    case 'maintain':
    default:
      // Balanced macros for maintenance
      proteinRatio = 0.3; // 30% of calories from protein
      fatRatio = 0.3;     // 30% of calories from fat
      carbsRatio = 0.4;   // 40% of calories from carbs
      break;
  }
  
  // Ensure protein is at least 1.6g per kg of bodyweight
  const minProtein = weightKg * 1.6;
  const proteinFromRatio = (calorieGoal * proteinRatio) / 4;
  const protein = Math.max(minProtein, proteinFromRatio);
  
  // Adjust other macros if protein was increased
  const proteinCalories = protein * 4;
  const remainingCalories = calorieGoal - proteinCalories;
  
  const adjustedRatio = 1 - proteinRatio;
  const adjustedCarbsRatio = carbsRatio / adjustedRatio;
  const adjustedFatRatio = fatRatio / adjustedRatio;
  
  const carbs = (remainingCalories * adjustedCarbsRatio) / 4;
  const fat = (remainingCalories * adjustedFatRatio) / 9;
  
  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
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
  
  // Average calories burned per step (weight-dependent)
  const caloriesPerStep = 0.04 * (weightKg / 70);
  
  return Math.round(steps * caloriesPerStep);
};

/**
 * Converts steps to distance
 * @param {number} steps - Number of steps
 * @param {number} heightCm - Height in centimeters
 * @returns {number} Distance in kilometers
 */
export const stepsToDistance = (steps, heightCm = 170) => {
  if (!steps) return 0;
  
  // Calculate stride length based on height (average is ~0.43 times height)
  const strideLength = heightCm * 0.43 / 100; // in meters
  
  // Calculate distance
  const distanceMeters = steps * strideLength;
  return distanceMeters / 1000; // convert to kilometers
};

/**
 * Calculates water intake recommendation
 * @param {number} weightKg - Weight in kilograms
 * @param {number} activityLevel - Activity level (1-5, where 1 is sedentary and 5 is very active)
 * @returns {number} Recommended water intake in liters
 */
export const calculateWaterIntake = (weightKg, activityLevel = 1) => {
  if (!weightKg) return 0;
  
  // Base recommendation: ~30ml per kg of body weight
  const baseWater = weightKg * 0.03;
  
  // Adjust for activity level (add 0.5-1L for active individuals)
  const activityAdjustment = Math.max(0, (activityLevel - 1) * 0.25);
  
  return baseWater + activityAdjustment;
};