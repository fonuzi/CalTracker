import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * Checks if the device has permissions to access pedometer data
 * @returns {Promise<boolean>} Whether the device has permissions
 */
export const checkHealthKitPermissions = async () => {
  try {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('Pedometer not available on this platform');
      return false;
    }
    
    const isAvailable = await Pedometer.isAvailableAsync();
    return isAvailable;
  } catch (error) {
    console.error('Error checking health permissions:', error);
    return false;
  }
};

/**
 * Requests permissions to access pedometer data
 * @returns {Promise<boolean>} Whether the user granted permissions
 */
export const requestHealthKitPermissions = async () => {
  try {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('Pedometer not available on this platform');
      return false;
    }
    
    const isAvailable = await Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Pedometer is not available on this device');
      return false;
    }
    
    // iOS doesn't need explicit permission for pedometer
    return true;
  } catch (error) {
    console.error('Error requesting health permissions:', error);
    return false;
  }
};

/**
 * Gets the step count for today
 * @returns {Promise<number>} Number of steps
 */
export const getStepsForToday = async () => {
  try {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('Pedometer not available on this platform');
      return 0;
    }
    
    const isAvailable = await Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Pedometer is not available on this device');
      return 0;
    }
    
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const { steps } = await Pedometer.getStepCountAsync(start, end);
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
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('Pedometer not available on this platform');
      return Array(7).fill(0);
    }
    
    const isAvailable = await Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Pedometer is not available on this device');
      return Array(7).fill(0);
    }
    
    const end = new Date();
    const result = [];
    
    // Get data for the past 7 days
    for (let i = 0; i < 7; i++) {
      const dayEnd = new Date(end);
      dayEnd.setDate(end.getDate() - i);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayStart = new Date(dayEnd);
      dayStart.setHours(0, 0, 0, 0);
      
      try {
        const { steps } = await Pedometer.getStepCountAsync(dayStart, dayEnd);
        result.unshift({
          date: dayStart.toISOString().split('T')[0],
          steps,
        });
      } catch (err) {
        result.unshift({
          date: dayStart.toISOString().split('T')[0],
          steps: 0,
        });
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
  try {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('Pedometer not available on this platform');
      return { remove: () => {} };
    }
    
    const subscription = Pedometer.watchStepCount(result => {
      callback(result.steps);
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to step updates:', error);
    return { remove: () => {} };
  }
};