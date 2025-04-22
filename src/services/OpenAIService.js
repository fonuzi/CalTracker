import * as FileSystem from 'expo-file-system';
import OpenAI from 'openai';
import { Platform } from 'react-native';

// Get API key from environment variables (note: for Expo web, we need to access it differently)
const OPENAI_API_KEY = Platform.OS === 'web' 
  ? process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY || '' 
  : process.env.OPENAI_API_KEY || '';

// Initialize OpenAI with API key from environment
const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For demo in browser environment
});

/**
 * Analyzes a food image to extract nutritional information
 * @param {string} imageUri - Local URI of the food image to analyze
 * @returns {Promise<Object>} Nutritional information
 */
export const analyzeFoodImage = async (imageUri) => {
  try {
    // Convert image to base64
    let base64Image;
    
    if (Platform.OS === 'web') {
      // Use fetch API for web
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          base64Image = reader.result.split(',')[1];
          processFoodImageWithOpenAI(base64Image).then(resolve).catch(reject);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // Use Expo FileSystem for native
      base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return processFoodImageWithOpenAI(base64Image);
    }
  } catch (error) {
    console.error('Error analyzing food image:', error);
    
    // Return demo data in case of error to keep app working in demo mode
    return getDemoFoodData('image');
  }
};

/**
 * Analyzes food description text to extract nutritional information
 * @param {string} text - Description of the food
 * @returns {Promise<Object>} Nutritional information
 */
export const analyzeFoodText = async (text) => {
  try {
    // Construct the prompt for GPT
    const prompt = `
      Analyze the following food description and provide detailed nutritional information.
      Food description: "${text}"
      
      Respond with a JSON object in the following format:
      {
        "name": "Food name",
        "calories": number,
        "protein": number (in grams),
        "carbs": number (in grams),
        "fat": number (in grams),
        "fiber": number (in grams),
        "sugar": number (in grams),
        "description": "Brief description of the food",
        "healthScore": number (1-10 rating),
        "tips": "Health tips related to this food"
      }
      
      Make sure all numerical values are reasonable estimations based on standard portion sizes.
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a nutritionist AI specializing in food analysis. Provide accurate nutritional information based on food descriptions." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const foodData = JSON.parse(response.choices[0].message.content);
    
    // Add timestamp and mealType based on time of day
    return {
      ...foodData,
      timestamp: new Date().toISOString(),
      mealType: suggestMealTypeByTime(),
      id: generateFoodId()
    };
  } catch (error) {
    console.error('Error analyzing food text:', error);
    
    // Return demo data in case of error to keep app working in demo mode
    return getDemoFoodData('text', text);
  }
};

/**
 * Analyzes user fitness data to provide personalized recommendations
 * @param {Object} userData - User fitness and profile data
 * @returns {Promise<Object>} Personalized recommendations
 */
export const analyzeFitnessGoals = async (userData) => {
  try {
    // Construct the prompt for GPT
    const { 
      age, 
      weight, 
      height, 
      gender, 
      activityLevel, 
      fitnessGoal 
    } = userData;
    
    const prompt = `
      Analyze the following user data and provide personalized fitness and nutrition recommendations:
      
      User profile:
      - Age: ${age}
      - Weight: ${weight} kg
      - Height: ${height} cm
      - Gender: ${gender}
      - Activity level: ${activityLevel}
      - Fitness goal: ${fitnessGoal}
      
      Respond with a JSON object in the following format:
      {
        "calorieGoal": daily calorie goal (number),
        "macroGoals": {
          "protein": grams (number),
          "carbs": grams (number), 
          "fat": grams (number)
        },
        "recommendations": [
          "recommendation 1",
          "recommendation 2",
          "recommendation 3"
        ],
        "suggestedMeals": {
          "breakfast": ["meal suggestion 1", "meal suggestion 2"],
          "lunch": ["meal suggestion 1", "meal suggestion 2"],
          "dinner": ["meal suggestion 1", "meal suggestion 2"],
          "snacks": ["snack suggestion 1", "snack suggestion 2"]
        }
      }
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a fitness coach and nutritionist AI. Provide personalized fitness and nutrition recommendations based on user profiles." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing fitness goals:', error);
    
    // Return demo data in case of error to keep app working in demo mode
    return getDemoFitnessRecommendations(userData);
  }
};

