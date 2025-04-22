import React from 'react';
import { StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import { Text, TextInput, Button, RadioButton, Checkbox } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const OnboardingQuestions = ({ step, width, theme, userResponses, onUpdateResponse, onNext, onBack }) => {
  // Helper for radio button selection
  const handleRadioSelect = (field, value) => {
    onUpdateResponse(field, value);
  };
  
  // Helper for checkbox toggle
  const toggleRestriction = (restriction) => {
    const currentRestrictions = [...(userResponses.dietaryRestrictions || [])];
    const index = currentRestrictions.indexOf(restriction);
    
    if (index === -1) {
      // Add if not present
      currentRestrictions.push(restriction);
    } else {
      // Remove if present
      currentRestrictions.splice(index, 1);
    }
    
    onUpdateResponse('dietaryRestrictions', currentRestrictions);
  };
  
  // Check if a restriction is selected
  const isRestrictionSelected = (restriction) => {
    return userResponses.dietaryRestrictions?.includes(restriction) || false;
  };

  // Define activity levels for selection
  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Lightly active (light exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderately active (moderate exercise 3-5 days/week)' },
    { value: 'active', label: 'Active (hard exercise 6-7 days/week)' },
    { value: 'very_active', label: 'Very active (very hard exercise & physical job)' }
  ];
  
  // Define fitness goals for selection
  const fitnessGoals = [
    { value: 'lose_weight', label: 'Lose Weight' },
    { value: 'maintain', label: 'Maintain Weight' },
    { value: 'gain_muscle', label: 'Gain Muscle' },
    { value: 'improve_fitness', label: 'Improve Overall Fitness' }
  ];
  
  // Define dietary restrictions for selection
  const dietaryRestrictions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut Allergy',
    'Shellfish Allergy',
    'Kosher',
    'Halal',
    'Keto',
    'Low Carb'
  ];

  // Validation function
  const isStepValid = () => {
    switch (step) {
      case 1: // Name
        return userResponses.name && userResponses.name.trim() !== '';
      case 2: // Age
        return userResponses.age && userResponses.age.trim() !== '' && !isNaN(parseInt(userResponses.age, 10));
      case 3: // Gender
        return userResponses.gender && userResponses.gender.trim() !== '';
      case 4: // Weight
        return userResponses.weight && userResponses.weight.trim() !== '' && !isNaN(parseFloat(userResponses.weight));
      case 5: // Height
        return userResponses.height && userResponses.height.trim() !== '' && !isNaN(parseFloat(userResponses.height));
      case 6: // Activity Level
        return userResponses.activityLevel && userResponses.activityLevel.trim() !== '';
      case 7: // Fitness Goal
        return userResponses.fitnessGoal && userResponses.fitnessGoal.trim() !== '';
      default:
        return true;
    }
  };

  // Render appropriate question based on step
  const renderQuestion = () => {
    switch (step) {
      case 1:
        return (
          <View style={[styles.slide, { backgroundColor: theme.colors.background, width }]}>
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.content}>
              <Feather name="user" size={50} color={theme.colors.primary} style={styles.icon} />
              <Text style={[styles.question, { color: theme.colors.text }]}>
                What's your name?
              </Text>
              <TextInput
                label="Your Name"
                value={userResponses.name}
                onChangeText={(text) => onUpdateResponse('name', text)}
                style={styles.textInput}
                mode="outlined"
              />
              <View style={styles.buttonContainer}>
                <Button 
                  mode="outlined" 
                  onPress={onBack}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Back
                </Button>
                <Button 
                  mode="contained" 
                  onPress={onNext}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                  disabled={!isStepValid()}
                >
                  Next
                </Button>
              </View>
            </Animated.View>
          </View>
        );

      default:
        return (
          <View style={[styles.slide, { backgroundColor: theme.colors.background, width }]}>
            <Text>Question {step}</Text>
            <View style={styles.buttonContainer}>
              <Button mode="outlined" onPress={onBack}>Back</Button>
              <Button mode="contained" onPress={onNext}>Next</Button>
            </View>
          </View>
        );
    }
  };

  return renderQuestion();
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 30,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  textInput: {
    width: '100%',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    minWidth: 120,
  },
  buttonLabel: {
    fontSize: 16,
    padding: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  checkboxContainer: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 20,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default OnboardingQuestions;