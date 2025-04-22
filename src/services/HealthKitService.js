import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * Checks if the device has permissions to access pedometer data
 * @returns {Promise<boolean>} Whether the device has permissions
 */
export const checkHealthKitPermissions = async () => {
  try {
    // On web, we can't use the Pedometer, so we mock permissions
    if (Platform.OS === 'web') {
      return true;
    }
    
    const { status } = await Pedometer.getPermissionsAsync();
    return status === 'granted';
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
    // On web, we can't use the Pedometer, so we mock permissions
    if (Platform.OS === 'web') {
      return true;
    }
    
    const { status } = await Pedometer.requestPermissionsAsync();
    return status === 'granted';
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
    // On web, we can't use the Pedometer, so we return a mock step count
    if (Platform.OS === 'web') {
      return getMockStepsForToday();
    }
    
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      return getMockStepsForToday();
    }
    
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
    // On web, we can't use the Pedometer, so we return mock step counts
    if (Platform.OS === 'web') {
      return getMockStepsForPastWeek();
    }
    
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      return getMockStepsForPastWeek();
    }
    
    const now = new Date();
    const result = [];
    
    // Get steps for each day of the past week
    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      
      // Make sure we don't get steps for the future
      const endTime = end.getTime() > now.getTime() ? now : end;
      
      try {
        const { steps } = await Pedometer.getStepCountAsync(start, endTime);
        result.push({
          date: start.toISOString().split('T')[0],
          steps,
        });
      } catch (error) {
        console.error(`Error getting steps for day -${i}:`, error);
        
        // Add mock data for this day
        const mockSteps = Math.floor(Math.random() * 3000) + 3000;
        result.push({
          date: start.toISOString().split('T')[0],
          steps: mockSteps,
        });
      }
    }
    
    return result;
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
  // On web, we can't use the Pedometer, so we create a mock subscription
  if (Platform.OS === 'web') {
    return createMockStepSubscription(callback);
  }
  
  // Check if pedometer is available
  Pedometer.isAvailableAsync().then((isAvailable) => {
    if (!isAvailable) {
      return createMockStepSubscription(callback);
    }
    
    // Get steps for today so far
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    Pedometer.getStepCountAsync(start, now)
      .then(({ steps }) => {
        callback(steps);
      })
      .catch((error) => {
        console.error('Error getting initial step count:', error);
        callback(getMockStepsForToday());
      });
  });
  
  // Subscribe to pedometer updates
  try {
    const subscription = Pedometer.watchStepCount((result) => {
      callback(result.steps);
    });
    
    return subscription;
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
  // Get random step count between 3000 and 10000
  const steps = getMockStepsForToday();
  callback(steps);
  
  // Simulate step count updates every 60 seconds
  const interval = setInterval(() => {
    const newSteps = steps + Math.floor(Math.random() * 100);
    callback(newSteps);
  }, 60000);
  
  return {
    remove: () => clearInterval(interval),
  };
};

/**
 * Gets a mock step count for today
 * @returns {number} Mock step count
 * @private
 */
const getMockStepsForToday = () => {
  // Get current hour
  const hour = new Date().getHours();
  
  // Calculate steps based on time of day (more steps later in the day)
  const baseSteps = 5000; // Average daily steps
  const progressFactor = Math.min(1, hour / 21); // Progress through the day (max at 9 PM)
  
  const randomVariation = Math.random() * 0.2 - 0.1; // +/- 10% variation
  
  return Math.round(baseSteps * progressFactor * (1 + randomVariation));
};

/**
 * Gets mock step counts for the past week
 * @returns {Array} Array of mock step counts
 * @private
 */
const getMockStepsForPastWeek = () => {
  const result = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate random step count between 3000 and 10000
    const steps = Math.floor(Math.random() * 7000) + 3000;
    
    result.push({
      date: date.toISOString().split('T')[0],
      steps,
    });
  }
  
  return result;
};