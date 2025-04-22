import { Pedometer } from 'expo-sensors';

/**
 * Checks if the device has permissions to access pedometer data
 * @returns {Promise<boolean>} Whether the device has permissions
 */
export const checkHealthKitPermissions = async () => {
  try {
    const result = await Pedometer.isAvailableAsync();
    return result;
  } catch (error) {
    console.error('Error checking pedometer availability:', error);
    return false;
  }
};

/**
 * Requests permissions to access pedometer data
 * @returns {Promise<boolean>} Whether the user granted permissions
 */
export const requestHealthKitPermissions = async () => {
  try {
    const result = await Pedometer.requestPermissionsAsync();
    return result;
  } catch (error) {
    console.error('Error requesting pedometer permissions:', error);
    return false;
  }
};

/**
 * Gets the step count for today
 * @returns {Promise<number>} Number of steps
 */
export const getStepsForToday = async () => {
  try {
    // Check if pedometer is available
    const isAvailable = await checkHealthKitPermissions();
    if (!isAvailable) {
      console.warn('Pedometer is not available on this device');
      return 0;
    }
    
    // Set up start and end dates
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0); // Start of the day
    
    // Get step count
    const { steps } = await Pedometer.getStepCountAsync(start, now);
    return steps;
  } catch (error) {
    console.error('Error getting steps for today:', error);
    return 0;
  }
};

/**
 * Gets the step count for the past week
 * @returns {Promise<Array>} Array of step counts for each day
 */
export const getStepsForPastWeek = async () => {
  try {
    // Check if pedometer is available
    const isAvailable = await checkHealthKitPermissions();
    if (!isAvailable) {
      console.warn('Pedometer is not available on this device');
      return Array(7).fill(0); // Return array of zeros
    }
    
    const results = [];
    const now = new Date();
    
    // Loop through the past 7 days
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      // If the day is today, use current time as end time
      const endTime = i === 0 ? now : dayEnd;
      
      try {
        const { steps } = await Pedometer.getStepCountAsync(dayStart, endTime);
        results.push(steps);
      } catch (err) {
        console.warn(`Error getting steps for day ${i}:`, err);
        results.push(0);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error getting steps for past week:', error);
    return Array(7).fill(0); // Return array of zeros
  }
};

/**
 * Starts a pedometer subscription to get real-time step count updates
 * @param {Function} callback - Function to call with updated step count
 * @returns {Object} Subscription object with remove() method
 */
export const subscribeToStepUpdates = (callback) => {
  try {
    // Check permissions before subscribing
    checkHealthKitPermissions().then(isAvailable => {
      if (!isAvailable) {
        console.warn('Pedometer is not available on this device');
        return null;
      }
    });
    
    // Subscribe to pedometer updates
    const subscription = Pedometer.watchStepCount(result => {
      callback(result.steps);
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to step updates:', error);
    return {
      remove: () => {}, // Return dummy object with remove method
    };
  }
};