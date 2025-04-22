import React, { createContext, useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile } from '../services/StorageService';
import { calculateBMR, calculateTDEE, calculateCalorieGoal, calculateMacroGoals } from '../utils/calculators';
import { analyzeFitnessGoals } from '../services/OpenAIService';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  
  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        
        if (profile) {
          setUserProfile(profile);
          
          // Get AI recommendations if we have a profile but no recommendations yet
          if (!profile.aiRecommendations) {
            getAIRecommendations(profile);
          } else {
            setAiRecommendations(profile.aiRecommendations);
          }
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
  const updateUserProfile = async (profile) => {
    try {
      if (!profile) {
        await saveUserProfile(null);
        setUserProfile(null);
        setAiRecommendations(null);
        return;
      }
      
      // Calculate calorie and macro goals if not provided
      if (!profile.calorieGoal) {
        const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
        const tdee = calculateTDEE(bmr, profile.activityLevel);
        profile.calorieGoal = calculateCalorieGoal(tdee, profile.fitnessGoal);
        profile.macroGoals = calculateMacroGoals(profile.calorieGoal, profile.fitnessGoal, profile.weight);
      }
      
      // Save to storage and update state
      await saveUserProfile(profile);
      setUserProfile(profile);
      
      // Get AI recommendations for the updated profile
      getAIRecommendations(profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  // Get AI recommendations for the user profile
  const getAIRecommendations = async (profile) => {
    try {
      // Only get recommendations if we have a complete profile
      if (
        profile &&
        profile.age &&
        profile.weight &&
        profile.height &&
        profile.gender &&
        profile.activityLevel &&
        profile.fitnessGoal
      ) {
        // Get recommendations from OpenAI
        const recommendations = await analyzeFitnessGoals(profile);
        
        // Update profile with recommendations
        const updatedProfile = {
          ...profile,
          aiRecommendations: recommendations,
          // Update calorie and macro goals based on AI recommendations if available
          calorieGoal: recommendations.calorieGoal || profile.calorieGoal,
          macroGoals: recommendations.macroGoals || profile.macroGoals,
        };
        
        // Save to storage and update state
        await saveUserProfile(updatedProfile);
        setUserProfile(updatedProfile);
        setAiRecommendations(recommendations);
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
    }
  };
  
  return (
    <UserContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        aiRecommendations,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};