import React, { useState, useContext } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

// Import components and utilities
import OnboardingQuestions from '../components/OnboardingQuestions';
import { UserContext } from '../context/UserContext';
import { analyzeFitnessGoals } from '../services/OpenAIService';
import { 
  calculateBMI, 
  calculateBMR, 
  calculateTDEE, 
  calculateCalorieGoal,
  calculateMacroGoals 
} from '../utils/calculators';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const theme = useTheme();
  const { updateUserProfile } = useContext(UserContext);
  
  // State for onboarding
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userResponses, setUserResponses] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    fitnessGoal: '',
    dietaryRestrictions: []
  });
  
  // Function to handle moving to next step
  const handleNext = () => {
    if (step < 8) {
      setStep(step + 1);
    } else {
      handleCompleteOnboarding();
    }
  };
  
  // Function to handle moving to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Function to update user responses
  const handleUpdateResponse = (field, value) => {
    setUserResponses(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Function to handle completing the onboarding flow
  const handleCompleteOnboarding = async () => {
    setIsProcessing(true);
    
    try {
      // Calculate health metrics
      const weightKg = parseFloat(userResponses.weight);
      const heightCm = parseFloat(userResponses.height);
      const age = parseInt(userResponses.age, 10);
      const gender = userResponses.gender.toLowerCase();
      
      // Calculate BMI, BMR, TDEE
      const bmi = calculateBMI(weightKg, heightCm);
      const bmr = calculateBMR(weightKg, heightCm, age, gender);
      const tdee = calculateTDEE(bmr, userResponses.activityLevel);
      const calorieGoal = calculateCalorieGoal(tdee, userResponses.fitnessGoal);
      const macroGoals = calculateMacroGoals(calorieGoal, userResponses.fitnessGoal, weightKg);
      
      // Get AI recommendations based on profile
      const aiRecommendations = await getAIRecommendations({
        ...userResponses,
        bmi,
        bmr,
        tdee,
        calorieGoal,
        macroGoals
      });
      
      // Create user profile
      const userProfile = {
        ...userResponses,
        bmi,
        bmr,
        tdee,
        calorieGoal,
        macroGoals,
        stepGoal: 10000, // Default step goal
        waterGoal: 8, // Default water goal (cups)
        recommendations: aiRecommendations?.recommendations || [],
        onboardingCompleted: true,
        onboardingDate: new Date().toISOString(),
      };
      
      // Save user profile
      await updateUserProfile(userProfile);
      
      // Navigate to main app
      navigation.replace('Main');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Continue anyway to avoid blocking the user
      navigation.replace('Main');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to get AI recommendations
  const getAIRecommendations = async (userData) => {
    try {
      const recommendations = await analyzeFitnessGoals(userData);
      return recommendations;
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return null;
    }
  };
  
  // Render the welcome screen (step 0)
  const renderWelcomeScreen = () => {
    return (
      <View style={[styles.slide, { backgroundColor: theme.colors.background, width }]}>
        <Animatable.View animation="fadeIn" style={styles.welcomeContent}>
          <Feather name="activity" size={80} color={theme.colors.primary} style={styles.welcomeIcon} />
          
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
            Welcome to NutriTrack AI
          </Text>
          
          <Text style={[styles.welcomeSubtitle, { color: theme.colors.secondaryText }]}>
            Your personal AI-powered nutrition assistant
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Feather name="camera" size={24} color={theme.colors.primary} style={styles.featureIcon} />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  Image Recognition
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.secondaryText }]}>
                  Take photos of your food for instant nutritional analysis
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Feather name="activity" size={24} color={theme.colors.primary} style={styles.featureIcon} />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  Activity Tracking
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.secondaryText }]}>
                  Track your steps and daily activity
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Feather name="trending-up" size={24} color={theme.colors.primary} style={styles.featureIcon} />
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  Personalized Insights
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.secondaryText }]}>
                  Get AI-powered recommendations tailored to your goals
                </Text>
              </View>
            </View>
          </View>
          
          <Button 
            mode="contained" 
            onPress={() => setStep(1)}
            style={styles.getStartedButton}
            contentStyle={styles.getStartedButtonContent}
            labelStyle={styles.getStartedButtonLabel}
          >
            Get Started
          </Button>
        </Animatable.View>
      </View>
    );
  };
  
  // If step is 0, show welcome screen
  if (step === 0) {
    return renderWelcomeScreen();
  }
  
  // Render the processing screen
  if (isProcessing) {
    return (
      <View style={[styles.slide, { backgroundColor: theme.colors.background }]}>
        <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite">
          <Feather name="activity" size={50} color={theme.colors.primary} />
        </Animatable.View>
        <Text style={[styles.processingText, { color: theme.colors.text }]}>
          Creating your personalized plan...
        </Text>
      </View>
    );
  }
  
  // Return the onboarding questions
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View 
            key={`step-${index}`}
            style={[
              styles.progressDot,
              { 
                backgroundColor: index < step 
                  ? theme.colors.primary 
                  : theme.colors.disabled 
              }
            ]}
          />
        ))}
      </View>
      
      {/* Questions */}
      <OnboardingQuestions
        step={step}
        width={width}
        theme={theme}
        userResponses={userResponses}
        onUpdateResponse={handleUpdateResponse}
        onNext={handleNext}
        onBack={handleBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  // Welcome screen styles
  welcomeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  welcomeIcon: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  featureList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
  },
  getStartedButton: {
    width: '100%',
  },
  getStartedButtonContent: {
    height: 50,
  },
  getStartedButtonLabel: {
    fontSize: 18,
  },
});

export default OnboardingScreen;