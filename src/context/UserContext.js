import React, { createContext, useState, useEffect } from 'react';
import { saveUserProfile, getUserProfile } from '../services/StorageService';

// Create context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user profile:', error);
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Update user profile
  const updateUserProfile = async (newProfile) => {
    try {
      const updatedProfile = {
        ...(userProfile || {}),
        ...newProfile
      };
      
      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Update specific user profile field
  const updateProfileField = async (field, value) => {
    try {
      const updatedProfile = {
        ...(userProfile || {}),
        [field]: value
      };
      
      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error(`Error updating profile field ${field}:`, error);
      throw error;
    }
  };

  // Reset user profile (for logout)
  const resetUserProfile = async () => {
    try {
      await saveUserProfile(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error resetting user profile:', error);
      throw error;
    }
  };

  // Calculate daily progress
  const calculateDailyProgress = (foodLogs = []) => {
    if (!userProfile || !userProfile.calorieGoal) {
      return { caloriesConsumed: 0, caloriesRemaining: 0, percentage: 0 };
    }

    const caloriesConsumed = foodLogs.reduce((total, food) => total + (food.calories || 0), 0);
    const caloriesRemaining = Math.max(0, userProfile.calorieGoal - caloriesConsumed);
    const percentage = Math.min(100, Math.round((caloriesConsumed / userProfile.calorieGoal) * 100));

    return {
      caloriesConsumed,
      caloriesRemaining,
      percentage
    };
  };

  // Context value
  const value = {
    userProfile,
    isLoading,
    updateUserProfile,
    updateProfileField,
    resetUserProfile,
    calculateDailyProgress
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};