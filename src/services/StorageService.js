import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  FOOD_LOGS_PREFIX: 'food_logs_',
  FOOD_LOG_DATES: 'food_log_dates',
  APP_SETTINGS: 'app_settings',
};

/**
 * Saves a user profile to local storage
 * @param {Object} profile - User profile data
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (profile) => {
  try {
    if (profile) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    }
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
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
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
    // Ensure food has a valid date and id
    if (!food.timestamp) {
      food.timestamp = new Date().toISOString();
    }
    
    if (!food.id) {
      food.id = generateUniqueId();
    }
    
    // Get date string from timestamp (YYYY-MM-DD)
    const date = food.timestamp.split('T')[0];
    
    // Get existing logs for this date
    const existingLogsString = await AsyncStorage.getItem(
      `${STORAGE_KEYS.FOOD_LOGS_PREFIX}${date}`
    );
    
    let logs = existingLogsString ? JSON.parse(existingLogsString) : [];
    
    // Check if this log already exists (update if it does)
    const existingIndex = logs.findIndex(item => item.id === food.id);
    
    if (existingIndex >= 0) {
      // Update existing log
      logs[existingIndex] = food;
    } else {
      // Add new log
      logs.push(food);
    }
    
    // Save updated logs
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.FOOD_LOGS_PREFIX}${date}`,
      JSON.stringify(logs)
    );
    
    // Update list of dates that have food logs
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
    const logsString = await AsyncStorage.getItem(
      `${STORAGE_KEYS.FOOD_LOGS_PREFIX}${date}`
    );
    
    return logsString ? JSON.parse(logsString) : [];
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
    // Get all dates with food logs
    const dates = await getFoodLogDates();
    
    // Check each date for the food log with the given ID
    for (const date of dates) {
      const logs = await getFoodLogs(date);
      const filteredLogs = logs.filter(log => log.id !== id);
      
      // If the number of logs changed, we found and removed the log
      if (filteredLogs.length < logs.length) {
        await AsyncStorage.setItem(
          `${STORAGE_KEYS.FOOD_LOGS_PREFIX}${date}`,
          JSON.stringify(filteredLogs)
        );
        
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
    const datesString = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_LOG_DATES);
    return datesString ? JSON.parse(datesString) : [];
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
    // Get current list of dates
    const datesString = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_LOG_DATES);
    let dates = datesString ? JSON.parse(datesString) : [];
    
    // Add date if it doesn't exist
    if (!dates.includes(date)) {
      dates.push(date);
      // Sort dates in descending order (newest first)
      dates.sort((a, b) => new Date(b) - new Date(a));
      
      // Save updated dates list
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
    const result = {};
    
    // Convert to Date objects for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get all dates with food logs
    const allDates = await getFoodLogDates();
    
    // Filter dates in the range
    const datesInRange = allDates.filter(date => {
      const current = new Date(date);
      return current >= start && current <= end;
    });
    
    // Get logs for each date
    for (const date of datesInRange) {
      const logs = await getFoodLogs(date);
      result[date] = logs;
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
    const settingsString = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return settingsString ? JSON.parse(settingsString) : {};
  } catch (error) {
    console.error('Error getting app settings:', error);
    throw error;
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
    
    // Filter for just our app keys
    const appKeys = keys.filter(key => 
      key === STORAGE_KEYS.USER_PROFILE ||
      key === STORAGE_KEYS.FOOD_LOG_DATES ||
      key === STORAGE_KEYS.APP_SETTINGS ||
      key.startsWith(STORAGE_KEYS.FOOD_LOGS_PREFIX)
    );
    
    // Clear all app data
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
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
};