import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const USER_PROFILE_KEY = 'nutritrack_user_profile';
const FOOD_LOG_KEY_PREFIX = 'nutritrack_food_log_';
const FOOD_LOG_DATES_KEY = 'nutritrack_food_log_dates';
const APP_SETTINGS_KEY = 'nutritrack_app_settings';

/**
 * Saves a user profile to local storage
 * @param {Object} profile - User profile data
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
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
    const profileString = await AsyncStorage.getItem(USER_PROFILE_KEY);
    return profileString ? JSON.parse(profileString) : null;
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
    // Ensure the food object has an ID
    if (!food.id) {
      food.id = 'food_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }
    
    // Get the date from the food entry's timestamp
    const date = food.timestamp ? new Date(food.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Get existing food logs for this date
    const existingLogs = await getFoodLogs(date);
    
    // Find if this food already exists (for update case)
    const index = existingLogs.findIndex(item => item.id === food.id);
    
    let updatedLogs;
    if (index >= 0) {
      // Update existing food log
      updatedLogs = [...existingLogs];
      updatedLogs[index] = food;
    } else {
      // Add new food log
      updatedLogs = [...existingLogs, food];
    }
    
    // Save updated logs
    await AsyncStorage.setItem(FOOD_LOG_KEY_PREFIX + date, JSON.stringify(updatedLogs));
    
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
    const logsString = await AsyncStorage.getItem(FOOD_LOG_KEY_PREFIX + date);
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
    // Get all dates that have food logs
    const dates = await getFoodLogDates();
    
    // Check each date for the food log
    for (const date of dates) {
      const logs = await getFoodLogs(date);
      const filteredLogs = logs.filter(log => log.id !== id);
      
      // If the logs changed, update storage
      if (filteredLogs.length !== logs.length) {
        await AsyncStorage.setItem(FOOD_LOG_KEY_PREFIX + date, JSON.stringify(filteredLogs));
        
        // If no logs remain for this date, remove the date from the list
        if (filteredLogs.length === 0) {
          const updatedDates = dates.filter(d => d !== date);
          await AsyncStorage.setItem(FOOD_LOG_DATES_KEY, JSON.stringify(updatedDates));
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
    const datesString = await AsyncStorage.getItem(FOOD_LOG_DATES_KEY);
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
    // Get existing dates
    const dates = await getFoodLogDates();
    
    // Add the date if it doesn't exist
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
    
    // Get all dates with food logs
    const allDates = await getFoodLogDates();
    
    // Filter dates within the range
    const datesInRange = allDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= start && date <= end;
    });
    
    // Get food logs for each date
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
    // Get existing settings
    const existingSettings = await getAppSettings();
    
    // Merge with new settings
    const updatedSettings = { ...existingSettings, ...settings };
    
    await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(updatedSettings));
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
    const settingsString = await AsyncStorage.getItem(APP_SETTINGS_KEY);
    return settingsString ? JSON.parse(settingsString) : {
      darkMode: true,
      notificationsEnabled: true,
      stepTrackingEnabled: true,
      unitSystem: 'metric'
    };
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
    // Get all keys with our prefix
    const allKeys = await AsyncStorage.getAllKeys();
    const nutritrackKeys = allKeys.filter(key => 
      key.startsWith('nutritrack_')
    );
    
    // Clear all data
    await AsyncStorage.multiRemove(nutritrackKeys);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};