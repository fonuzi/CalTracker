import * as FileSystem from 'expo-file-system';
import OpenAI from 'openai';
import { suggestMealTypeByTime } from '../utils/foodAnalysis';

// Initialize OpenAI client with proper error handling
let openaiClient = null;
let apiKeyMissing = false;

try {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (apiKey && apiKey.length > 0) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Allow running in browser/client for demo purposes
    });
  } else {
    apiKeyMissing = true;
    console.warn('OpenAI API key is missing or empty');
  }
} catch (error) {
  apiKeyMissing = true;
  console.warn('Failed to initialize OpenAI client:', error.message);
}

// The system prompt template for food analysis
const FOOD_ANALYSIS_PROMPT = `
You are a nutritional analysis AI that helps users track their food intake.
Analyze the provided food description or image and extract detailed nutritional information.

Please format your response as valid JSON with the following structure:
{
  "name": "Food Name",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "fiber": number (in grams),
  "sugar": number (in grams),
  "mealType": "breakfast|lunch|dinner|snack",
  "healthScore": number (scale of 1-10),
  "description": "brief description of the nutritional profile",
  "tips": "health advice related to this food"
}

Make your best estimate based on what you see or what is described. Be as accurate as possible.
If given an image, identify the food, estimate portion size, and provide nutrition details.
`;

// For text-based food analysis prompt
const TEXT_ANALYSIS_PROMPT = `
${FOOD_ANALYSIS_PROMPT}
Make sure to account for portion sizes and cooking methods mentioned in the text.
If the description is vague, make reasonable assumptions and state them in your response.
`;

// For image-based food analysis prompt
const IMAGE_ANALYSIS_PROMPT = `
${FOOD_ANALYSIS_PROMPT}
Identify the food items in the image, estimate portion sizes, and analyze their nutritional content.
Consider visible preparation methods (fried, grilled, etc.) in your analysis.
`;

/**
 * Analyzes a food image to extract nutritional information
 * @param {string} imageUri - Local URI of the food image to analyze
 * @returns {Promise<Object>} Nutritional information
 */
export const analyzeFoodImage = async (imageUri) => {
  try {
    // Check if OpenAI API key is available
    if (apiKeyMissing || !openaiClient) {
      console.warn('OpenAI API key not available, using demo data');
      return getDemoFoodData('image');
    }
    
    // Convert image to base64
    let base64Image;
    
    if (imageUri.startsWith('data:image')) {
      // Already a data URI, extract the base64 part
      base64Image = imageUri.split(',')[1];
    } else {
      // Read file as base64
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }
      
      base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
    
    // Process the image
    const result = await processFoodImage(base64Image);
    
    // Generate a unique ID for the food entry
    result.id = generateId();
    
    // Add timestamp
    result.timestamp = new Date().toISOString();
    
    return result;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    
    // Return demo data in case of error
    console.warn('Using demo data due to error');
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
    // Check if OpenAI API key is available
    if (apiKeyMissing || !openaiClient) {
      console.warn('OpenAI API key not available, using demo data');
      return getDemoFoodData('text', text);
    }
    
    // Call OpenAI to analyze the text
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: TEXT_ANALYSIS_PROMPT },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    // Parse the response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Generate a unique ID for the food entry
    result.id = generateId();
    
    // Add timestamp
    result.timestamp = new Date().toISOString();
    
    // Suggest meal type based on time if not provided
    if (!result.mealType) {
      result.mealType = suggestMealTypeByTime();
    }
    
    return result;
  } catch (error) {
    console.error('Error analyzing food text:', error);
    
    // Return demo data in case of error
    console.warn('Using demo data due to error');
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
  try {
    // Call OpenAI Vision API
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: IMAGE_ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this food image and provide nutritional information:" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });
    
    // Parse the response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Suggest meal type based on time if not provided
    if (!result.mealType) {
      result.mealType = suggestMealTypeByTime();
    }
    
    return result;
  } catch (error) {
    console.error('Error processing food image:', error);
    throw error;
  }
};

/**
 * Analyzes user fitness data to provide personalized recommendations
 * @param {Object} userData - User fitness and profile data
 * @returns {Promise<Object>} Personalized recommendations
 */
