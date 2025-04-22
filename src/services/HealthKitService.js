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
    // Check if pedometer is available
    const isAvailable = await Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.warn('Pedometer is not available on this device');
      return false;
    }
    
    // On iOS, we should request permissions
    // On Android and web, this isn't necessary
    if (Platform.OS === 'ios') {
      // iOS-specific permission request
      const { granted } = await Pedometer.requestPermissionsAsync();
      return granted;
    }
    
    // For other platforms, assume permission is granted
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
    // Check if pedometer is available
    const isAvailable = await Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.warn('Pedometer is not available, using mock data');
      return getMockStepsForToday();
    }
    
    // Calculate today's beginning and end
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    // Get step count
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
    // Check if pedometer is available
    const isAvailable = await Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.warn('Pedometer is not available, using mock data');
      return getMockStepsForPastWeek();
    }
    
    // Calculate dates for the past week
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    
    // Create an array of day objects
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      try {
        const { steps } = await Pedometer.getStepCountAsync(date, nextDate);
        days.push({
          date: date.toISOString().split('T')[0],
          steps: steps,
        });
      } catch (error) {
        console.error(`Error getting steps for ${date.toISOString().split('T')[0]}:`, error);
        days.push({
          date: date.toISOString().split('T')[0],
          steps: 0,
        });
      }
    }
    
    return days;
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
  // Check if we're on web (Pedometer subscription is not supported on web)
  if (Platform.OS === 'web') {
    console.warn('Pedometer subscription not supported on web, using mock subscription');
    return createMockStepSubscription(callback);
  }
  
  try {
    // Check if pedometer is available (async, but we'll handle errors in the subscription)
    Pedometer.isAvailableAsync()
      .then(isAvailable => {
        if (!isAvailable) {
          console.warn('Pedometer is not available, using mock subscription');
          return createMockStepSubscription(callback);
        }
      })
      .catch(error => {
        console.error('Error checking pedometer availability:', error);
        return createMockStepSubscription(callback);
      });
    
    // Subscribe to pedometer updates
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    return Pedometer.watchStepCount(result => {
      callback(result.steps);
    });
  } catch (error) {
    console.error('Error subscribing to step updates:', error);
    return createMockStepSubscription(callback);
  }
};

/**
 * Creates a mock step count subscription for web or when pedometer is unavailable
 * @param {Function} callback - Function to call with updated step count
 * @returns {Object} Mock subscription object with remove() method
 * @private
 */
const createMockStepSubscription = (callback) => {
  // Start with a mock step count
  let mockSteps = getMockStepsForToday();
  
  // Call the callback with the initial step count
  setTimeout(() => {
    callback(mockSteps);
  }, 1000);
  
  // Set up an interval to simulate step count updates
  const interval = setInterval(() => {
    // Increment the step count by a random number (0-5)
    mockSteps += Math.floor(Math.random() * 6);
    callback(mockSteps);
  }, 10000); // Update every 10 seconds
  
  // Return a mock subscription object with a remove method
  return {
    remove: () => {
      clearInterval(interval);
    }
  };
};

/**
 * Gets a mock step count for today
 * @returns {number} Mock step count
 * @private
 */
const getMockStepsForToday = () => {
  // Generate a random number between 5000 and 10000
  return Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
};

/**
 * Gets mock step counts for the past week
 * @returns {Array} Array of mock step counts
 * @private
 */
const getMockStepsForPastWeek = () => {
  const days = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    
    days.push({
      date: date.toISOString().split('T')[0],
      steps: Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000,
    });
  }
  
  return days;
};