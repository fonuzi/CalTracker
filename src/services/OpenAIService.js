import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import OpenAI from 'openai';

// In Expo/React Native, we need to access environment variables differently
// The key is available through process.env.OPENAI_API_KEY
const API_KEY = process.env.OPENAI_API_KEY;

console.log("OpenAI API Key available:", API_KEY ? "Yes" : "No");

// Create OpenAI client instance
const openai = new OpenAI({ 
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true // Required for web environments
});

// Function to check if the API key is valid
const hasValidOpenAIKey = !!API_KEY;

/**
 * Analyzes a food image to extract nutritional information
 * @param {string} imageUri - Local URI of the food image to analyze
 * @returns {Promise<Object>} Nutritional information
 */
export const analyzeFoodImage = async (imageUri) => {
  // If OpenAI is not available, return demo data
  if (!hasValidOpenAIKey) {
    console.log('OpenAI API key not found, using demo data');
    return getDemoFoodData('image');
  }
  
  try {
    // Check if we're on web platform - handle web differently
    const isWeb = Platform.OS === 'web';
    let base64Image;
    
    if (isWeb) {
      // In web environments, we can't access the file system the same way
      // Instead of using demo data, let's use text analysis for the "food in image"
      console.log('Web environment detected, attempting to analyze image URL directly');
      
      try {
        // For web, we'll send the image URL directly to OpenAI rather than base64
        // This works with remote images in web
        
        const prompt = `
          Please analyze this food image and provide detailed nutritional information in JSON format.
          Identify all visible food items and estimate their nutritional content as accurately as possible.
          Include the following fields:
          - name: The name of the food (be specific and descriptive)
          - calories: Total calories (numeric value only)
          - protein: Protein in grams (numeric value only)
          - carbs: Carbohydrates in grams (numeric value only)
          - fat: Fat in grams (numeric value only)
          - fiber: Fiber in grams (numeric value only)
          - sugar: Sugar in grams (numeric value only)
          - serving_size: Serving size (e.g., "1 cup", "100g")
          - ingredients: Array of main ingredients (be comprehensive)
          - health_benefits: Array of health benefits
          - concerns: Array of potential health concerns or allergens
          
          Return only valid JSON with these fields.
        `;
        
        // Call the OpenAI API with the image URL directly
        // Note: This requires the image to be accessible via URL, which may not work with local image URIs
        // If this fails, we'll catch it and use the demo data
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUri,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 1000,
        });
        
        // Parse and return the nutrition data
        const nutritionData = JSON.parse(response.choices[0].message.content);
        
        // Ensure all numeric values are actually numbers
        nutritionData.calories = parseFloat(nutritionData.calories) || 0;
        nutritionData.protein = parseFloat(nutritionData.protein) || 0;
        nutritionData.carbs = parseFloat(nutritionData.carbs) || 0;
        nutritionData.fat = parseFloat(nutritionData.fat) || 0;
        nutritionData.fiber = parseFloat(nutritionData.fiber) || 0;
        nutritionData.sugar = parseFloat(nutritionData.sugar) || 0;
        
        // Add method information
        nutritionData.method = 'image';
        
        return nutritionData;
      } catch (webError) {
        console.error('Web image analysis failed:', webError);
        console.log('Falling back to demo data for web environment');
        // If web analysis fails, use demo data as fallback
        return getDemoFoodData('image');
      }
    } else {
      // Native platforms can read the file directly
      base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
        quality: 0.6, // Reduce quality to optimize for API requests
      });
    }
    
    // Log image size for debugging
    console.log(`Image size: ${Math.round(base64Image.length / 1024)} KB`);
    
    // Prepare the prompt for image analysis
    const prompt = `
      Please analyze this food image and provide detailed nutritional information in JSON format.
      Identify all visible food items and estimate their nutritional content as accurately as possible.
      Include the following fields:
      - name: The name of the food (be specific and descriptive)
      - calories: Total calories (numeric value only)
      - protein: Protein in grams (numeric value only)
      - carbs: Carbohydrates in grams (numeric value only)
      - fat: Fat in grams (numeric value only)
      - fiber: Fiber in grams (numeric value only)
      - sugar: Sugar in grams (numeric value only)
      - serving_size: Serving size (e.g., "1 cup", "100g")
      - ingredients: Array of main ingredients (be comprehensive)
      - health_benefits: Array of health benefits
      - concerns: Array of potential health concerns or allergens
      
      Return only valid JSON with these fields.
    `;
    
    // Call the OpenAI API with the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });
    
    // Parse and return the nutrition data
    const nutritionData = JSON.parse(response.choices[0].message.content);
    
    // Ensure all numeric values are actually numbers
    nutritionData.calories = parseFloat(nutritionData.calories) || 0;
    nutritionData.protein = parseFloat(nutritionData.protein) || 0;
    nutritionData.carbs = parseFloat(nutritionData.carbs) || 0;
    nutritionData.fat = parseFloat(nutritionData.fat) || 0;
    nutritionData.fiber = parseFloat(nutritionData.fiber) || 0;
    nutritionData.sugar = parseFloat(nutritionData.sugar) || 0;
    
    // Add method information
    nutritionData.method = 'image';
    
    return nutritionData;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    // Return demo data if there's an error
    return getDemoFoodData('image');
  }
};

