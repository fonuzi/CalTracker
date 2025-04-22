import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';

/**
 * Checks if the device has permissions to access pedometer data
 * @returns {Promise<boolean>} Whether the device has permissions
 */
export const checkHealthKitPermissions = async () => {
  try {
    // For web platform, always return false (no pedometer access)
    if (Platform.OS === 'web') {
      console.log('Pedometer is not available on this device');
      return false;
    }
    
    const result = await Pedometer.isAvailableAsync();
    return result;
  } catch (error) {
    console.error('Error checking health kit permissions:', error);
    return false;
  }
};

/**
 * Requests permissions to access pedometer data
 * @returns {Promise<boolean>} Whether the user granted permissions
 */
export const requestHealthKitPermissions = async () => {
  try {
    // For web platform, always return false (no pedometer access)
    if (Platform.OS === 'web') {
      console.log('Pedometer is not available on this device');
      return false;
    }
    
    // No formal permission request needed for pedometer in Expo
    const isAvailable = await Pedometer.isAvailableAsync();
    return isAvailable;
  } catch (error) {
    console.error('Error requesting health kit permissions:', error);
    return false;
  }
};

/**
 * Gets the step count for today
 * @returns {Promise<number>} Number of steps
 */
export const getStepsForToday = async () => {
  try {
    // For web platform, return a mock value
    if (Platform.OS === 'web') {
      return getMockStepsForToday();
    }
    
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      return getMockStepsForToday();
    }
    
    // Calculate start and end time for today
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const { steps } = await Pedometer.getStepCountAsync(start, now);
    return steps;
  } catch (error) {
    console.error('Error getting steps for today:', error);
    return getMockStepsForToday();
  }
};

/**
 * Gets the step count for the past week
 * @returns {Promise<Array>} Array of step counts for each day
 */
export const getStepsForPastWeek = async () => {
  try {
    // For web platform, return mock values
    if (Platform.OS === 'web') {
      return getMockStepsForPastWeek();
    }
    
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      return getMockStepsForPastWeek();
    }
    
    // Calculate step counts for each of the past 7 days
    const now = new Date();
    const weekSteps = [];
    
    for (let i = 6; i >= 0; i--) {
      const endDate = new Date(now);
      endDate.setDate(now.getDate() - i);
      endDate.setHours(23, 59, 59, 999);
      
      const startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
      
      try {
        const { steps } = await Pedometer.getStepCountAsync(startDate, endDate);
        weekSteps.push(steps);
      } catch (error) {
        console.error(`Error getting steps for day -${i}:`, error);
        weekSteps.push(0);
      }
    }
    
    return weekSteps;
  } catch (error) {
    console.error('Error getting steps for past week:', error);
    return getMockStepsForPastWeek();
  }
};

/**
 * Starts a pedometer subscription to get real-time step count updates
 * @param {Function} callback - Function to call with updated step count
 * @returns {Object} Subscription object with remove() method
 */
export const subscribeToStepUpdates = (callback) => {
  try {
    // For web platform, return a mock subscription
    if (Platform.OS === 'web') {
      return createMockSubscription(callback);
    }
    
    // Check if pedometer is available
    Pedometer.isAvailableAsync().then((isAvailable) => {
      if (!isAvailable) {
        createMockSubscription(callback);
        return;
      }
      
      // Create a real subscription if available
      const subscription = Pedometer.watchStepCount((result) => {
        callback(result.steps);
      });
      
      return subscription;
    });
    
    // Return a dummy subscription in case the check fails
    return {
      remove: () => {},
    };
  } catch (error) {
    console.error('Error subscribing to step updates:', error);
    return createMockSubscription(callback);
  }
};

/**
 * Creates a mock step count subscription for web or when pedometer is unavailable
 * @param {Function} callback - Function to call with updated step count
 * @returns {Object} Mock subscription object with remove() method
 * @private
 */
const createMockSubscription = (callback) => {
  // Start with a base number of steps
  let steps = getMockStepsForToday();
  
  // Simulate step count updates
  const intervalId = setInterval(() => {
    // Add a random number of steps (0-10) every 5 seconds
    const newSteps = Math.floor(Math.random() * 11);
    steps += newSteps;
    callback(steps);
  }, 5000);
  
  // Return an object with a remove method to clean up the interval
  return {
    remove: () => {
      clearInterval(intervalId);
    },
  };
};

/**
 * Gets a mock step count for today
 * @returns {number} Mock step count
 * @private
 */
const getMockStepsForToday = () => {
  // Return a random number between 5000 and 8000
  return Math.floor(Math.random() * 3001) + 5000;
};

/**
 * Gets mock step counts for the past week
 * @returns {Array} Array of mock step counts
 * @private
 */
const getMockStepsForPastWeek = () => {
  const weekSteps = [];
  
  // Generate 7 days of mock step counts
  for (let i = 0; i < 7; i++) {
    // Random steps between 4000 and 12000
    const steps = Math.floor(Math.random() * 8001) + 4000;
    weekSteps.push(steps);
  }
  
  return weekSteps;
};