/**
 * Gets demo food data when OpenAI is not available
 * @param {string} method - 'image' or 'text'
 * @param {string} text - Food description (for text method)
 * @returns {Object} Demo food data
 * @private
 */
const getDemoFoodData = (method, text = '') => {
  // If text method is used, try to provide more relevant demo data
  if (method === 'text' && text) {
    return getDemoFoodDataFromText(text);
  }
  
  // Default demo data
  return {
    id: generateFoodId(),
    name: 'Grilled Chicken Salad',
    calories: 350,
    protein: 30,
    carbs: 15,
    fat: 18,
    fiber: 4,
    sugar: 3,
    description: 'Grilled chicken breast with mixed greens, tomatoes, cucumbers, and olive oil dressing.',
    healthScore: 8,
    tips: 'This balanced meal is high in protein and low in carbs, making it great for weight management.',
    timestamp: new Date().toISOString(),
    mealType: suggestMealTypeByTime()
  };
};

/**
 * Gets demo food data based on text description
 * @param {string} text - Food description
 * @returns {Object} Demo food data tailored to the text
 * @private
 */
const getDemoFoodDataFromText = (text) => {
  const lowerText = text.toLowerCase();
  let foodData = {};
  
  // Check for common foods in the text
  if (lowerText.includes('pizza')) {
    foodData = {
      name: 'Pizza Slice',
      calories: 285,
      protein: 12,
      carbs: 36,
      fat: 10,
      fiber: 2,
      sugar: 3,
      description: 'Cheese pizza slice with tomato sauce on wheat crust.',
      healthScore: 5,
      tips: 'Opt for thin crust and vegetable toppings to make pizza healthier.',
    };
  } else if (lowerText.includes('salad')) {
    foodData = {
      name: 'Garden Salad',
      calories: 150,
      protein: 3,
      carbs: 10,
      fat: 10,
      fiber: 4,
      sugar: 4,
      description: 'Fresh mixed greens with various vegetables and light dressing.',
      healthScore: 9,
      tips: 'Add lean protein like chicken or tofu to make this a complete meal.',
    };
  } else if (lowerText.includes('burger') || lowerText.includes('hamburger')) {
    foodData = {
      name: 'Beef Burger',
      calories: 450,
      protein: 25,
      carbs: 30,
      fat: 25,
      fiber: 2,
      sugar: 6,
      description: 'Beef patty with lettuce, tomato, and condiments on a bun.',
      healthScore: 4,
      tips: 'Try a lettuce wrap instead of a bun to reduce carbohydrates.',
    };
  } else if (lowerText.includes('chicken')) {
    foodData = {
      name: 'Grilled Chicken',
      calories: 200,
      protein: 30,
      carbs: 0,
      fat: 8,
      fiber: 0,
      sugar: 0,
      description: 'Seasoned, grilled chicken breast.',
      healthScore: 8,
      tips: 'Excellent source of lean protein, pair with vegetables for a complete meal.',
    };
  } else if (lowerText.includes('pasta') || lowerText.includes('spaghetti')) {
    foodData = {
      name: 'Pasta with Tomato Sauce',
      calories: 380,
      protein: 12,
      carbs: 70,
      fat: 6,
      fiber: 4,
      sugar: 10,
      description: 'Pasta with homemade tomato sauce and herbs.',
      healthScore: 6,
      tips: 'Try whole grain pasta for more fiber and nutrients.',
    };
  } else {
    // Generic food data if no matches
    foodData = {
      name: text.charAt(0).toUpperCase() + text.slice(1),
      calories: 300,
      protein: 15,
      carbs: 30,
      fat: 12,
      fiber: 3,
      sugar: 5,
      description: `${text} with typical ingredients.`,
      healthScore: 6,
      tips: 'Portion control is key to maintaining a balanced diet.',
    };
  }
  
  return {
    ...foodData,
    id: generateFoodId(),
    timestamp: new Date().toISOString(),
    mealType: suggestMealTypeByTime()
  };
};

/**
 * Gets demo fitness recommendations when OpenAI is not available
 * @param {Object} userData - User profile data
 * @returns {Object} Demo recommendations
 * @private
 */