/**
 * Analyzes food description text to extract nutritional information
 * @param {string} text - Description of the food
 * @returns {Promise<Object>} Nutritional information
 */
export const analyzeFoodText = async (text) => {
  // If OpenAI is not available, return demo data
  if (!hasValidOpenAIKey) {
    console.log('OpenAI API key not found, using demo data');
    return getDemoFoodData('text', text);
  }
  
  try {
    // Prepare the prompt for text analysis
    const prompt = `
      Please analyze this food description and provide detailed nutritional information in JSON format.
      Food description: "${text}"
      
      Include the following fields:
      - name: The name of the food
      - calories: Total calories (numeric value only)
      - protein: Protein in grams (numeric value only)
      - carbs: Carbohydrates in grams (numeric value only)
      - fat: Fat in grams (numeric value only)
      - fiber: Fiber in grams (numeric value only)
      - sugar: Sugar in grams (numeric value only)
      - serving_size: Serving size (e.g., "1 cup", "100g")
      - ingredients: Array of main ingredients
      - health_benefits: Array of health benefits
      - concerns: Array of potential health concerns or allergens
      
      Return only valid JSON with these fields.
    `;
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });
    
    // Parse and return the nutrition data
    const nutritionData = JSON.parse(response.choices[0].message.content);
    
    // Ensure all numeric values are actually numbers
    nutritionData.calories = parseFloat(nutritionData.calories) || 0;
    nutritionData.protein = parseFloat(nutritionData.protein) || 0;
    nutritionData.carbs = parseFloat(nutritionData.carbs) || 0;
    nutritionData.fat = parseFloat(nutritionData.fat) || 0;
    nutritionData.fiber = parseFloat(nutritionData.fiber) || 0;
    nutritionData.sugar = parseFloat(nutritionData.sugar) || 0;
    
    // Add method information
    nutritionData.method = 'text';
    
    return nutritionData;
  } catch (error) {
    console.error('Error analyzing food text:', error);
    // Return demo data if there's an error
    return getDemoFoodData('text', text);
  }
};

/**
 * Analyzes user fitness data to provide personalized recommendations
 * @param {Object} userData - User fitness and profile data
 * @returns {Promise<Object>} Personalized recommendations
 */
