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
  // Check for valid inputs and provide clear error handling
  if (!weightKg || !heightCm || isNaN(weightKg) || isNaN(heightCm)) {
    console.warn('Invalid inputs for BMI calculation:', { weightKg, heightCm });
    return 0;
  }
  
  // Ensure inputs are positive numbers
  if (weightKg <= 0 || heightCm <= 0) {
    console.warn('Weight and height must be positive values for BMI calculation');
    return 0;
  }
  
  // Convert height from cm to meters
  const heightM = heightCm / 100;
  
  // BMI formula: weight (kg) / [height (m)]²
  const bmi = weightKg / (heightM * heightM);
  
  // Round to 1 decimal place and ensure it's a number
  return parseFloat(bmi.toFixed(1));
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
  // Input validation with better error handling
  if (!weightKg || !heightCm || !age || !gender) {
    console.warn('Missing required inputs for BMR calculation', { weightKg, heightCm, age, gender });
    return 0;
  }
  
  // Ensure values are valid numbers
  if (isNaN(weightKg) || isNaN(heightCm) || isNaN(age)) {
    console.warn('Non-numeric inputs for BMR calculation', { weightKg, heightCm, age });
    return 0;
  }
  
  // Ensure positive values
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    console.warn('Invalid values (must be positive) for BMR calculation', { weightKg, heightCm, age });
    return 0;
  }
  
  // Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
  let bmr;
  
  if (gender.toLowerCase() === 'male') {
    // For men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    // For women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  
  // Ensure reasonable BMR values (typical range 1000-2500 for most people)
  if (bmr < 500 || bmr > 5000) {
    console.warn('BMR calculation resulted in unusual value, possible input error:', { bmr, weightKg, heightCm, age, gender });
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
  // Input validation
  if (!bmr || isNaN(bmr) || bmr <= 0) {
    console.warn('Invalid BMR value for TDEE calculation:', bmr);
    return 0;
  }
  
  // Physical Activity Level (PAL) multipliers based on activity level
  let multiplier;
  
  switch (activityLevel) {
    case 'sedentary':
      // Little or no exercise, desk job
      multiplier = 1.2;
      break;
    case 'light':
      // Light exercise 1-3 days/week
      multiplier = 1.375;
      break;
    case 'moderate':
      // Moderate exercise 3-5 days/week
      multiplier = 1.55;
      break;
    case 'active':
      // Active: heavy exercise 6-7 days/week
      multiplier = 1.725;
      break;
    case 'very_active':
      // Very active: physical job or twice-daily training
      multiplier = 1.9;
      break;
    default:
      // If activity level is unknown, default to sedentary to avoid overestimating
      console.warn('Unknown activity level for TDEE calculation, defaulting to sedentary:', activityLevel);
      multiplier = 1.2;
  }
  
  const tdee = Math.round(bmr * multiplier);
  
  // Sanity check for reasonable TDEE values
  if (tdee < 1000 || tdee > 4000) {
    console.warn('TDEE calculation resulted in unusual value, possible input error:', { tdee, bmr, activityLevel });
  }
  
  return tdee;
};

/**
 * Calculates daily calorie goal based on TDEE and fitness goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} fitnessGoal - Fitness goal
 * @returns {number} Daily calorie goal
 */
export const calculateCalorieGoal = (tdee, fitnessGoal) => {
  // Input validation
  if (!tdee || isNaN(tdee) || tdee <= 0) {
    console.warn('Invalid TDEE value for calorie goal calculation:', tdee);
    return 0;
  }
  
  let calorieGoal;
  
  switch (fitnessGoal) {
    case 'lose':
      // For weight loss, a 20% deficit is typically effective and sustainable
      calorieGoal = Math.round(tdee * 0.8);
      
      // Sanity check: don't go below 1200 for most adults (minimum to maintain nutrition)
      if (calorieGoal < 1200) {
        console.warn('Calculated calorie goal is too low, setting minimum threshold of 1200:', calorieGoal);
        calorieGoal = 1200;
      }
      break;
      
    case 'maintain':
      // For maintenance, keep at TDEE
      calorieGoal = tdee;
      break;
      
    case 'gain':
      // For weight gain, a 10% surplus is typically effective
      calorieGoal = Math.round(tdee * 1.1);
      
      // Sanity check: upper limit to avoid excessive calorie surplus
      if (calorieGoal > tdee + 1000) {
        console.warn('Calculated calorie surplus is too high, limiting to TDEE + 1000:', calorieGoal);
        calorieGoal = tdee + 1000;
      }
      break;
      
    default:
      console.warn('Unknown fitness goal for calorie calculation, defaulting to maintenance:', fitnessGoal);
      calorieGoal = tdee;
  }
  
  return calorieGoal;
};

/**
 * Calculates daily macronutrient goals based on calorie goal and fitness goal
 * @param {number} calorieGoal - Daily calorie goal
 * @param {string} fitnessGoal - Fitness goal
 * @param {number} weightKg - Weight in kilograms
 * @returns {Object} Macronutrient goals in grams
 */
export const calculateMacroGoals = (calorieGoal, fitnessGoal, weightKg) => {
  // Input validation
  if (!calorieGoal || !weightKg || isNaN(calorieGoal) || isNaN(weightKg) || calorieGoal <= 0 || weightKg <= 0) {
    console.warn('Invalid inputs for macro calculation:', { calorieGoal, weightKg });
    return {
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }
  
  // Use more scientifically-based approach while taking fitness goal into account
  let proteinPerKg, fatPerCalorie, carbsRemaining;
  
  switch (fitnessGoal) {
    case 'lose':
      // Higher protein for muscle preservation during weight loss
      // 2.0-2.4g protein per kg bodyweight
      proteinPerKg = 2.2;
      // 0.3g fat per calorie (minimum needed for hormone production)
      fatPerCalorie = 0.3;
      break;
    case 'maintain':
      // 1.6-2.0g protein per kg bodyweight
      proteinPerKg = 1.8;
      // 0.3-0.35g fat per calorie
      fatPerCalorie = 0.35;
      break;
    case 'gain':
      // 1.8-2.2g protein per kg bodyweight
      proteinPerKg = 2.0;
      // 0.25-0.3g fat per calorie (more carbs for energy)
      fatPerCalorie = 0.25;
      break;
    default:
      // Default to maintenance values
      proteinPerKg = 1.8;
      fatPerCalorie = 0.35;
  }
  
  // Calculate macros in absolute grams
  const proteinGrams = Math.round(weightKg * proteinPerKg);
  
  // Calories from protein (4 cal per gram)
  const proteinCals = proteinGrams * 4;
  
  // Fat calculation
  // Using percentage of total calories but ensuring it's not too low
  const minimumFatGrams = Math.round(weightKg * 0.8); // Minimum 0.8g/kg for hormone health
  const calculatedFatGrams = Math.round((calorieGoal * fatPerCalorie) / 9);
  const fatGrams = Math.max(minimumFatGrams, calculatedFatGrams);
  const fatCals = fatGrams * 9;
  
  // Remaining calories go to carbs
  const remainingCals = calorieGoal - proteinCals - fatCals;
  const carbsGrams = Math.max(0, Math.round(remainingCals / 4));
  
  // Ensure we don't have negative values or unrealistic ratios
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