import React, { createContext, useState, useEffect } from 'react';
import { saveUserProfile, getUserProfile } from '../services/StorageService';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // User state
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  
  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        
        if (profile) {
          setUserProfile(profile);
          setOnboarded(true);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, []);
  
  // Update user profile
  const updateUserProfile = async (updatedProfile) => {
    try {
      // Create a new profile object with the updated data
      const newProfile = {
        ...userProfile,
        ...updatedProfile,
        updatedAt: new Date().toISOString(),
      };
      
      // Save to storage
      await saveUserProfile(newProfile);
      
      // Update state
      setUserProfile(newProfile);
      setOnboarded(true);
      
      return newProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  // Calculate progress towards daily goals
  const calculateDailyProgress = (foodLogs) => {
    if (!userProfile || !foodLogs) {
      return {
        calories: {
          consumed: 0,
          goal: userProfile?.calorieGoal || 2000,
          percentage: 0,
        },
        macros: {
          protein: {
            consumed: 0,
            goal: userProfile?.macroGoals?.protein || 100,
            percentage: 0,
          },
          carbs: {
            consumed: 0,
            goal: userProfile?.macroGoals?.carbs || 250,
            percentage: 0,
          },
          fat: {
            consumed: 0,
            goal: userProfile?.macroGoals?.fat || 70,
            percentage: 0,
          },
        },
      };
    }
    
    // Sum up nutrients from food logs
    const totals = foodLogs.reduce(
      (total, food) => {
        return {
          calories: total.calories + (food.calories || 0),
          protein: total.protein + (food.protein || 0),
          carbs: total.carbs + (food.carbs || 0),
          fat: total.fat + (food.fat || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    
    // Get goals from user profile
    const calorieGoal = userProfile.calorieGoal || 2000;
    const proteinGoal = userProfile.macroGoals?.protein || 100;
    const carbsGoal = userProfile.macroGoals?.carbs || 250;
    const fatGoal = userProfile.macroGoals?.fat || 70;
    
    // Calculate percentages (capped at 100%)
    const caloriePercentage = Math.min(
      100,
      Math.round((totals.calories / calorieGoal) * 100)
    );
    const proteinPercentage = Math.min(
      100,
      Math.round((totals.protein / proteinGoal) * 100)
    );
    const carbsPercentage = Math.min(
      100,
      Math.round((totals.carbs / carbsGoal) * 100)
    );
    const fatPercentage = Math.min(
      100,
      Math.round((totals.fat / fatGoal) * 100)
    );
    
    return {
      calories: {
        consumed: Math.round(totals.calories),
        goal: calorieGoal,
        percentage: caloriePercentage,
      },
      macros: {
        protein: {
          consumed: Math.round(totals.protein),
          goal: proteinGoal,
          percentage: proteinPercentage,
        },
        carbs: {
          consumed: Math.round(totals.carbs),
          goal: carbsGoal,
          percentage: carbsPercentage,
        },
        fat: {
          consumed: Math.round(totals.fat),
          goal: fatGoal,
          percentage: fatPercentage,
        },
      },
    };
  };
  
  return (
    <UserContext.Provider
      value={{
        userProfile,
        loading,
        onboarded,
        updateUserProfile,
        calculateDailyProgress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};