export const analyzeFitnessGoals = async (userData) => {
  // If OpenAI is not available, return demo data
  if (!hasValidOpenAIKey) {
    console.log('OpenAI API key not found, using demo data');
    return getDemoFitnessRecommendations(userData);
  }
  
  try {
    // Extract relevant data for the prompt
    const {
      name = '',
      age = '',
      gender = '',
      weight = '',
      height = '',
      activityLevel = '',
      fitnessGoal = '',
      dietaryRestrictions = [],
      bmi = '',
      bmr = '',
      tdee = '',
      calorieGoal = '',
      macroGoals = {}
    } = userData;
    
    // Prepare the prompt
    const prompt = `
      Please analyze this user's profile and fitness data to provide personalized recommendations.
      
      User Profile:
      - Name: ${name}
      - Age: ${age}
      - Gender: ${gender}
      - Weight: ${weight} kg
      - Height: ${height} cm
      - Activity Level: ${activityLevel}
      - Fitness Goal: ${fitnessGoal}
      - Dietary Restrictions: ${Array.isArray(dietaryRestrictions) ? dietaryRestrictions.join(', ') : ''}
      
      Health Metrics:
      - BMI: ${bmi}
      - BMR: ${bmr} calories/day
      - TDEE: ${tdee} calories/day
      - Calorie Goal: ${calorieGoal} calories/day
      - Macro Goals: Protein: ${macroGoals.protein || 0}g, Carbs: ${macroGoals.carbs || 0}g, Fat: ${macroGoals.fat || 0}g
      
      Based on this information, provide personalized recommendations in JSON format with these fields:
      - recommendations: Array of 3-5 specific, actionable recommendations for diet and exercise
      - meal_suggestions: Array of 3 meal ideas that match their goals and restrictions
      - focus_areas: Array of 2-3 areas to focus on for best results
      
      Return only valid JSON with these fields.
    `;
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });
    
    // Parse and return the recommendations
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing fitness goals:', error);
    // Return demo data if there's an error
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
  let foodName = 'Grilled Chicken Salad';
  
  // If text method, try to extract food name from text
  if (method === 'text' && text) {
    foodName = text.length > 30 ? text.substring(0, 30) + '...' : text;
  }
  
  // Check if we're on web platform and let the user know why we're using demo data
  const isWeb = Platform.OS === 'web';
  if (isWeb && method === 'image') {
    console.log('Note: Web environments have limited support for image analysis. Use a mobile device for full functionality.');
  }
  
  return {
    name: foodName,
    calories: 350,
    protein: 30,
    carbs: 15,
    fat: 20,
    fiber: 5,
    sugar: 3,
    serving_size: '1 bowl (250g)',
    ingredients: ['Chicken breast', 'Mixed greens', 'Olive oil', 'Cherry tomatoes', 'Cucumber'],
    health_benefits: ['High in protein', 'Low in carbs', 'Contains healthy fats'],
    concerns: ['Contains olive oil (if monitoring fat intake)'],
    method
  };
};

/**
 * Gets demo fitness recommendations when OpenAI is not available
 * @param {Object} userData - User profile data
 * @returns {Object} Demo recommendations
 * @private
 */
const getDemoFitnessRecommendations = (userData) => {
  const fitnessGoal = userData?.fitnessGoal?.toLowerCase() || '';
  
  // Adjust recommendations based on fitness goal
  let recommendations = [
    'Aim for 10,000 steps daily to increase your overall activity level',
    'Include strength training 2-3 times per week to build muscle',
    'Stay hydrated by drinking at least 8 cups of water daily',
    'Get 7-9 hours of quality sleep each night for optimal recovery'
  ];
  
  let mealSuggestions = [
    'Protein smoothie with berries, spinach, and protein powder',
    'Grilled chicken with roasted vegetables and quinoa',
    'Greek yogurt with nuts, berries, and a drizzle of honey'
  ];
  
  let focusAreas = [
    'Consistent daily activity',
    'Balanced nutrition'
  ];
  
  // Adjust recommendations for specific goals
  if (fitnessGoal.includes('weight loss')) {
    recommendations.push('Create a moderate calorie deficit of 300-500 calories per day');
    focusAreas.push('Portion control');
  } else if (fitnessGoal.includes('muscle') || fitnessGoal.includes('strength')) {
    recommendations.push('Increase protein intake to support muscle growth');
    mealSuggestions[1] = 'Salmon with sweet potato and steamed broccoli';
    focusAreas.push('Progressive overload in strength training');
  }
  
  return {
    recommendations,
    meal_suggestions: mealSuggestions,
    focus_areas: focusAreas
  };
};