const getDemoFitnessRecommendations = (userData) => {
  // Default values if userData is incomplete
  const weight = userData?.weight || 70;
  const height = userData?.height || 170;
  const age = userData?.age || 30;
  const gender = userData?.gender || 'other';
  const activityLevel = userData?.activityLevel || 'moderate';
  const fitnessGoal = userData?.fitnessGoal || 'maintain';
  
  // Basic BMR calculation (Mifflin-St Jeor Equation)
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Adjust based on activity level
  let activityMultiplier;
  switch (activityLevel) {
    case 'sedentary':
      activityMultiplier = 1.2;
      break;
    case 'light':
      activityMultiplier = 1.375;
      break;
    case 'moderate':
      activityMultiplier = 1.55;
      break;
    case 'active':
      activityMultiplier = 1.725;
      break;
    case 'very active':
      activityMultiplier = 1.9;
      break;
    default:
      activityMultiplier = 1.55;
  }
  
  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = Math.round(bmr * activityMultiplier);
  
  // Adjust based on fitness goal
  let calorieGoal;
  switch (fitnessGoal) {
    case 'lose':
      calorieGoal = Math.round(tdee * 0.85); // 15% deficit
      break;
    case 'gain':
      calorieGoal = Math.round(tdee * 1.15); // 15% surplus
      break;
    default:
      calorieGoal = tdee; // Maintain weight
  }
  
  // Calculate macro distribution
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
    calorieGoal,
    macroGoals: {
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams
    },
    recommendations: [
      `Aim for ${calorieGoal} calories per day to ${fitnessGoal === 'lose' ? 'lose' : fitnessGoal === 'gain' ? 'gain' : 'maintain'} weight.`,
      `Stay hydrated by drinking at least ${Math.round(weight * 0.03 * 100) / 100} liters of water daily.`,
      `Include at least 150 minutes of moderate aerobic activity per week.`
    ],
    suggestedMeals: {
      breakfast: [
        `Oatmeal with berries and nuts (${Math.round(calorieGoal * 0.25)} calories)`,
        `Protein smoothie with banana and spinach (${Math.round(calorieGoal * 0.25)} calories)`
      ],
      lunch: [
        `Grilled chicken salad with avocado (${Math.round(calorieGoal * 0.3)} calories)`,
        `Quinoa bowl with vegetables and tofu (${Math.round(calorieGoal * 0.3)} calories)`
      ],
      dinner: [
        `Baked salmon with roasted vegetables (${Math.round(calorieGoal * 0.35)} calories)`,
        `Lean beef stir-fry with brown rice (${Math.round(calorieGoal * 0.35)} calories)`
      ],
      snacks: [
        `Greek yogurt with honey (${Math.round(calorieGoal * 0.1)} calories)`,
        `Apple with almond butter (${Math.round(calorieGoal * 0.1)} calories)`
      ]
    }
  };
};

/**
 * Process the food image using OpenAI Vision API
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Nutritional information
 * @private
 */
const processFoodImageWithOpenAI = async (base64Image) => {
  // Construct the prompt for GPT-4 Vision
  const prompt = `
    Analyze this food image and provide detailed nutritional information.
    Respond with a JSON object in the following format:
    {
      "name": "Food name",
      "calories": number,
      "protein": number (in grams),
      "carbs": number (in grams),
      "fat": number (in grams),
      "fiber": number (in grams),
      "sugar": number (in grams),
      "description": "Brief description of the food",
      "healthScore": number (1-10 rating),
      "tips": "Health tips related to this food"
    }
    
    Make sure all numerical values are reasonable estimations based on standard portion sizes.
  `;
  
  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: "You are a nutritionist AI specializing in food analysis. Provide accurate nutritional information based on food images." },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ],
    response_format: { type: "json_object" }
  });
  
  const foodData = JSON.parse(response.choices[0].message.content);
  
  // Add timestamp and mealType based on time of day
  return {
    ...foodData,
    timestamp: new Date().toISOString(),
    mealType: suggestMealTypeByTime(),
    id: generateFoodId()
  };
};

/**
 * Suggests a meal type based on the current time
 * @returns {string} Suggested meal type
 * @private
 */
const suggestMealTypeByTime = () => {
  const hour = new Date().getHours();
  
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
 * Generates a unique ID for a food entry
 * @returns {string} Unique ID
 * @private
 */
const generateFoodId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};