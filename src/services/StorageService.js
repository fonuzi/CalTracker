import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'nutritrack_user_profile',
  FOOD_LOGS: 'nutritrack_food_logs',
  FOOD_LOG_DATES: 'nutritrack_food_log_dates',
  WATER_LOGS: 'nutritrack_water_logs',
  WEIGHT_LOGS: 'nutritrack_weight_logs',
  APP_SETTINGS: 'nutritrack_app_settings',
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
    // Generate ID if not provided
    const foodToSave = {
      ...food,
      id: food.id || `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: food.timestamp || new Date().toISOString(),
    };

    // Get the date for storing (YYYY-MM-DD)
    const date = foodToSave.date || new Date(foodToSave.timestamp).toISOString().split('T')[0];
    
    // Add date to the food object if not present
    foodToSave.date = date;

    // Get existing logs for this date
    const existingLogs = await getFoodLogs(date);
    
    // Add new log
    const updatedLogs = [...existingLogs, foodToSave];
    
    // Save updated logs
    await AsyncStorage.setItem(`${STORAGE_KEYS.FOOD_LOGS}_${date}`, JSON.stringify(updatedLogs));
    
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
    const jsonValue = await AsyncStorage.getItem(`${STORAGE_KEYS.FOOD_LOGS}_${date}`);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error(`Error getting food logs for ${date}:`, error);
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
    // Get list of dates with food logs
    const dates = await getFoodLogDates();
    
    // For each date, check if the food log exists
    for (const date of dates) {
      const logs = await getFoodLogs(date);
      const logIndex = logs.findIndex(log => log.id === id);
      
      if (logIndex !== -1) {
        // Remove the log
        logs.splice(logIndex, 1);
        
        // Save updated logs
        await AsyncStorage.setItem(`${STORAGE_KEYS.FOOD_LOGS}_${date}`, JSON.stringify(logs));
        
        // If no logs left for this date, remove it from the dates list
        if (logs.length === 0) {
          const updatedDates = dates.filter(d => d !== date);
          await AsyncStorage.setItem(STORAGE_KEYS.FOOD_LOG_DATES, JSON.stringify(updatedDates));
        }
        
        break;
      }
    }
  } catch (error) {
    console.error(`Error deleting food log ${id}:`, error);
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
    
    if (!dates.includes(date)) {
      dates.push(date);
      dates.sort(); // Keep dates sorted chronologically
      await AsyncStorage.setItem(STORAGE_KEYS.FOOD_LOG_DATES, JSON.stringify(dates));
    }
  } catch (error) {
    console.error(`Error updating food log dates with ${date}:`, error);
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
    // Get all dates with food logs
    const allDates = await getFoodLogDates();
    
    // Filter dates to the specified range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const datesInRange = allDates.filter(date => {
      const current = new Date(date);
      return current >= start && current <= end;
    });
    
    // Get logs for each date
    const result = {};
    
    for (const date of datesInRange) {
      const logs = await getFoodLogs(date);
      result[date] = logs;
    }
    
    return result;
  } catch (error) {
    console.error(`Error getting food logs for date range ${startDate} to ${endDate}:`, error);
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
    // Get current settings
    const currentSettings = await getAppSettings();
    
    // Merge with new settings
    const updatedSettings = { ...currentSettings, ...settings };
    
    // Save updated settings
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updatedSettings));
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
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (error) {
    console.error('Error getting app settings:', error);
    return {};
  }
};

/**
 * Clears all app data (for testing or logout)
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const nutritrackKeys = keys.filter(key => key.startsWith('nutritrack_'));
    await AsyncStorage.multiRemove(nutritrackKeys);
  } catch (error) {
    console.error('Error clearing app data:', error);
    throw error;
  }
};