import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { analyzeFitnessGoals } from '../services/OpenAIService';
import { calculateBMI, calculateBMR, calculateTDEE, calculateCalorieGoal, calculateMacroGoals } from '../utils/calculators';
import * as Animatable from 'react-native-animatable';

const OnboardingScreen = ({ theme }) => {
  const { updateUserProfile } = useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    fitnessGoal: 'maintain',
    dietaryRestrictions: []
  });
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  
  // Handle input changes
  const handleChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle selection of gender, activity level, fitness goal, etc.
  const handleSelect = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };
  
  // Toggle dietary restriction
  const toggleRestriction = (restriction) => {
    setUserData(prev => {
      const restrictions = [...prev.dietaryRestrictions];
      const index = restrictions.indexOf(restriction);
      
      if (index >= 0) {
        restrictions.splice(index, 1);
      } else {
        restrictions.push(restriction);
      }
      
      return { ...prev, dietaryRestrictions: restrictions };
    });
  };
  
  // Navigate to next step
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Complete onboarding and save user profile
  const completeOnboarding = async () => {
    try {
      setLoading(true);
      
      // Calculate health metrics
      const weight = parseFloat(userData.weight);
      const height = parseFloat(userData.height);
      
      const bmi = calculateBMI(weight, height);
      const bmr = calculateBMR(weight, height, parseInt(userData.age), userData.gender);
      const tdee = calculateTDEE(bmr, userData.activityLevel);
      const calorieGoal = calculateCalorieGoal(tdee, userData.fitnessGoal);
      const macroGoals = calculateMacroGoals(calorieGoal, userData.fitnessGoal, weight);
      
      // Add health metrics to user data
      const enrichedUserData = {
        ...userData,
        bmi,
        bmr,
        tdee,
        calorieGoal,
        macroGoals,
        theme: 'dark',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      };
      
      // Get AI-powered recommendations based on user data
      const aiRecommendations = await analyzeFitnessGoals(enrichedUserData);
      
      // Save recommendations for display
      setRecommendations(aiRecommendations);
      
      // Add recommendations to user data
      enrichedUserData.recommendations = aiRecommendations;
      
      // Save complete user profile
      await updateUserProfile(enrichedUserData);
      
      // Go to final step to show recommendations
      nextStep();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('There was an error completing your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render basic input field
  const renderInput = (label, field, placeholder, keyboardType = 'default') => {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            { 
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          value={userData[field]}
          onChangeText={(text) => handleChange(field, text)}
          keyboardType={keyboardType}
        />
      </View>
    );
  };
  
  // Render option button for selections (gender, activity level, etc.)
  const renderOption = (field, value, label) => {
    const isSelected = userData[field] === value;
    return (
      <TouchableOpacity
        style={[
          styles.optionButton,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border
          }
        ]}
        onPress={() => handleSelect(field, value)}
      >
        <Text
          style={[
            styles.optionLabel,
            { color: isSelected ? '#FFFFFF' : theme.colors.text }
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render dietary restriction toggle
  const renderRestrictionToggle = (value, label) => {
    const isSelected = userData.dietaryRestrictions.includes(value);
    return (
      <TouchableOpacity
        style={[
          styles.restrictionToggle,
          {
            backgroundColor: isSelected ? theme.colors.primary + '20' : 'transparent',
            borderColor: isSelected ? theme.colors.primary : theme.colors.border
          }
        ]}
        onPress={() => toggleRestriction(value)}
      >
        <Text
          style={[
            styles.restrictionLabel,
            { color: isSelected ? theme.colors.primary : theme.colors.text }
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animatable.View animation="fadeIn" duration={500}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Welcome to NutriTrack AI
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
              Let's set up your profile to get personalized nutrition and fitness recommendations.
            </Text>
            
            {renderInput('What should we call you?', 'name', 'Your name')}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={nextStep}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        );
        
      case 2:
        return (
          <Animatable.View animation="fadeIn" duration={500}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Basic Information
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
              We need some basic information to calculate your nutritional needs.
            </Text>
            
            {renderInput('Age', 'age', 'Your age', 'numeric')}
            
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Gender</Text>
            <View style={styles.optionsRow}>
              {renderOption('gender', 'male', 'Male')}
              {renderOption('gender', 'female', 'Female')}
              {renderOption('gender', 'other', 'Other')}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.buttonSecondary, { borderColor: theme.colors.border }]}
                onPress={prevStep}
              >
                <Text style={[styles.buttonSecondaryText, { color: theme.colors.text }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={nextStep}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        );
        
      case 3:
        return (
          <Animatable.View animation="fadeIn" duration={500}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Physical Metrics
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
              Let's get your weight and height to calculate your ideal calorie intake.
            </Text>
            
            {renderInput('Weight (kg)', 'weight', 'Your weight in kilograms', 'numeric')}
            {renderInput('Height (cm)', 'height', 'Your height in centimeters', 'numeric')}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.buttonSecondary, { borderColor: theme.colors.border }]}
                onPress={prevStep}
              >
                <Text style={[styles.buttonSecondaryText, { color: theme.colors.text }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={nextStep}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        );
        
      case 4:
        return (
          <Animatable.View animation="fadeIn" duration={500}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Activity & Goals
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
              Tell us about your activity level and fitness goals.
            </Text>
            
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Activity Level</Text>
            <View style={styles.optionsColumn}>
              {renderOption('activityLevel', 'sedentary', 'Sedentary (little or no exercise)')}
              {renderOption('activityLevel', 'light', 'Light (exercise 1-3 times/week)')}
              {renderOption('activityLevel', 'moderate', 'Moderate (exercise 3-5 times/week)')}
              {renderOption('activityLevel', 'active', 'Active (exercise 6-7 times/week)')}
              {renderOption('activityLevel', 'very_active', 'Very Active (hard exercise daily)')}
            </View>
            
            <Text style={[styles.sectionLabel, { color: theme.colors.text, marginTop: 20 }]}>Fitness Goal</Text>
            <View style={styles.optionsColumn}>
              {renderOption('fitnessGoal', 'lose', 'Lose Weight')}
              {renderOption('fitnessGoal', 'maintain', 'Maintain Weight')}
              {renderOption('fitnessGoal', 'gain', 'Gain Muscle')}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.buttonSecondary, { borderColor: theme.colors.border }]}
                onPress={prevStep}
              >
                <Text style={[styles.buttonSecondaryText, { color: theme.colors.text }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={nextStep}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        );
        
      case 5:
        return (
          <Animatable.View animation="fadeIn" duration={500}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Dietary Preferences
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
              Do you have any dietary restrictions or preferences?
            </Text>
            
            <View style={styles.restrictionsContainer}>
              {renderRestrictionToggle('vegetarian', 'Vegetarian')}
              {renderRestrictionToggle('vegan', 'Vegan')}
              {renderRestrictionToggle('gluten_free', 'Gluten-Free')}
              {renderRestrictionToggle('dairy_free', 'Dairy-Free')}
              {renderRestrictionToggle('keto', 'Keto')}
              {renderRestrictionToggle('paleo', 'Paleo')}
              {renderRestrictionToggle('low_carb', 'Low-Carb')}
              {renderRestrictionToggle('low_fat', 'Low-Fat')}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.buttonSecondary, { borderColor: theme.colors.border }]}
                onPress={prevStep}
              >
                <Text style={[styles.buttonSecondaryText, { color: theme.colors.text }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={completeOnboarding}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Processing...' : 'Complete Setup'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        );
        
      case 6:
        // Final step with recommendations
        return (
          <Animatable.View animation="fadeIn" duration={500}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              You're all set!
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
              Based on your information, here are some personalized recommendations:
            </Text>
            
            {recommendations && (
              <View style={styles.recommendationsContainer}>
                <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
                  Recommended Daily Intake
                </Text>
                <Text style={[styles.recommendationValue, { color: theme.colors.primary }]}>
                  {userData.calorieGoal} calories
                </Text>
                
                <Text style={[styles.sectionLabel, { color: theme.colors.text, marginTop: 15 }]}>
                  Macronutrient Goals
                </Text>
                <View style={styles.macrosContainer}>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: theme.colors.text }]}>
                      {userData.macroGoals.protein}g
                    </Text>
                    <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                      Protein
                    </Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: theme.colors.text }]}>
                      {userData.macroGoals.carbs}g
                    </Text>
                    <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                      Carbs
                    </Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: theme.colors.text }]}>
                      {userData.macroGoals.fat}g
                    </Text>
                    <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                      Fat
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.sectionLabel, { color: theme.colors.text, marginTop: 15 }]}>
                  AI Recommendations
                </Text>
                {recommendations.recommendations && recommendations.recommendations.map((rec, i) => (
                  <Text 
                    key={i} 
                    style={[styles.recommendationText, { color: theme.colors.secondaryText }]}
                  >
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  // Navigate to the main app
                  // This will happen automatically because we updated userProfile in context
                }}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5, 6].map(step => (
            <View
              key={step}
              style={[
                styles.progressDot,
                {
                  backgroundColor: currentStep >= step ? theme.colors.primary : theme.colors.border,
                  width: currentStep === step ? 12 : 8,
                  height: currentStep === step ? 12 : 8,
                }
              ]}
            />
          ))}
        </View>
        
        {/* Step content */}
        {renderStepContent()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  optionsColumn: {
    marginBottom: 20,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  restrictionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  restrictionToggle: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  restrictionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 10,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginBottom: 30,
  },
  recommendationValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  macroLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
  },
});

export default OnboardingScreen;