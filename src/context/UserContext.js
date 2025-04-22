import React, { createContext, useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile } from '../services/StorageService';
import { calculateRemainingCalories } from '../utils/foodAnalysis';

// Create the context
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  // State
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
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
      await saveUserProfile(profile);
      setUserProfile(profile);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };
  
  // Function to reset the user profile (for logout)
  const resetUserProfile = async () => {
    try {
      await saveUserProfile(null);
      setUserProfile(null);
      return true;
    } catch (error) {
      console.error('Error resetting user profile:', error);
      return false;
    }
  };
  
  // Function to calculate daily progress
  const calculateDailyProgress = (foodLogs) => {
    if (!userProfile) {
      return {
        caloriesConsumed: 0,
        caloriesRemaining: 0,
        percentage: 0
      };
    }
    
    // Calculate total calories consumed
    const caloriesConsumed = foodLogs.reduce((total, food) => {
      return total + (food.calories || 0);
    }, 0);
    
    // Calculate calories remaining
    const caloriesRemaining = calculateRemainingCalories(
      userProfile.calorieGoal || 2000,
      caloriesConsumed
    );
    
    // Calculate percentage of goal
    const percentage = Math.min(
      100,
      Math.round((caloriesConsumed / (userProfile.calorieGoal || 2000)) * 100)
    );
    
    return {
      caloriesConsumed,
      caloriesRemaining,
      percentage
    };
  };
  
  // Value object to be provided to consumers
  const value = {
    userProfile,
    isLoading,
    updateUserProfile,
    resetUserProfile,
    calculateDailyProgress
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};