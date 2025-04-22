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
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

/**
 * Gets BMI category based on BMI value
 * @param {number} bmi - BMI value
 * @returns {Object} Category name and color
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) {
    return { category: 'Underweight', color: '#64DFDF' }; // Teal
  } else if (bmi < 25) {
    return { category: 'Normal weight', color: '#34C759' }; // Green
  } else if (bmi < 30) {
    return { category: 'Overweight', color: '#FCBF49' }; // Yellow/orange
  } else {
    return { category: 'Obese', color: '#FF453A' }; // Red
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
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  
  if (gender === 'male') {
    bmr += 5;
  } else {
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
  if (!bmr || !activityLevel) return 0;
  
  let multiplier = 1.2; // Sedentary
  
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
  if (!tdee || !fitnessGoal) return 0;
  
  switch (fitnessGoal) {
    case 'lose_weight':
      return Math.round(tdee * 0.8); // 20% deficit
    case 'maintain':
      return tdee;
    case 'gain_muscle':
      return Math.round(tdee * 1.1); // 10% surplus
    case 'improve_fitness':
      return tdee;
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
  if (!calorieGoal || !fitnessGoal || !weightKg) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  let proteinPercentage, carbsPercentage, fatPercentage;
  
  switch (fitnessGoal) {
    case 'lose_weight':
      proteinPercentage = 0.35; // 35% protein
      fatPercentage = 0.3; // 30% fat
      carbsPercentage = 0.35; // 35% carbs
      break;
    case 'gain_muscle':
      proteinPercentage = 0.3; // 30% protein
      fatPercentage = 0.25; // 25% fat
      carbsPercentage = 0.45; // 45% carbs
      break;
    case 'maintain':
      proteinPercentage = 0.25; // 25% protein
      fatPercentage = 0.3; // 30% fat
      carbsPercentage = 0.45; // 45% carbs
      break;
    case 'improve_fitness':
      proteinPercentage = 0.25; // 25% protein
      fatPercentage = 0.25; // 25% fat
      carbsPercentage = 0.5; // 50% carbs
      break;
    default:
      proteinPercentage = 0.25;
      fatPercentage = 0.3;
      carbsPercentage = 0.45;
  }
  
  // Calculate grams of each macronutrient
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram
  const protein = Math.round((calorieGoal * proteinPercentage) / 4);
  const carbs = Math.round((calorieGoal * carbsPercentage) / 4);
  const fat = Math.round((calorieGoal * fatPercentage) / 9);
  
  return { protein, carbs, fat };
};

/**
 * Calculates calories burned from steps
 * @param {number} steps - Number of steps
 * @param {number} weightKg - Weight in kilograms
 * @returns {number} Calories burned
 */
export const calculateCaloriesBurned = (steps, weightKg = 70) => {
  if (!steps) return 0;
  
  // Rough estimate: 0.04 calories per step per kg of body weight
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
  
  // Average stride length is about 42% of height
  const strideLength = heightCm * 0.42 / 100; // stride in meters
  const distanceM = steps * strideLength;
  return parseFloat((distanceM / 1000).toFixed(2)); // distance in km
};

/**
 * Calculates water intake recommendation
 * @param {number} weightKg - Weight in kilograms
 * @param {number} activityLevel - Activity level (1-5, where 1 is sedentary and 5 is very active)
 * @returns {number} Recommended water intake in liters
 */
export const calculateWaterIntake = (weightKg, activityLevel = 1) => {
  if (!weightKg) return 0;
  
  // Base: 30ml per kg body weight
  let waterIntake = weightKg * 0.03;
  
  // Adjust for activity level
  waterIntake += (activityLevel - 1) * 0.25;
  
  return parseFloat(waterIntake.toFixed(1));
};