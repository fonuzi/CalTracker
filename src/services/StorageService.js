import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'nutritrack_user_profile',
  FOOD_LOGS_PREFIX: 'nutritrack_food_logs_',
  FOOD_LOG_DATES: 'nutritrack_food_log_dates',
  APP_SETTINGS: 'nutritrack_app_settings',
  ONBOARDING_COMPLETE: 'nutritrack_onboarding_complete',
};

/**
 * Saves a user profile to local storage
 * @param {Object} profile - User profile data
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profile)
    );
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
    const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profileJson ? JSON.parse(profileJson) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Saves a food log entry to local storage
 * @param {Object} food - Food log entry data
 * @returns {Promise<void>}
 */
export const saveFoodLog = async (food) => {
  try {
    // Make sure food has an ID
    if (!food.id) {
      food.id = generateId();
    }
    
    // Make sure food has a date in YYYY-MM-DD format
    if (!food.date) {
      food.date = new Date().toISOString().split('T')[0];
    }
    
    // Get existing logs for the date
    const key = `${STORAGE_KEYS.FOOD_LOGS_PREFIX}${food.date}`;
    const existingLogsJson = await AsyncStorage.getItem(key);
    const existingLogs = existingLogsJson ? JSON.parse(existingLogsJson) : [];
    
    // Check if food already exists (update if it does)
    const existingIndex = existingLogs.findIndex(item => item.id === food.id);
    
    if (existingIndex >= 0) {
      existingLogs[existingIndex] = food;
    } else {
      existingLogs.push(food);
    }
    
    // Save updated logs
    await AsyncStorage.setItem(key, JSON.stringify(existingLogs));
    
    // Update the list of dates
    await updateFoodLogDates(food.date);
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
    const key = `${STORAGE_KEYS.FOOD_LOGS_PREFIX}${date}`;
    const logsJson = await AsyncStorage.getItem(key);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Error getting food logs:', error);
    throw error;
  }
};

/**
 * Deletes a food log entry
 * @param {string} id - ID of the food log entry to delete
 * @returns {Promise<void>}
 */
export const deleteFoodLog = async (id) => {
  try {
    // Get all dates to check
    const dates = await getFoodLogDates();
    
    for (const date of dates) {
      const key = `${STORAGE_KEYS.FOOD_LOGS_PREFIX}${date}`;
      const logsJson = await AsyncStorage.getItem(key);
      
      if (!logsJson) continue;
      
      const logs = JSON.parse(logsJson);
      const filteredLogs = logs.filter(log => log.id !== id);
      
      if (filteredLogs.length !== logs.length) {
        // Found and removed the log
        await AsyncStorage.setItem(key, JSON.stringify(filteredLogs));
        
        // If no logs left for this date, remove it from the dates list
        if (filteredLogs.length === 0) {
          const updatedDates = dates.filter(d => d !== date);
          await AsyncStorage.setItem(
            STORAGE_KEYS.FOOD_LOG_DATES,
            JSON.stringify(updatedDates)
          );
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
    const datesJson = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_LOG_DATES);
    return datesJson ? JSON.parse(datesJson) : [];
  } catch (error) {
    console.error('Error getting food log dates:', error);
    throw error;
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
    const datesJson = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_LOG_DATES);
    const dates = datesJson ? JSON.parse(datesJson) : [];
    
    if (!dates.includes(date)) {
      dates.push(date);
      // Sort dates in descending order (newest first)
      dates.sort((a, b) => new Date(b) - new Date(a));
      await AsyncStorage.setItem(
        STORAGE_KEYS.FOOD_LOG_DATES,
        JSON.stringify(dates)
      );
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
    const allDates = await getFoodLogDates();
    const result = {};
    
    // Filter dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const datesInRange = allDates.filter(date => {
      const current = new Date(date);
      return current >= start && current <= end;
    });
    
    // Get logs for each date
    for (const date of datesInRange) {
      result[date] = await getFoodLogs(date);
    }
    
    return result;
  } catch (error) {
    console.error('Error getting food logs for date range:', error);
    throw error;
  }
};

/**
 * Saves app settings to local storage
 * @param {Object} settings - App settings
 * @returns {Promise<void>}
 */
export const saveAppSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.APP_SETTINGS,
      JSON.stringify(settings)
    );
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
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return settingsJson ? JSON.parse(settingsJson) : null;
  } catch (error) {
    console.error('Error getting app settings:', error);
    throw error;
  }
};

/**
 * Saves onboarding completion status
 * @param {boolean} completed - Whether onboarding is completed
 * @returns {Promise<void>}
 */
export const saveOnboardingStatus = async (completed) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ONBOARDING_COMPLETE,
      JSON.stringify(completed)
    );
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
    const status = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return status ? JSON.parse(status) : false;
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    throw error;
  }
};

/**
 * Clears all app data (for testing or logout)
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter(key => key.startsWith('nutritrack_'));
    await AsyncStorage.multiRemove(appKeys);
  } catch (error) {
    console.error('Error clearing app data:', error);
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