export const analyzeFitnessGoals = async (userData) => {
  try {
    // Check if OpenAI API key is available
    if (apiKeyMissing || !openaiClient) {
      console.warn('OpenAI API key not available, using demo data');
      return getDemoFitnessRecommendations(userData);
    }
    
    // Format user data for the prompt
    const userDataString = JSON.stringify(userData, null, 2);
    
    // Call OpenAI to analyze the user's fitness data
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `
          You are a personal nutrition and fitness coach AI. 
          Based on the user's profile, dietary information, and exercise habits, provide personalized recommendations.
          
          Please format your response as valid JSON with the following structure:
          {
            "nutritionTips": [
              "tip 1",
              "tip 2",
              "tip 3"
            ],
            "exerciseRecommendations": [
              "recommendation 1",
              "recommendation 2",
              "recommendation 3"
            ],
            "dietaryAdjustments": [
              "adjustment 1",
              "adjustment 2",
              "adjustment 3"
            ],
            "weeklyGoals": [
              "goal 1", 
              "goal 2",
              "goal 3"
            ],
            "motivationalMessage": "A personalized motivational message"
          }
          
          Make your recommendations specific to the user's goals, current metrics, and any health conditions they mentioned.
          Be encouraging but realistic about what they can achieve.
          `
        },
        {
          role: "user",
          content: `Here is my profile and fitness data: ${userDataString}. Please provide personalized recommendations.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    // Parse the response
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing fitness goals:', error);
    
    // Return demo data in case of error
    console.warn('Using demo data due to error');
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
  // Demo data for when OpenAI API is not available
  if (method === 'text' && text) {
    return getDemoFoodDataFromText(text);
  }
  
  return {
    id: generateId(),
    name: "Grilled Chicken Salad",
    calories: 350,
    protein: 30,
    carbs: 15,
    fat: 18,
    fiber: 5,
    sugar: 3,
    mealType: suggestMealTypeByTime(),
    healthScore: 8,
    description: "A nutritious salad with grilled chicken, mixed greens, vegetables, and a light dressing.",
    tips: "This balanced meal provides lean protein and healthy fats. Consider adding more vegetables for additional fiber.",
    timestamp: new Date().toISOString()
  };
};

/**
 * Gets demo food data based on text description
 * @param {string} text - Food description
 * @returns {Object} Demo food data tailored to the text
 * @private
 */
const getDemoFoodDataFromText = (text) => {
  const lowercaseText = text.toLowerCase();
  let result = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    mealType: suggestMealTypeByTime(),
    healthScore: 5,
  };
  
  // Try to extract some meaningful data from the text
  if (lowercaseText.includes('salad')) {
    result = {
      ...result,
      name: "Mixed Salad",
      calories: 250,
      protein: 8,
      carbs: 15,
      fat: 12,
      fiber: 5,
      sugar: 3,
      healthScore: 9,
      description: "A fresh salad with mixed greens and vegetables.",
      tips: "Add a source of protein like chicken or tofu to make this a more complete meal."
    };
  } else if (lowercaseText.includes('burger') || lowercaseText.includes('hamburger')) {
    result = {
      ...result,
      name: "Hamburger",
      calories: 550,
      protein: 25,
      carbs: 40,
      fat: 30,
      fiber: 2,
      sugar: 8,
      healthScore: 4,
      description: "A beef burger with standard toppings.",
      tips: "Consider choosing leaner meats or plant-based alternatives to reduce saturated fat intake."
    };
  } else if (lowercaseText.includes('chicken')) {
    result = {
      ...result,
      name: "Chicken Dish",
      calories: 350,
      protein: 30,
      carbs: 15,
      fat: 18,
      fiber: 2,
      sugar: 1,
      healthScore: 7,
      description: "A chicken-based dish with some vegetables.",
      tips: "Chicken is a great source of lean protein. Pair with complex carbs and vegetables for a balanced meal."
    };
  } else if (lowercaseText.includes('pasta') || lowercaseText.includes('spaghetti')) {
    result = {
      ...result,
      name: "Pasta Dish",
      calories: 450,
      protein: 15,
      carbs: 65,
      fat: 12,
      fiber: 3,
      sugar: 6,
      healthScore: 6,
      description: "A pasta dish with sauce and some protein.",
      tips: "Consider whole grain pasta for more fiber and nutrients. Add vegetables to balance the meal."
    };
  } else if (lowercaseText.includes('fruit') || lowercaseText.includes('apple') || lowercaseText.includes('banana')) {
    result = {
      ...result,
      name: "Fresh Fruit",
      calories: 100,
      protein: 1,
      carbs: 25,
      fat: 0,
      fiber: 4,
      sugar: 18,
      healthScore: 8,
      description: "Fresh fruit serving.",
      tips: "Fruits are great sources of vitamins, minerals, and fiber. Pair with protein for a more satisfying snack."
    };
  } else {
    // Generic response if nothing specific is detected
    result = {
      ...result,
      name: text.length > 30 ? text.substring(0, 30) + "..." : text,
      calories: 300,
      protein: 15,
      carbs: 30,
      fat: 10,
      fiber: 2,
      sugar: 5,
      healthScore: 6,
      description: "Food item with estimated nutritional values.",
      tips: "For more accurate nutrition tracking, provide more details about ingredients and portion sizes."
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
  const fitnessGoal = userData?.fitnessGoal || 'maintain';
  
  // Base recommendations
  const recommendations = {
    nutritionTips: [
      "Aim to eat a variety of colorful vegetables with each meal",
      "Stay hydrated by drinking water throughout the day",
      "Include protein with each meal to help with satiety and muscle maintenance"
    ],
    exerciseRecommendations: [
      "Try to accumulate at least 150 minutes of moderate exercise each week",
      "Include both cardio and strength training in your routine",
      "Take active breaks during the day if you have a sedentary job"
    ],
    dietaryAdjustments: [
      "Be mindful of portion sizes, especially for calorie-dense foods",
      "Limit added sugars and highly processed foods",
      "Choose whole grains over refined carbohydrates when possible"
    ],
    weeklyGoals: [
      "Track your food intake consistently", 
      "Aim for 8,000-10,000 steps daily",
      "Prepare healthy meals at home more often than eating out"
    ],
    motivationalMessage: "Small, consistent actions lead to big results over time. Focus on sustainable changes rather than quick fixes!"
  };
  
  // Customize based on fitness goal
  if (fitnessGoal === 'lose') {
    recommendations.nutritionTips.unshift("Create a modest calorie deficit of 300-500 calories per day for sustainable weight loss");
    recommendations.exerciseRecommendations.unshift("Add an extra 20-30 minutes of cardio 2-3 times per week to support your calorie deficit");
    recommendations.motivationalMessage = "Weight loss is a journey with ups and downs. Focus on consistency rather than perfection, and celebrate your non-scale victories!";
  } else if (fitnessGoal === 'gain') {
    recommendations.nutritionTips.unshift("Eat in a slight calorie surplus of 300-500 calories per day to support muscle growth");
    recommendations.exerciseRecommendations.unshift("Prioritize progressive resistance training 3-4 times per week");
    recommendations.motivationalMessage = "Building muscle takes time and consistency. Focus on gradually increasing your strength and fueling your body properly!";
  } else if (fitnessGoal === 'maintain') {
    recommendations.nutritionTips.unshift("Balance your calorie intake with your energy expenditure to maintain your current weight");
    recommendations.exerciseRecommendations.unshift("Mix up your exercise routine to keep it interesting and challenge different muscle groups");
    recommendations.motivationalMessage = "Maintaining a healthy lifestyle is a marathon, not a sprint. Focus on finding sustainable habits you enjoy!";
  }
  
  return recommendations;
};

/**
 * Generates a unique ID for a food entry
 * @returns {string} Unique ID
 * @private
 */
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

/**
 * Suggests a meal type based on the current time
 * @returns {string} Suggested meal type
 * @private
 */
const suggestMealTypeByTimeInternal = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 10) {
    return 'breakfast';
  } else if (hour >= 10 && hour < 14) {
    return 'lunch';
  } else if (hour >= 14 && hour < 17) {
    return 'snack';
  } else if (hour >= 17 && hour < 21) {
    return 'dinner';
  } else {
    return 'snack';
  }
};