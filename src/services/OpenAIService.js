import * as FileSystem from 'expo-file-system';
import OpenAI from 'openai';

// Initialize OpenAI with environment variable if available
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (error) {
  console.warn('OpenAI API key not available, using demo data');
}

/**
 * Analyzes a food image to extract nutritional information
 * @param {string} imageUri - Local URI of the food image to analyze
 * @returns {Promise<Object>} Nutritional information
 */
export const analyzeFoodImage = async (imageUri) => {
  try {
    // Check if OpenAI API is available
    if (!openai) {
      console.log('OpenAI API not available, using demo data');
      return getDemoFoodData('image');
    }
    
    // Convert image to base64
    const base64Image = await fileToBase64(imageUri);
    
    // Process with OpenAI
    const result = await processFoodImage(base64Image);
    
    return result;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    // Return demo data if API fails
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
    // Check if OpenAI API is available
    if (!openai) {
      console.log('OpenAI API not available, using demo data');
      return getDemoFoodData('text', text);
    }
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: 
            "You are a nutrition expert that analyzes food descriptions. " +
            "Extract nutritional information from the food description and return it as a JSON object with the following structure: " +
            "{ name: string, calories: number, protein: number, carbs: number, fat: number, fiber: number, sugar: number, " +
            "mealType: string (breakfast, lunch, dinner, snack), quantity: string, healthScore: number (1-10), " +
            "ingredients: string[] }. " +
            "Make reasonable estimates based on the description. If details are missing, use standard portions and averages."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse and return result
    const resultText = response.choices[0].message.content;
    const result = JSON.parse(resultText);
    
    // Add unique ID and timestamp
    result.id = generateUniqueId();
    result.timestamp = new Date().toISOString();
    
    return result;
  } catch (error) {
    console.error('Error analyzing food text:', error);
    // Return demo data if API fails
    return getDemoFoodData('text', text);
  }
};

/**
 * Process the food image using OpenAI Vision API
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Nutritional information
 * @private
 */
const processFoodImage = async (base64Image) => {
  // Call OpenAI Vision API
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      {
        role: "system",
        content: 
          "You are a nutrition expert that analyzes food images. " +
          "Identify the food in the image and estimate its nutritional content. " +
          "Return your analysis as a JSON object with the following structure: " +
          "{ name: string, calories: number, protein: number, carbs: number, fat: number, fiber: number, sugar: number, " +
          "mealType: string (breakfast, lunch, dinner, snack), quantity: string, healthScore: number (1-10), " +
          "ingredients: string[] }. " +
          "Make reasonable estimates based on what you see. Use standard portion sizes."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What food is shown in this image? Analyze its nutritional content."
          },
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
  
  // Parse and return result
  const resultText = response.choices[0].message.content;
  const result = JSON.parse(resultText);
  
  // Add unique ID and timestamp
  result.id = generateUniqueId();
  result.timestamp = new Date().toISOString();
  
  return result;
};

/**
 * Analyzes user fitness data to provide personalized recommendations
 * @param {Object} userData - User fitness and profile data
 * @returns {Promise<Object>} Personalized recommendations
 */
