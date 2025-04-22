import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'nutritrack_user_profile',
  FOOD_LOGS: 'nutritrack_food_logs',
  FOOD_LOG_DATES: 'nutritrack_food_log_dates',
  APP_SETTINGS: 'nutritrack_app_settings'
};

/**
 * Saves a user profile to local storage
 * @param {Object} profile - User profile data
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (profile) => {
  try {
    const jsonValue = JSON.stringify(profile);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, jsonValue);
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
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
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
    // Get the date from the food timestamp (YYYY-MM-DD)
    const date = new Date(food.timestamp).toISOString().split('T')[0];
    
    // Get existing logs for the date
    const logs = await getFoodLogs(date);
    
    // Add new log or replace existing log with same ID
    const existingIndex = logs.findIndex(log => log.id === food.id);
    
    if (existingIndex >= 0) {
      logs[existingIndex] = food;
    } else {
      logs.push(food);
    }
    
    // Save updated logs
    const key = `${STORAGE_KEYS.FOOD_LOGS}_${date}`;
    await AsyncStorage.setItem(key, JSON.stringify(logs));
    
    // Update list of dates with food logs
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
    const key = `${STORAGE_KEYS.FOOD_LOGS}_${date}`;
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
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
    
    // Check each date for the log to delete
    for (const date of dates) {
      const logs = await getFoodLogs(date);
      const filteredLogs = logs.filter(log => log.id !== id);
      
      // If logs were filtered, save the updated list
      if (filteredLogs.length < logs.length) {
        const key = `${STORAGE_KEYS.FOOD_LOGS}_${date}`;
        await AsyncStorage.setItem(key, JSON.stringify(filteredLogs));
        
        // If no logs left for the date, remove the date from the list
        if (filteredLogs.length === 0) {
          const updatedDates = dates.filter(d => d !== date);
          await AsyncStorage.setItem(STORAGE_KEYS.FOOD_LOG_DATES, JSON.stringify(updatedDates));
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
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_LOG_DATES);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
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
    const dates = await getFoodLogDates();
    
    // Add date to list if not already present
    if (!dates.includes(date)) {
      dates.push(date);
      await AsyncStorage.setItem(STORAGE_KEYS.FOOD_LOG_DATES, JSON.stringify(dates));
    }
  } catch (error) {
    console.error('Error updating food log dates:', error);
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = {};
    
    // Get all dates with food logs
    const allDates = await getFoodLogDates();
    
    // Filter dates in the range
    const datesInRange = allDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= start && date <= end;
    });
    
    // Get logs for each date
    for (const date of datesInRange) {
      const logs = await getFoodLogs(date);
      result[date] = logs;
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
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, jsonValue);
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
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting app settings:', error);
    return null;
  }
};

/**
 * Clears all app data (for testing or logout)
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const nutritrackKeys = keys.filter(key => 
      key.startsWith('nutritrack_')
    );
    
    await AsyncStorage.multiRemove(nutritrackKeys);
  } catch (error) {
    console.error('Error clearing app data:', error);
    throw error;
  }
};