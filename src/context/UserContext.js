import React, { createContext, useState, useEffect } from 'react';
import { getUserProfile, getFoodLogs } from '../services/StorageService';
import { getStepsForToday } from '../services/HealthKitService';

// Create context
export const UserContext = createContext();

// User provider component
export const UserProvider = ({ children }) => {
  // State for user profile
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todaysFoodLogs, setTodaysFoodLogs] = useState([]);
  const [todaysSteps, setTodaysSteps] = useState(0);
  const [todaysNutrition, setTodaysNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);
  
  // Load today's food logs
  useEffect(() => {
    loadTodaysFoodLogs();
  }, []);
  
  // Load today's steps
  useEffect(() => {
    loadTodaysSteps();
  }, []);
  
  // Update nutrition when food logs change
  useEffect(() => {
    updateNutritionTotals();
  }, [todaysFoodLogs]);
  
  // Load user profile
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getUserProfile();
      setUserProfile(profile || null);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load today's food logs
  const loadTodaysFoodLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const logs = await getFoodLogs(today);
      setTodaysFoodLogs(logs || []);
    } catch (error) {
      console.error('Error loading food logs:', error);
    }
  };
  
  // Load today's steps
  const loadTodaysSteps = async () => {
    try {
      const steps = await getStepsForToday();
      setTodaysSteps(steps);
    } catch (error) {
      console.error('Error loading steps:', error);
    }
  };
  
  // Update nutrition totals
  const updateNutritionTotals = () => {
    if (!todaysFoodLogs || todaysFoodLogs.length === 0) {
      setTodaysNutrition({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      return;
    }
    
    const totals = todaysFoodLogs.reduce(
      (acc, food) => {
        return {
          calories: acc.calories + (food.calories || 0),
          protein: acc.protein + (food.protein || 0),
          carbs: acc.carbs + (food.carbs || 0),
          fat: acc.fat + (food.fat || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    
    setTodaysNutrition(totals);
  };
  
  // Calculate calories remaining
  const getCaloriesRemaining = () => {
    if (!userProfile || !userProfile.dailyCalorieGoal) return 0;
    
    const remaining = userProfile.dailyCalorieGoal - todaysNutrition.calories;
    return Math.max(0, remaining);
  };
  
  // Calculate macro percentages
  const getMacroPercentages = () => {
    const { protein, carbs, fat } = todaysNutrition;
    const total = protein * 4 + carbs * 4 + fat * 9;
    
    if (total === 0) {
      return { protein: 0, carbs: 0, fat: 0 };
    }
    
    return {
      protein: Math.round((protein * 4 * 100) / total),
      carbs: Math.round((carbs * 4 * 100) / total),
      fat: Math.round((fat * 9 * 100) / total),
    };
  };
  
  // Update user profile
  const updateUserProfile = async (newProfile) => {
    try {
      setUserProfile(newProfile);
      await saveUserProfile(newProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };
  
  // Refresh all data
  const refreshData = async () => {
    try {
      await Promise.all([
        loadUserProfile(),
        loadTodaysFoodLogs(),
        loadTodaysSteps(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };
  
  // Provide context
  return (
    <UserContext.Provider
      value={{
        userProfile,
        isLoading,
        todaysFoodLogs,
        todaysSteps,
        todaysNutrition,
        getCaloriesRemaining,
        getMacroPercentages,
        updateUserProfile,
        refreshData,
        loadTodaysFoodLogs,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};