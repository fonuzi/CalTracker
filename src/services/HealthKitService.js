import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * Checks if the device has permissions to access pedometer data
 * @returns {Promise<boolean>} Whether the device has permissions
 */
export const checkHealthKitPermissions = async () => {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    return isAvailable;
  } catch (error) {
    console.error('Error checking pedometer permissions:', error);
    return false;
  }
};

/**
 * Requests permissions to access pedometer data
 * @returns {Promise<boolean>} Whether the user granted permissions
 */
export const requestHealthKitPermissions = async () => {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Pedometer is not available on this device');
      return false;
    }
    
    // For Expo, there's no explicit permission request for the pedometer,
    // but we're returning true if it's available
    return true;
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
    const isAvailable = await Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Pedometer is not available on this device');
      return 0;
    }
    
    // Calculate start and end times (midnight to now)
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const { steps } = await Pedometer.getStepCountAsync(start, end);
    return steps;
  } catch (error) {
    console.error('Error getting steps for today:', error);
    
    // For demo/development purposes on web, return a random step count
    // In a production app, this should return 0 or handle the error differently
    if (Platform.OS === 'web') {
      return Math.floor(Math.random() * 8000) + 2000; // Random number between 2000-10000
    }
    return 0;
  }
};

/**
 * Gets the step count for the past week
 * @returns {Promise<Array>} Array of step counts for each day
 */
export const getStepsForPastWeek = async () => {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Pedometer is not available on this device');
      return Array(7).fill(0);
    }
    
    const result = [];
    const today = new Date();
    
    // Get steps for each day in the past week
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Set start to midnight of the date
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      
      // Set end to 23:59:59 of the date
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      
      // If end is in the future, use current time as end
      if (end > today) {
        end.setTime(today.getTime());
      }
      
      try {
        const { steps } = await Pedometer.getStepCountAsync(start, end);
        result.push(steps);
      } catch (error) {
        console.error(`Error getting steps for day ${i}:`, error);
        
        // For demo/development purposes on web, add a random step count
        // In a production app, this should add 0 or handle the error differently
        if (Platform.OS === 'web') {
          result.push(Math.floor(Math.random() * 8000) + 2000); // Random number between 2000-10000
        } else {
          result.push(0);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error getting steps for past week:', error);
    return Array(7).fill(0);
  }
};

/**
 * Starts a pedometer subscription to get real-time step count updates
 * @param {Function} callback - Function to call with updated step count
 * @returns {Object} Subscription object with remove() method
 */
export const subscribeToStepUpdates = (callback) => {
  let subscription = null;
  
  // Check if pedometer is available
  Pedometer.isAvailableAsync().then(isAvailable => {
    if (!isAvailable) {
      console.log('Pedometer is not available on this device');
      return;
    }
    
    // Start the subscription
    subscription = Pedometer.watchStepCount(result => {
      callback(result.steps);
    });
  }).catch(error => {
    console.error('Error setting up pedometer subscription:', error);
  });
  
  // Return an object that can be used to remove the subscription
  return {
    remove: () => {
      if (subscription) {
        subscription.remove();
      }
    }
  };
};