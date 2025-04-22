import React, { createContext, useState, useEffect } from 'react';
import { getUserProfile, getFoodLogs, getFoodLogsForDateRange } from '../services/StorageService';
import { calculateBMI, calculateBMR, calculateTDEE, calculateCalorieGoal, calculateMacroGoals } from '../utils/calculators';

// Create the context
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  // State
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState({
    bmi: 0,
    bmr: 0,
    tdee: 0,
    calorieGoal: 0,
    macroGoals: {
      protein: 0,
      carbs: 0,
      fat: 0
    }
  });
  
  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);
  
  // Load user profile from storage
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      
      if (profile) {
        setUserProfile(profile);
        calculateHealthMetrics(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate health metrics
  const calculateHealthMetrics = (profile) => {
    if (!profile || !profile.weight || !profile.height || !profile.age || !profile.gender) {
      return;
    }
    
    // Calculate BMI
    const bmi = calculateBMI(profile.weight, profile.height);
    
    // Calculate BMR
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    
    // Calculate TDEE
    const tdee = calculateTDEE(bmr, profile.activityLevel || 'moderate');
    
    // Calculate calorie goal
    const calorieGoal = calculateCalorieGoal(tdee, profile.fitnessGoal || 'maintain');
    
    // Calculate macro goals
    const macroGoals = calculateMacroGoals(calorieGoal, profile.fitnessGoal || 'maintain', profile.weight);
    
    // Update state
    setHealthMetrics({
      bmi,
      bmr,
      tdee,
      calorieGoal,
      macroGoals
    });
  };
  
  // Update user profile
  const updateUserProfile = async (profile) => {
    try {
      setUserProfile(profile);
      calculateHealthMetrics(profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };
  
  // Calculate daily progress based on food logs for a specific date
  const calculateDailyProgress = (foodLogs) => {
    // Default progress
    const progress = {
      calories: {
        consumed: 0,
        goal: healthMetrics.calorieGoal,
        percentage: 0
      },
      macros: {
        protein: {
          consumed: 0,
          goal: healthMetrics.macroGoals.protein,
          percentage: 0
        },
        carbs: {
          consumed: 0,
          goal: healthMetrics.macroGoals.carbs,
          percentage: 0
        },
        fat: {
          consumed: 0,
          goal: healthMetrics.macroGoals.fat,
          percentage: 0
        }
      }
    };
    
    // Sum up all consumed nutrients
    foodLogs.forEach(food => {
      // Add calories
      progress.calories.consumed += food.calories || 0;
      
      // Add macros
      progress.macros.protein.consumed += food.protein || 0;
      progress.macros.carbs.consumed += food.carbs || 0;
      progress.macros.fat.consumed += food.fat || 0;
    });
    
    // Calculate percentages
    if (progress.calories.goal > 0) {
      progress.calories.percentage = Math.min(100, Math.round((progress.calories.consumed / progress.calories.goal) * 100));
    }
    
    if (progress.macros.protein.goal > 0) {
      progress.macros.protein.percentage = Math.min(100, Math.round((progress.macros.protein.consumed / progress.macros.protein.goal) * 100));
    }
    
    if (progress.macros.carbs.goal > 0) {
      progress.macros.carbs.percentage = Math.min(100, Math.round((progress.macros.carbs.consumed / progress.macros.carbs.goal) * 100));
    }
    
    if (progress.macros.fat.goal > 0) {
      progress.macros.fat.percentage = Math.min(100, Math.round((progress.macros.fat.consumed / progress.macros.fat.goal) * 100));
    }
    
    return progress;
  };
  
  // Get food logs for today
  const getTodayFoodLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await getFoodLogs(today);
    } catch (error) {
      console.error('Error getting today food logs:', error);
      return [];
    }
  };
  
  // Get food logs for a date range
  const getFoodLogsByDateRange = async (startDate, endDate) => {
    try {
      return await getFoodLogsForDateRange(startDate, endDate);
    } catch (error) {
      console.error('Error getting food logs by date range:', error);
      return {};
    }
  };
  
  // Check if user is onboarded
  const isOnboarded = () => {
    return !!userProfile;
  };
  
  // Provider value
  const value = {
    userProfile,
    loading,
    healthMetrics,
    updateUserProfile,
    calculateDailyProgress,
    getTodayFoodLogs,
    getFoodLogsByDateRange,
    onboarded: isOnboarded(),
    loadUserProfile,
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};