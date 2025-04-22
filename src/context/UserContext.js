import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default initial user profile
const initialUserProfile = null;

// Create the context
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  // State for user data
  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem('user_profile');
        
        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, []);
  
  // Function to update the user profile
  const updateUserProfile = async (profile) => {
    try {
      // Update state
      setUserProfile(profile);
      
      // Save to storage if not null
      if (profile) {
        await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
      } else {
        await AsyncStorage.removeItem('user_profile');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };
  
  // Function to reset the user profile (for logout)
  const resetUserProfile = async () => {
    try {
      // Clear state
      setUserProfile(null);
      
      // Remove from storage
      await AsyncStorage.removeItem('user_profile');
      
      return true;
    } catch (error) {
      console.error('Error resetting user profile:', error);
      return false;
    }
  };
  
  // Calculate daily nutrition progress
  const calculateDailyProgress = (foodLogs) => {
    // Default to 0 if no logs or profile
    if (!foodLogs || !foodLogs.length) {
      return {
        caloriesConsumed: 0,
        caloriesRemaining: userProfile?.calorieGoal || 2000,
        percentage: 0
      };
    }
    
    // Sum up calories from all logs
    const caloriesConsumed = foodLogs.reduce((total, food) => {
      return total + (parseFloat(food.calories) || 0);
    }, 0);
    
    // Get the calorie goal from user profile or default to 2000
    const calorieGoal = userProfile?.calorieGoal || 2000;
    
    // Calculate remaining calories
    const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed);
    
    // Calculate percentage of goal
    const percentage = Math.min(100, Math.round((caloriesConsumed / calorieGoal) * 100));
    
    return {
      caloriesConsumed,
      caloriesRemaining,
      percentage
    };
  };
  
  // Calculate macronutrient totals from food logs
  const calculateMacroTotals = (foodLogs) => {
    if (!foodLogs || !foodLogs.length) {
      return {
        protein: 0,
        carbs: 0,
        fat: 0
      };
    }
    
    return foodLogs.reduce((totals, food) => {
      return {
        protein: totals.protein + (parseFloat(food.protein) || 0),
        carbs: totals.carbs + (parseFloat(food.carbs) || 0),
        fat: totals.fat + (parseFloat(food.fat) || 0)
      };
    }, { protein: 0, carbs: 0, fat: 0 });
  };
  
  // Pack the context value
  const contextValue = {
    userProfile,
    isLoading,
    updateUserProfile,
    resetUserProfile,
    calculateDailyProgress,
    calculateMacroTotals
  };
  
  // Return the provider with the context value
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};