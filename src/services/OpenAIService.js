import * as FileSystem from 'expo-file-system';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Allow running in browser/client for demo purposes
});

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
    if (!process.env.OPENAI_API_KEY) {
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
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, using demo data');
      return getDemoFoodData('text', text);
    }
    
    // Call OpenAI to analyze the text
    const response = await openai.chat.completions.create({
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
 * Analyzes user fitness data to provide personalized recommendations
 * @param {Object} userData - User fitness and profile data
 * @returns {Promise<Object>} Personalized recommendations
 */
export const analyzeFitnessGoals = async (userData) => {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, using demo data');
      return getDemoFitnessRecommendations(userData);
    }
    
    // Format user data for the prompt
    const userDataString = JSON.stringify(userData, null, 2);
    
    // Call OpenAI to analyze the user's fitness data
    const response = await openai.chat.completions.create({
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
      fat: 15,
      fiber: 3,
      sugar: 5,
      description: "Food based on your description.",
      tips: "For more accurate nutrition information, try providing more details about ingredients and portions."
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
      "Stay hydrated by drinking at least 8 glasses of water daily",
      "Include a source of protein with each meal",
      "Aim for 5 servings of fruits and vegetables daily"
    ],
    exerciseRecommendations: [
      "Incorporate at least 150 minutes of moderate activity each week",
      "Add 2-3 strength training sessions to your weekly routine",
      "Take short walking breaks throughout the day to reduce sitting time"
    ],
    dietaryAdjustments: [
      "Limit processed foods and added sugars",
      "Choose whole grains over refined carbohydrates",
      "Include healthy fats like avocados, nuts, and olive oil"
    ],
    weeklyGoals: [
      "Track your food intake for at least 5 days this week",
      "Reach your daily step goal at least 4 days this week",
      "Try one new healthy recipe"
    ],
    motivationalMessage: "Remember that consistency is key! Small, sustainable changes lead to the best long-term results."
  };
  
  // Customize based on fitness goal
  if (fitnessGoal === 'lose') {
    recommendations.nutritionTips[1] = "Focus on high protein foods to help preserve muscle mass";
    recommendations.dietaryAdjustments[0] = "Create a modest calorie deficit of 300-500 calories per day";
    recommendations.weeklyGoals[0] = "Stay within your calorie goal at least 5 days this week";
    recommendations.motivationalMessage = "Focus on your health improvements, not just the number on the scale. You're making progress every day!";
  } else if (fitnessGoal === 'gain') {
    recommendations.nutritionTips[1] = "Increase protein intake to support muscle growth";
    recommendations.dietaryAdjustments[0] = "Aim for a calorie surplus of 300-500 calories per day";
    recommendations.weeklyGoals[0] = "Meet your calorie and protein goals at least 5 days this week";
    recommendations.motivationalMessage = "Building strength takes time. Trust the process and stay consistent with your nutrition and training!";
  }
  
  return recommendations;
};

/**
 * Process the food image using OpenAI Vision API
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Nutritional information
 * @private
 */
const processFoodImage = async (base64Image) => {
  // Call OpenAI to analyze the image
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: IMAGE_ANALYSIS_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
          {
            type: "text",
            text: "Analyze this food image and provide detailed nutritional information.",
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  
  // Parse the response
  const result = JSON.parse(response.choices[0].message.content);
  
  // Suggest meal type based on time if not provided
  if (!result.mealType) {
    result.mealType = suggestMealTypeByTime();
  }
  
  return result;
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
  } else if (hour >= 10 && hour < 14) {
    return 'lunch';
  } else if (hour >= 14 && hour < 18) {
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
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};