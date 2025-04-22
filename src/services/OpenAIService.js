import * as FileSystem from 'expo-file-system';
import OpenAI from 'openai';

// Initialize OpenAI API with environment variable
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyzes a food image to extract nutritional information
 * @param {string} imageUri - Local URI of the food image to analyze
 * @returns {Promise<Object>} Nutritional information
 */
export const analyzeFoodImage = async (imageUri) => {
  try {
    // Convert the image to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Send the image to OpenAI API for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a nutrition analysis expert. Analyze the image of food and provide detailed nutritional information in JSON format with the following structure:
          {
            "name": "Name of the food",
            "calories": total calories,
            "protein": grams of protein,
            "carbs": grams of carbohydrates,
            "fat": grams of fat,
            "fiber": grams of fiber,
            "sugar": grams of sugar,
            "serving_size": "estimated serving size",
            "ingredients": ["list", "of", "ingredients"],
            "health_benefits": ["list", "of", "health", "benefits"],
            "concerns": ["list", "of", "potential", "health", "concerns"]
          }
          
          Make reasonable estimations based on what you can see in the image. If you're uncertain about specific values, provide your best estimate.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food and provide detailed nutritional information."
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

    // Parse and return the result
    const nutritionData = JSON.parse(response.choices[0].message.content);
    return {
      ...nutritionData,
      analyzed_at: new Date().toISOString(),
      method: 'image',
    };
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a nutrition analysis expert. Analyze the food description and provide detailed nutritional information in JSON format with the following structure:
          {
            "name": "Name of the food",
            "calories": total calories,
            "protein": grams of protein,
            "carbs": grams of carbohydrates,
            "fat": grams of fat,
            "fiber": grams of fiber,
            "sugar": grams of sugar,
            "serving_size": "estimated serving size",
            "ingredients": ["list", "of", "ingredients"],
            "health_benefits": ["list", "of", "health", "benefits"],
            "concerns": ["list", "of", "potential", "health", "concerns"]
          }
          
          Make reasonable estimations based on the description. If you're uncertain about specific values, provide your best estimate.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse and return the result
    const nutritionData = JSON.parse(response.choices[0].message.content);
    return {
      ...nutritionData,
      analyzed_at: new Date().toISOString(),
      method: 'text',
    };
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a fitness and nutrition expert. Analyze the user's profile data and provide personalized recommendations in JSON format with the following structure:
          {
            "recommendedCalories": daily calorie target (number),
            "macroBreakdown": {
              "protein": percentage of protein (number),
              "carbs": percentage of carbohydrates (number),
              "fat": percentage of fat (number)
            },
            "proteinGrams": daily protein target in grams (number),
            "carbsGrams": daily carbohydrates target in grams (number),
            "fatGrams": daily fat target in grams (number),
            "recommendedMeals": [
              { "name": "meal name", "timing": "time of day", "description": "description" }
            ],
            "recommendations": ["list", "of", "personalized", "recommendations"],
            "warnings": ["list", "of", "health", "warnings", "if", "applicable"]
          }
          
          Calculate values based on established nutrition and fitness guidelines. If the user's goal is weight loss, aim for a moderate calorie deficit. If it's muscle gain, recommend a slight calorie surplus.`
        },
        {
          role: "user",
          content: JSON.stringify(userData)
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse and return the result
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing fitness goals:', error);
    throw error;
  }
};