export const analyzeFitnessGoals = async (userData) => {
  try {
    // Check if OpenAI API is available
    if (!openai) {
      console.log('OpenAI API not available, using demo recommendations');
      return getDemoFitnessRecommendations(userData);
    }
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: 
            "You are a fitness and nutrition expert that provides personalized recommendations. " +
            "Analyze the user's profile data and provide recommendations for their fitness goals. " +
            "Return your analysis as a JSON object with the following structure: " +
            "{ calorieRecommendation: number, macroRecommendation: { protein: number, carbs: number, fat: number }, " +
            "mealPlanRecommendation: string, exerciseRecommendation: string, healthTips: string[], " +
            "weeklyGoals: string[] }. " +
            "Tailor your recommendations to the user's specific goals, age, gender, weight, and activity level."
        },
        {
          role: "user",
          content: JSON.stringify(userData)
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse and return result
    const resultText = response.choices[0].message.content;
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Error analyzing fitness goals:', error);
    // Return demo recommendations if API fails
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
  if (method === 'text' && text) {
    return getTextBasedDemoFood(text);
  }
  
  // Default demo data
  return {
    id: generateUniqueId(),
    name: 'Sample Food Item',
    calories: 350,
    protein: 15,
    carbs: 40,
    fat: 12,
    fiber: 5,
    sugar: 8,
    mealType: 'lunch',
    quantity: '1 serving',
    healthScore: 7,
    ingredients: ['Whole grains', 'Vegetables', 'Lean protein'],
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
  };
};

/**
 * Gets demo food data based on text description
 * @param {string} text - Food description
 * @returns {Object} Demo food data tailored to the text
 * @private
 */
const getTextBasedDemoFood = (text) => {
  const lowerText = text.toLowerCase();
  let result = {
    id: generateUniqueId(),
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
  };
  
  // Try to match some common foods
  if (lowerText.includes('salad')) {
    result = {
      ...result,
      name: 'Garden Salad',
      calories: 180,
      protein: 5,
      carbs: 12,
      fat: 13,
      fiber: 6,
      sugar: 4,
      mealType: 'lunch',
      quantity: '1 bowl',
      healthScore: 9,
      ingredients: ['Lettuce', 'Tomatoes', 'Cucumber', 'Olive oil', 'Vinegar']
    };
  } else if (lowerText.includes('burger') || lowerText.includes('hamburger')) {
    result = {
      ...result,
      name: 'Beef Burger',
      calories: 550,
      protein: 25,
      carbs: 40,
      fat: 30,
      fiber: 2,
      sugar: 6,
      mealType: 'lunch',
      quantity: '1 burger',
      healthScore: 4,
      ingredients: ['Beef patty', 'Burger bun', 'Lettuce', 'Tomato', 'Cheese', 'Ketchup']
    };
  } else if (lowerText.includes('pasta') || lowerText.includes('spaghetti')) {
    result = {
      ...result,
      name: 'Pasta with Tomato Sauce',
      calories: 380,
      protein: 12,
      carbs: 70,
      fat: 6,
      fiber: 4,
      sugar: 8,
      mealType: 'dinner',
      quantity: '1 plate',
      healthScore: 6,
      ingredients: ['Pasta', 'Tomato sauce', 'Garlic', 'Olive oil', 'Basil']
    };
  } else if (lowerText.includes('rice')) {
    result = {
      ...result,
      name: 'Rice Bowl',
      calories: 320,
      protein: 8,
      carbs: 65,
      fat: 4,
      fiber: 3,
      sugar: 2,
      mealType: 'lunch',
      quantity: '1 bowl',
      healthScore: 7,
      ingredients: ['Rice', 'Vegetables', 'Soy sauce', 'Sesame oil']
    };
  } else if (lowerText.includes('chicken')) {
    result = {
      ...result,
      name: 'Grilled Chicken',
      calories: 280,
      protein: 35,
      carbs: 5,
      fat: 12,
      fiber: 0,
      sugar: 1,
      mealType: 'dinner',
      quantity: '1 breast',
      healthScore: 8,
      ingredients: ['Chicken breast', 'Olive oil', 'Herbs', 'Spices']
    };
  } else if (lowerText.includes('egg') || lowerText.includes('omelet')) {
    result = {
      ...result,
      name: 'Vegetable Omelet',
      calories: 220,
      protein: 14,
      carbs: 6,
      fat: 16,
      fiber: 2,
      sugar: 3,
      mealType: 'breakfast',
      quantity: '1 omelet',
      healthScore: 7,
      ingredients: ['Eggs', 'Bell peppers', 'Onions', 'Cheese', 'Butter']
    };
  } else {
    // Default placeholder with the text as name
    const words = text.split(' ');
    const name = words.length > 5 
      ? words.slice(0, 5).join(' ') + '...' 
      : text;
    
    result = {
      ...result,
      name,
      calories: 350,
      protein: 15,
      carbs: 40,
      fat: 12,
      fiber: 5,
      sugar: 8,
      mealType: 'lunch',
      quantity: '1 serving',
      healthScore: 6,
      ingredients: ['Various ingredients based on description']
    };
  }
  
  return result;
};

/**
 * Gets demo fitness recommendations when OpenAI is not available
 * @param {Object} userData - User profile data
 * @returns {Object} Demo recommendations
 * @private
 */
const getDemoFitnessRecommendations = (userData) => {
  // Start with basic recommendations
  const recommendations = {
    calorieRecommendation: 2000,
    macroRecommendation: {
      protein: 100,
      carbs: 250,
      fat: 70
    },
    mealPlanRecommendation: 'Focus on whole foods with a balance of lean proteins, complex carbohydrates, and healthy fats.',
    exerciseRecommendation: 'Aim for 150 minutes of moderate cardio per week with 2-3 strength training sessions.',
    healthTips: [
      'Stay hydrated by drinking at least 8 glasses of water daily',
      'Aim for 7-8 hours of quality sleep each night',
      'Include a variety of colorful vegetables in your diet',
      'Limit processed foods and added sugars'
    ],
    weeklyGoals: [
      'Take 10,000 steps daily',
      'Prepare home-cooked meals at least 5 days',
      'Practice 10 minutes of mindfulness or meditation',
      'Include a serving of leafy greens with each meal'
    ]
  };
  
  // Adjust based on user data if available
  if (userData) {
    // Adjust calorie recommendation based on gender and weight
    if (userData.gender === 'female') {
      recommendations.calorieRecommendation = Math.round(userData.weightKg * 28);
    } else {
      recommendations.calorieRecommendation = Math.round(userData.weightKg * 32);
    }
    
    // Adjust based on fitness goal
    if (userData.fitnessGoal === 'lose') {
      recommendations.calorieRecommendation = Math.round(recommendations.calorieRecommendation * 0.8);
      recommendations.exerciseRecommendation = 'Aim for 250 minutes of moderate cardio per week with 2-3 strength training sessions.';
    } else if (userData.fitnessGoal === 'gain') {
      recommendations.calorieRecommendation = Math.round(recommendations.calorieRecommendation * 1.1);
      recommendations.exerciseRecommendation = 'Focus on 3-4 strength training sessions per week with 100 minutes of moderate cardio.';
    }
    
    // Adjust macros based on weight
    recommendations.macroRecommendation.protein = Math.round(userData.weightKg * 1.8);
    recommendations.macroRecommendation.fat = Math.round(recommendations.calorieRecommendation * 0.3 / 9);
    
    // Calculate carbs from remaining calories
    const proteinCalories = recommendations.macroRecommendation.protein * 4;
    const fatCalories = recommendations.macroRecommendation.fat * 9;
    const remainingCalories = recommendations.calorieRecommendation - proteinCalories - fatCalories;
    recommendations.macroRecommendation.carbs = Math.round(remainingCalories / 4);
  }
  
  return recommendations;
};

/**
 * Converts a file to base64
 * @param {string} uri - URI of the file
 * @returns {Promise<string>} Base64-encoded file content
 * @private
 */
const fileToBase64 = async (uri) => {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  
  if (!fileInfo.exists) {
    throw new Error('File does not exist');
  }
  
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  return base64;
};

/**
 * Generates a unique ID for a food entry
 * @returns {string} Unique ID
 * @private
 */
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};