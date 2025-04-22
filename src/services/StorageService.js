import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  USER_PROFILE: 'nutritrack_user_profile',
  FOOD_LOGS_PREFIX: 'nutritrack_food_logs_',
  FOOD_LOG_DATES: 'nutritrack_food_log_dates',
  APP_SETTINGS: 'nutritrack_app_settings',
  ONBOARDING_COMPLETED: 'nutritrack_onboarding_completed',
};

/**
 * Saves a user profile to local storage
 * @param {Object} profile - User profile data
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

/**
 * Gets the user profile from local storage
 * @returns {Promise<Object|null>} User profile data or null if not found
 */
export const getUserProfile = async () => {
  try {
    const profileJson = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return profileJson ? JSON.parse(profileJson) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Saves a food log entry to local storage
 * @param {Object} food - Food log entry data
 * @returns {Promise<void>}
 */
export const saveFoodLog = async (food) => {
  try {
    // Ensure food has required properties
    if (!food.id || !food.timestamp) {
      throw new Error('Food log entry must have id and timestamp');
    }
    
    // Extract date from timestamp (YYYY-MM-DD)
    const date = food.timestamp.split('T')[0];
    
    // Get existing logs for the date
    const existingLogsJson = await AsyncStorage.getItem(`${KEYS.FOOD_LOGS_PREFIX}${date}`);
    const existingLogs = existingLogsJson ? JSON.parse(existingLogsJson) : [];
    
    // Check if the food entry already exists
    const foodIndex = existingLogs.findIndex(item => item.id === food.id);
    
    // Update or add the food entry
    if (foodIndex !== -1) {
      existingLogs[foodIndex] = food;
    } else {
      existingLogs.push(food);
    }
    
    // Save the updated logs
    await AsyncStorage.setItem(`${KEYS.FOOD_LOGS_PREFIX}${date}`, JSON.stringify(existingLogs));
    
    // Update the list of dates with food logs
    await updateFoodLogDates(date);
  } catch (error) {
    console.error('Error saving food log:', error);
    throw error;
  }
};

/**
 * Gets all food logs for a specific date
 * @param {string} date - Date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of food log entries
 */
export const getFoodLogs = async (date) => {
  try {
    const logsJson = await AsyncStorage.getItem(`${KEYS.FOOD_LOGS_PREFIX}${date}`);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Error getting food logs:', error);
    return [];
  }
};

/**
 * Deletes a food log entry
 * @param {string} id - ID of the food log entry to delete
 * @returns {Promise<void>}
 */
export const deleteFoodLog = async (id) => {
  try {
    // Get all dates with food logs
    const dates = await getFoodLogDates();
    
    // Check each date for the food log entry
    for (const date of dates) {
      const logs = await getFoodLogs(date);
      const filteredLogs = logs.filter(log => log.id !== id);
      
      // If the filtered logs array is different in length, the entry was found and removed
      if (filteredLogs.length !== logs.length) {
        await AsyncStorage.setItem(`${KEYS.FOOD_LOGS_PREFIX}${date}`, JSON.stringify(filteredLogs));
        
        // If there are no more logs for this date, remove the date from the list
        if (filteredLogs.length === 0) {
          const updatedDates = dates.filter(d => d !== date);
          await AsyncStorage.setItem(KEYS.FOOD_LOG_DATES, JSON.stringify(updatedDates));
        }
        
        break;
      }
    }
  } catch (error) {
    console.error('Error deleting food log:', error);
    throw error;
  }
};

/**
 * Gets all dates that have food logs
 * @returns {Promise<Array>} Array of dates in ISO format (YYYY-MM-DD)
 */
export const getFoodLogDates = async () => {
  try {
    const datesJson = await AsyncStorage.getItem(KEYS.FOOD_LOG_DATES);
    return datesJson ? JSON.parse(datesJson) : [];
  } catch (error) {
    console.error('Error getting food log dates:', error);
    return [];
  }
};

/**
 * Updates the list of dates that have food logs
 * @param {string} date - Date in ISO format (YYYY-MM-DD)
 * @returns {Promise<void>}
 * @private
 */
const updateFoodLogDates = async (date) => {
  try {
    const datesJson = await AsyncStorage.getItem(KEYS.FOOD_LOG_DATES);
    const dates = datesJson ? JSON.parse(datesJson) : [];
    
    // Add the date if it's not already in the list
    if (!dates.includes(date)) {
      dates.push(date);
      dates.sort(); // Keep dates in chronological order
      await AsyncStorage.setItem(KEYS.FOOD_LOG_DATES, JSON.stringify(dates));
    }
  } catch (error) {
    console.error('Error updating food log dates:', error);
    throw error;
  }
};

/**
 * Gets food logs for a date range
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Object>} Object with dates as keys and arrays of food logs as values
 */
export const getFoodLogsForDateRange = async (startDate, endDate) => {
  try {
    const result = {};
    const allDates = await getFoodLogDates();
    
    // Filter dates in the requested range
    const datesInRange = allDates.filter(date => date >= startDate && date <= endDate);
    
    // Get logs for each date
    for (const date of datesInRange) {
      const logs = await getFoodLogs(date);
      if (logs.length > 0) {
        result[date] = logs;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error getting food logs for date range:', error);
    return {};
  }
};

/**
 * Saves app settings to local storage
 * @param {Object} settings - App settings
 * @returns {Promise<void>}
 */
export const saveAppSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(KEYS.APP_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving app settings:', error);
    throw error;
  }
};

/**
 * Gets app settings from local storage
 * @returns {Promise<Object>} App settings
 */
export const getAppSettings = async () => {
  try {
    const settingsJson = await AsyncStorage.getItem(KEYS.APP_SETTINGS);
    return settingsJson ? JSON.parse(settingsJson) : {
      darkMode: true,
      notifications: true,
      onboardingComplete: false,
    };
  } catch (error) {
    console.error('Error getting app settings:', error);
    return {
      darkMode: true,
      notifications: true,
      onboardingComplete: false,
    };
  }
};

/**
 * Saves onboarding completion status
 * @param {boolean} completed - Whether onboarding is completed
 * @returns {Promise<void>}
 */
export const saveOnboardingStatus = async (completed) => {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
    
    // Also update app settings
    const settings = await getAppSettings();
    settings.onboardingComplete = completed;
    await saveAppSettings(settings);
  } catch (error) {
    console.error('Error saving onboarding status:', error);
    throw error;
  }
};

/**
 * Gets onboarding completion status
 * @returns {Promise<boolean>} Whether onboarding is completed
 */
export const getOnboardingStatus = async () => {
  try {
    const statusJson = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return statusJson ? JSON.parse(statusJson) : false;
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
};

/**
 * Clears all app data (for testing or logout)
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  try {
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter app-specific keys
    const appKeys = keys.filter(key => key.startsWith('nutritrack_'));
    
    // Clear all app-specific keys
    await AsyncStorage.multiRemove(appKeys);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
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