import { Pedometer } from 'expo-sensors';

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
    // There is no explicit requestPermissionsAsync in Pedometer
    // Attempting to get steps will prompt for permissions on iOS
    // For Android, no permissions are required
    return await checkHealthKitPermissions();
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
      console.warn('Pedometer not available on this device');
      return _getMockStepsForToday();
    }
    
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    
    const result = await Pedometer.getStepCountAsync(start, end);
    return result?.steps || 0;
  } catch (error) {
    console.error('Error getting steps for today:', error);
    return _getMockStepsForToday();
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
      console.warn('Pedometer not available on this device');
      return _getMockStepsForPastWeek();
    }
    
    const now = new Date();
    const result = [];
    
    // Get steps for each of the past 7 days
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);
      
      try {
        const data = await Pedometer.getStepCountAsync(day, nextDay);
        result.push(data?.steps || 0);
      } catch {
        // If we can't get steps for a day, add 0
        result.push(0);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error getting steps for past week:', error);
    return _getMockStepsForPastWeek();
  }
};

/**
 * Starts a pedometer subscription to get real-time step count updates
 * @param {Function} callback - Function to call with updated step count
 * @returns {Object} Subscription object with remove() method
 */
export const subscribeToStepUpdates = (callback) => {
  try {
    const isAvailable = Pedometer.isAvailableAsync();
    
    if (!isAvailable) {
      console.warn('Pedometer not available on this device');
      return _createMockStepSubscription(callback);
    }
    
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    // Start subscription
    const subscription = Pedometer.watchStepCount(result => {
      callback(result.steps);
    });
    
    // Get initial steps for today
    getStepsForToday().then(steps => {
      callback(steps);
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to step updates:', error);
    return _createMockStepSubscription(callback);
  }
};

/**
 * Creates a mock step count subscription for web or when pedometer is unavailable
 * @param {Function} callback - Function to call with updated step count
 * @returns {Object} Mock subscription object with remove() method
 * @private
 */
const _createMockStepSubscription = (callback) => {
  // Immediately provide initial mock steps
  const initialSteps = _getMockStepsForToday();
  callback(initialSteps);
  
  // Set up interval to simulate step updates
  let mockSteps = initialSteps;
  const intervalId = setInterval(() => {
    // Increase steps by random amount between 5-15 every minute
    mockSteps += Math.floor(Math.random() * 10) + 5;
    callback(mockSteps);
  }, 60000); // Update every minute
  
  // Return object with remove method
  return {
    remove: () => clearInterval(intervalId)
  };
};

/**
 * Gets a mock step count for today
 * @returns {number} Mock step count
 * @private
 */
const _getMockStepsForToday = () => {
  // Generate random steps between 2000-8000
  const baseSteps = 2000 + Math.floor(Math.random() * 6000);
  
  // Adjust based on time of day
  const now = new Date();
  const hourOfDay = now.getHours();
  
  // Steps gradually increase throughout the day
  const timeMultiplier = Math.min(1, hourOfDay / 20); // Max multiplier of 1 at 8 PM
  
  return Math.floor(baseSteps * timeMultiplier);
};

/**
 * Gets mock step counts for the past week
 * @returns {Array} Array of mock step counts
 * @private
 */
const _getMockStepsForPastWeek = () => {
  const result = [];
  const goal = 10000;
  
  // Generate 7 days of mock data
  for (let i = 0; i < 7; i++) {
    // Create a pattern: some days meet the goal, some don't
    const dayType = i % 3; // 0, 1, or 2
    
    let steps;
    if (dayType === 0) {
      // Over goal (100-120%)
      steps = goal + Math.floor(Math.random() * goal * 0.2);
    } else if (dayType === 1) {
      // Just under goal (80-99%)
      steps = Math.floor(goal * (0.8 + Math.random() * 0.19));
    } else {
      // Well under goal (50-79%)
      steps = Math.floor(goal * (0.5 + Math.random() * 0.29));
    }
    
    result.push(steps);
  }
  
  return result;
};