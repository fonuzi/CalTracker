import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Icon } from '../assets/icons';
import { saveUserProfile } from '../services/StorageService';
import { calculateBMR, calculateTDEE, calculateCalorieGoal, calculateMacroGoals } from '../utils/calculators';

const OnboardingScreen = ({ navigation, onComplete, theme }) => {
  // State for user inputs
  const [step, setStep] = useState(1);
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: 30,
    gender: 'male',
    heightCm: 175,
    weightKg: 70,
    activityLevel: 'moderate',
    fitnessGoal: 'maintain',
  });
  
  // Update profile field
  const updateProfile = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Go to next step
  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };
  
  // Go to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      // Calculate health metrics
      const bmr = calculateBMR(
        userProfile.weightKg, 
        userProfile.heightCm, 
        userProfile.age, 
        userProfile.gender
      );
      
      const tdee = calculateTDEE(bmr, userProfile.activityLevel);
      const calorieGoal = calculateCalorieGoal(tdee, userProfile.fitnessGoal);
      const macroGoals = calculateMacroGoals(
        calorieGoal, 
        userProfile.fitnessGoal, 
        userProfile.weightKg
      );
      
      // Create final profile with calculations
      const finalProfile = {
        ...userProfile,
        bmr,
        tdee,
        dailyCalorieGoal: calorieGoal,
        macroGoals,
        stepGoal: 10000,
        createdAt: new Date().toISOString()
      };
      
      // Save profile
      await saveUserProfile(finalProfile);
      
      // Complete onboarding
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Welcome to NutriTrack AI
            </Text>
            <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
              Let's get started by setting up your profile. This will help us personalize your nutrition recommendations.
            </Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Personal Details
            </Text>
            <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
              This information helps us calculate your calorie needs more accurately.
            </Text>
            
            {/* Form fields would go here */}
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Activity Level
            </Text>
            <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
              Select the option that best describes your typical activity level.
            </Text>
            
            {/* Activity level options would go here */}
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Fitness Goals
            </Text>
            <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
              What are you trying to achieve with your nutrition?
            </Text>
            
            {/* Fitness goal options would go here */}
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Your Nutrition Plan
            </Text>
            <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
              Based on your information, here's your personalized nutrition plan:
            </Text>
            
            {/* Summary of calculated nutrition plan would go here */}
          </View>
        );
      default:
        return null;
    }
  };
  
  // Render progress dots
  const renderProgressDots = () => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.progressDot,
            {
              backgroundColor: i <= step 
                ? theme.colors.primary 
                : theme.colors.disabled
            }
          ]}
        />
      );
    }
    return <View style={styles.progressDotsContainer}>{dots}</View>;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Animatable.View
          animation="fadeIn"
          duration={600}
          style={styles.contentContainer}
        >
          {renderStepContent()}
        </Animatable.View>
      </ScrollView>
      
      {/* Bottom navigation */}
      <View style={[styles.bottomContainer, { backgroundColor: theme.colors.background }]}>
        {renderProgressDots()}
        
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.backButton, { borderColor: theme.colors.border }]}
              onPress={prevStep}
            >
              <Icon name="arrow-left" size={20} color={theme.colors.text} />
              <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
                Back
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.button, 
              styles.nextButton, 
              { backgroundColor: theme.colors.primary }
            ]}
            onPress={nextStep}
          >
            <Text style={styles.nextButtonText}>
              {step === 5 ? 'Get Started' : 'Next'}
            </Text>
            {step < 5 && <Icon name="arrow-right" size={20} color="#FFFFFF" style={styles.nextIcon} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepContent: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  nextButton: {
    marginLeft: 'auto',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextIcon: {
    marginLeft: 8,
  },
});

export default OnboardingScreen;