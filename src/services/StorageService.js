import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const PROFILE_KEY = 'nutritrack_profile';
const FOOD_LOG_KEY = 'nutritrack_food_log';
const FOOD_LOG_DATES_KEY = 'nutritrack_food_log_dates';
const SETTINGS_KEY = 'nutritrack_settings';

/**
 * Saves a user profile to local storage
 * @param {Object} profile - User profile data
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
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
    const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
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
    // Make sure food has an ID
    if (!food.id) {
      food.id = generateId();
    }
    
    // Add timestamp if not present
    if (!food.timestamp) {
      food.timestamp = new Date().toISOString();
    }
    
    // Get the date portion of the timestamp (YYYY-MM-DD)
    const date = food.timestamp.split('T')[0];
    
    // Get existing logs for this date
    const existingLogs = await getFoodLogs(date);
    
    // Add or update the food log
    const updatedLogs = existingLogs.find((log) => log.id === food.id)
      ? existingLogs.map((log) => (log.id === food.id ? food : log))
      : [...existingLogs, food];
    
    // Save updated logs
    await AsyncStorage.setItem(
      `${FOOD_LOG_KEY}_${date}`,
      JSON.stringify(updatedLogs)
    );
    
    // Update the list of dates that have food logs
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
    const logsJson = await AsyncStorage.getItem(`${FOOD_LOG_KEY}_${date}`);
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
    // Get all dates that have food logs
    const dates = await getFoodLogDates();
    
    // For each date, check if the food log exists and delete it
    for (const date of dates) {
      const logs = await getFoodLogs(date);
      const index = logs.findIndex((log) => log.id === id);
      
      if (index !== -1) {
        // Remove the log
        logs.splice(index, 1);
        
        // Save updated logs
        await AsyncStorage.setItem(
          `${FOOD_LOG_KEY}_${date}`,
          JSON.stringify(logs)
        );
        
        // If there are no more logs for this date, remove it from the list
        if (logs.length === 0) {
          const updatedDates = dates.filter((d) => d !== date);
          await AsyncStorage.setItem(
            FOOD_LOG_DATES_KEY,
            JSON.stringify(updatedDates)
          );
        }
        
        // Log was found and deleted, so we can stop searching
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
    const datesJson = await AsyncStorage.getItem(FOOD_LOG_DATES_KEY);
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
    const dates = await getFoodLogDates();
    
    if (!dates.includes(date)) {
      dates.push(date);
      await AsyncStorage.setItem(FOOD_LOG_DATES_KEY, JSON.stringify(dates));
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = {};
    
    // Get all dates that have food logs
    const allDates = await getFoodLogDates();
    
    // Filter dates within the range
    const datesInRange = allDates.filter((date) => {
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
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    return settingsJson
      ? JSON.parse(settingsJson)
      : { darkMode: true, notifications: true };
  } catch (error) {
    console.error('Error getting app settings:', error);
    return { darkMode: true, notifications: true };
  }
};

/**
 * Clears all app data (for testing or logout)
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const nutritrackKeys = keys.filter((key) => key.startsWith('nutritrack_'));
    await AsyncStorage.multiRemove(nutritrackKeys);
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