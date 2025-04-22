import * as FileSystem from 'expo-file-system';
import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variables
// Get API key from the Replit environment
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.REPLIT_OPENAI_API_KEY
});

/**
 * Analyzes a food image to extract nutritional information
 * @param {string} imageUri - Local URI of the food image to analyze
 * @returns {Promise<Object>} Nutritional information
 */
export const analyzeFoodImage = async (imageUri) => {
  try {
    // Use a simplified approach to handle images
    let base64Image;
    
    try {
      // Try to read the image file as base64 using FileSystem
      base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (fileError) {
      console.error('Error reading image file:', fileError);
      // Fallback to text analysis if image reading fails
      return analyzeFoodText("A plate of food (image analysis failed, please describe the food)");
    }

    // Prepare the prompt for image analysis
    const prompt = `
      Please analyze this food image and provide detailed nutritional information in JSON format.
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

    try {
      // Call the OpenAI API with the image
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
      let nutritionData;
      try {
        nutritionData = JSON.parse(response.choices[0].message.content);
        // Make sure all numeric values are actually numbers
        nutritionData.calories = Number(nutritionData.calories) || 0;
        nutritionData.protein = Number(nutritionData.protein) || 0;
        nutritionData.carbs = Number(nutritionData.carbs) || 0;
        nutritionData.fat = Number(nutritionData.fat) || 0;
        nutritionData.fiber = Number(nutritionData.fiber) || 0;
        nutritionData.sugar = Number(nutritionData.sugar) || 0;
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response format from AI model');
      }
      
      // Add method information
      nutritionData.method = 'image';
      
      return nutritionData;
    } catch (aiError) {
      console.error('Error calling OpenAI API:', aiError);
      throw aiError;
    }
    
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
};

/**
 * Analyzes food description text to extract nutritional information
 * @param {string} text - Description of the food
 * @returns {Promise<Object>} Nutritional information
 */
export const analyzeFoodText = async (text) => {
  try {
    // Prepare the prompt for text analysis
    const prompt = `
      Please analyze this food description and provide detailed nutritional information in JSON format.
      Food description: "${text}"
      
      Include the following fields:
      - name: The name of the food
      - calories: Total calories
      - protein: Protein in grams
      - carbs: Carbohydrates in grams
      - fat: Fat in grams
      - fiber: Fiber in grams
      - sugar: Sugar in grams
      - serving_size: Serving size (e.g., "1 cup", "100g")
      - ingredients: Array of main ingredients
      - health_benefits: Array of health benefits
      - concerns: Array of potential health concerns or allergens
      
      Return only valid JSON with these fields.
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    // Parse and return the nutrition data
    const nutritionData = JSON.parse(response.choices[0].message.content);
    
    // Add method information
    nutritionData.method = 'text';
    
    return nutritionData;
    
  } catch (error) {
    console.error('Error analyzing food text:', error);
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
      - Dietary Restrictions: ${dietaryRestrictions.join(', ')}
      
      Health Metrics:
      - BMI: ${bmi}
      - BMR: ${bmr} calories/day
      - TDEE: ${tdee} calories/day
      - Calorie Goal: ${calorieGoal} calories/day
      - Macro Goals: Protein: ${macroGoals.protein}g, Carbs: ${macroGoals.carbs}g, Fat: ${macroGoals.fat}g
      
      Based on this information, provide personalized recommendations in JSON format with these fields:
      - recommendations: Array of 3-5 specific, actionable recommendations for diet and exercise
      - meal_suggestions: Array of 3 meal ideas that match their goals and restrictions
      - focus_areas: Array of 2-3 areas to focus on for best results
      
      Return only valid JSON with these fields.
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    throw error;
  }
};