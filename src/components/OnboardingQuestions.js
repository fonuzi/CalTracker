import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';
import { 
  calculateBMI, 
  calculateBMR, 
  calculateTDEE, 
  calculateCalorieGoal,
  calculateMacroGoals,
  getBMICategory
} from '../utils/calculators';

const OnboardingQuestions = ({ onComplete, theme }) => {
  // State
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    fitnessGoal: 'maintain',
  });
  const [metrics, setMetrics] = useState({
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
  const [error, setError] = useState('');
  
  // Handle text input changes
  const handleChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    setError('');
  };
  
  // Handle button option selections
  const handleOptionSelect = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    setError('');
  };
  
  // Validate current step
  const validateStep = () => {
    switch (step) {
      case 1: // Name
        if (!userData.name.trim()) {
          setError('Please enter your name');
          return false;
        }
        break;
        
      case 2: // Age and Gender
        if (!userData.age) {
          setError('Please enter your age');
          return false;
        }
        
        const age = parseInt(userData.age);
        if (isNaN(age) || age < 16 || age > 100) {
          setError('Please enter a valid age between 16 and 100');
          return false;
        }
        break;
        
      case 3: // Weight and Height
        if (!userData.weight || !userData.height) {
          setError('Please enter both weight and height');
          return false;
        }
        
        const weight = parseFloat(userData.weight);
        const height = parseFloat(userData.height);
        
        if (isNaN(weight) || weight < 30 || weight > 300) {
          setError('Please enter a valid weight in kg');
          return false;
        }
        
        if (isNaN(height) || height < 100 || height > 250) {
          setError('Please enter a valid height in cm');
          return false;
        }
        break;
        
      case 4: // Activity Level
        if (!userData.activityLevel) {
          setError('Please select your activity level');
          return false;
        }
        break;
        
      case 5: // Fitness Goal
        if (!userData.fitnessGoal) {
          setError('Please select your fitness goal');
          return false;
        }
        break;
    }
    
    return true;
  };
  
  // Calculate user metrics
  const calculateMetrics = () => {
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height);
    const age = parseInt(userData.age);
    
    if (!isNaN(weight) && !isNaN(height) && !isNaN(age)) {
      // Calculate BMI
      const bmi = calculateBMI(weight, height);
      
      // Calculate BMR
      const bmr = calculateBMR(weight, height, age, userData.gender);
      
      // Calculate TDEE
      const tdee = calculateTDEE(bmr, userData.activityLevel);
      
      // Calculate Calorie Goal
      const calorieGoal = calculateCalorieGoal(tdee, userData.fitnessGoal);
      
      // Calculate Macro Goals
      const macroGoals = calculateMacroGoals(calorieGoal, userData.fitnessGoal, weight);
      
      setMetrics({
        bmi,
        bmr,
        tdee,
        calorieGoal,
        macroGoals
      });
    }
  };
  
  // Handle next button
  const handleNext = () => {
    Keyboard.dismiss();
    
    if (!validateStep()) {
      return;
    }
    
    if (step === 5) {
      calculateMetrics();
    }
    
    if (step < 6) {
      setStep(step + 1);
    } else {
      // Complete onboarding with user data and metrics
      onComplete({
        ...userData,
        bmi: metrics.bmi,
        bmr: metrics.bmr,
        tdee: metrics.tdee,
        calorieGoal: metrics.calorieGoal,
        macroGoals: metrics.macroGoals
      });
    }
  };
  
  // Handle back button
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };
  
  // Render activity level options
  const renderActivityLevels = () => {
    const options = [
      { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
      { value: 'light', label: 'Light', description: 'Exercise 1-3 times/week' },
      { value: 'moderate', label: 'Moderate', description: 'Exercise 3-5 times/week' },
      { value: 'active', label: 'Active', description: 'Exercise 6-7 times/week' },
      { value: 'very active', label: 'Very Active', description: 'Hard exercise daily' },
    ];
    
    return options.map(option => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.optionButton,
          { 
            backgroundColor: userData.activityLevel === option.value 
              ? theme.colors.primary 
              : theme.colors.surfaceHighlight 
          }
        ]}
        onPress={() => handleOptionSelect('activityLevel', option.value)}
      >
        <Text 
          style={[
            styles.optionLabel,
            { 
              color: userData.activityLevel === option.value 
                ? '#FFFFFF' 
                : theme.colors.text 
            }
          ]}
        >
          {option.label}
        </Text>
        <Text 
          style={[
            styles.optionDescription,
            { 
              color: userData.activityLevel === option.value 
                ? '#FFFFFF' 
                : theme.colors.secondaryText 
            }
          ]}
        >
          {option.description}
        </Text>
      </TouchableOpacity>
    ));
  };
  
  // Render fitness goal options
  const renderFitnessGoals = () => {
    const options = [
      { value: 'lose', label: 'Lose Weight', icon: 'trending-down' },
      { value: 'maintain', label: 'Maintain Weight', icon: 'minus' },
      { value: 'gain', label: 'Gain Muscle', icon: 'trending-up' },
    ];
    
    return options.map(option => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.goalButton,
          { 
            backgroundColor: userData.fitnessGoal === option.value 
              ? theme.colors.primary 
              : theme.colors.surfaceHighlight 
          }
        ]}
        onPress={() => handleOptionSelect('fitnessGoal', option.value)}
      >
        <Icon 
          name={option.icon} 
          size={24} 
          color={userData.fitnessGoal === option.value ? '#FFFFFF' : theme.colors.text} 
        />
        <Text 
          style={[
            styles.goalLabel,
            { 
              color: userData.fitnessGoal === option.value 
                ? '#FFFFFF' 
                : theme.colors.text 
            }
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    ));
  };
  
  // Render gender selection buttons
  const renderGenderOptions = () => {
    return (
      <View style={styles.genderOptions}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            { 
              backgroundColor: userData.gender === 'male' 
                ? theme.colors.primary 
                : theme.colors.surfaceHighlight 
            }
          ]}
          onPress={() => handleOptionSelect('gender', 'male')}
        >
          <Icon 
            name="user" 
            size={20} 
            color={userData.gender === 'male' ? '#FFFFFF' : theme.colors.text} 
            style={styles.genderIcon}
          />
          <Text 
            style={[
              styles.genderLabel,
              { 
                color: userData.gender === 'male' 
                  ? '#FFFFFF' 
                  : theme.colors.text 
              }
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.genderButton,
            { 
              backgroundColor: userData.gender === 'female' 
                ? theme.colors.primary 
                : theme.colors.surfaceHighlight 
            }
          ]}
          onPress={() => handleOptionSelect('gender', 'female')}
        >
          <Icon 
            name="user" 
            size={20} 
            color={userData.gender === 'female' ? '#FFFFFF' : theme.colors.text} 
            style={styles.genderIcon}
          />
          <Text 
            style={[
              styles.genderLabel,
              { 
                color: userData.gender === 'female' 
                  ? '#FFFFFF' 
                  : theme.colors.text 
              }
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render BMI result
  const renderBMIResult = () => {
    if (metrics.bmi === 0) return null;
    
    const bmiCategory = getBMICategory(metrics.bmi);
    
    return (
      <View style={[styles.resultCard, { backgroundColor: theme.colors.surfaceHighlight }]}>
        <Text style={[styles.resultLabel, { color: theme.colors.secondaryText }]}>
          BMI Score
        </Text>
        <Text style={[styles.resultValue, { color: theme.colors.text }]}>
          {metrics.bmi.toFixed(1)}
        </Text>
        <View 
          style={[
            styles.categoryPill, 
            { backgroundColor: bmiCategory.color + '30' }
          ]}
        >
          <Text style={[styles.categoryText, { color: bmiCategory.color }]}>
            {bmiCategory.category}
          </Text>
        </View>
      </View>
    );
  };
  
  // Render calorie goal result
  const renderCalorieGoalResult = () => {
    if (metrics.calorieGoal === 0) return null;
    
    return (
      <View style={[styles.resultCard, { backgroundColor: theme.colors.surfaceHighlight }]}>
        <Text style={[styles.resultLabel, { color: theme.colors.secondaryText }]}>
          Daily Calories
        </Text>
        <Text style={[styles.resultValue, { color: theme.colors.text }]}>
          {metrics.calorieGoal}
        </Text>
        <Text style={[styles.resultUnit, { color: theme.colors.secondaryText }]}>
          kcal / day
        </Text>
      </View>
    );
  };
  
  // Render macro goals result
  const renderMacroGoalsResult = () => {
    if (metrics.macroGoals.protein === 0) return null;
    
    return (
      <View style={[styles.resultCard, { backgroundColor: theme.colors.surfaceHighlight }]}>
        <Text style={[styles.resultLabel, { color: theme.colors.secondaryText }]}>
          Macronutrient Goals
        </Text>
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.protein }]}>
              {metrics.macroGoals.protein}g
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Protein
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.carbs }]}>
              {metrics.macroGoals.carbs}g
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Carbs
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.fat }]}>
              {metrics.macroGoals.fat}g
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Fat
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View 
          animation="fadeIn" 
          duration={500}
          style={styles.innerContainer}
        >
          <View style={styles.progressContainer}>
            {Array(6).fill(0).map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.progressDot,
                  { 
                    backgroundColor: step > index 
                      ? theme.colors.primary 
                      : theme.colors.surfaceHighlight 
                  }
                ]}
              />
            ))}
          </View>
          
          {step === 1 && (
            <Animatable.View 
              animation="fadeInRight" 
              duration={500}
              style={styles.stepContainer}
            >
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Welcome to NutriTrack AI
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
                Let's set up your profile to get personalized nutrition recommendations.
              </Text>
              
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                What's your name?
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.colors.surfaceHighlight,
                    color: theme.colors.text,
                    borderColor: error && !userData.name.trim() 
                      ? theme.colors.error 
                      : theme.colors.surfaceHighlight 
                  }
                ]}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.placeholder}
                value={userData.name}
                onChangeText={text => handleChange('name', text)}
                autoFocus
              />
            </Animatable.View>
          )}
          
          {step === 2 && (
            <Animatable.View 
              animation="fadeInRight" 
              duration={500}
              style={styles.stepContainer}
            >
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Age & Gender
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
                This helps us calculate your calorie and nutrient needs accurately.
              </Text>
              
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                How old are you?
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.colors.surfaceHighlight,
                    color: theme.colors.text,
                    borderColor: error && !userData.age
                      ? theme.colors.error 
                      : theme.colors.surfaceHighlight 
                  }
                ]}
                placeholder="Enter your age"
                placeholderTextColor={theme.colors.placeholder}
                value={userData.age}
                onChangeText={text => handleChange('age', text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={3}
              />
              
              <Text style={[styles.inputLabel, { color: theme.colors.text, marginTop: 16 }]}>
                What's your gender?
              </Text>
              {renderGenderOptions()}
            </Animatable.View>
          )}
          
          {step === 3 && (
            <Animatable.View 
              animation="fadeInRight" 
              duration={500}
              style={styles.stepContainer}
            >
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Weight & Height
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
                This helps us calculate your BMI and daily calorie requirements.
              </Text>
              
              <View style={styles.measurementRow}>
                <View style={styles.measurementField}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    Weight (kg)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.colors.surfaceHighlight,
                        color: theme.colors.text,
                        borderColor: error && !userData.weight
                          ? theme.colors.error 
                          : theme.colors.surfaceHighlight 
                      }
                    ]}
                    placeholder="Weight"
                    placeholderTextColor={theme.colors.placeholder}
                    value={userData.weight}
                    onChangeText={text => handleChange('weight', text.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                
                <View style={styles.measurementField}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    Height (cm)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.colors.surfaceHighlight,
                        color: theme.colors.text,
                        borderColor: error && !userData.height
                          ? theme.colors.error 
                          : theme.colors.surfaceHighlight 
                      }
                    ]}
                    placeholder="Height"
                    placeholderTextColor={theme.colors.placeholder}
                    value={userData.height}
                    onChangeText={text => handleChange('height', text.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
            </Animatable.View>
          )}
          
          {step === 4 && (
            <Animatable.View 
              animation="fadeInRight" 
              duration={500}
              style={styles.stepContainer}
            >
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Activity Level
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
                How active are you on a typical day?
              </Text>
              
              <View style={styles.optionsList}>
                {renderActivityLevels()}
              </View>
            </Animatable.View>
          )}
          
          {step === 5 && (
            <Animatable.View 
              animation="fadeInRight" 
              duration={500}
              style={styles.stepContainer}
            >
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Fitness Goal
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
                What are you looking to achieve with NutriTrack AI?
              </Text>
              
              <View style={styles.goalOptions}>
                {renderFitnessGoals()}
              </View>
            </Animatable.View>
          )}
          
          {step === 6 && (
            <Animatable.View 
              animation="fadeInRight" 
              duration={500}
              style={styles.stepContainer}
            >
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Your Personalized Plan
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
                Based on your profile, we've created your personalized nutrition plan.
              </Text>
              
              <View style={styles.resultsContainer}>
                {renderBMIResult()}
                {renderCalorieGoalResult()}
                {renderMacroGoalsResult()}
              </View>
              
              <Text style={[styles.disclaimer, { color: theme.colors.secondaryText }]}>
                These values are estimates based on standard formulas. Your actual needs may vary.
              </Text>
            </Animatable.View>
          )}
          
          {error && (
            <Animatable.View 
              animation="shake" 
              duration={500}
              style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}
            >
              <Icon name="alert-circle" size={16} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </Animatable.View>
          )}
          
          <View style={styles.buttonsContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: theme.colors.surfaceHighlight }]}
                onPress={handleBack}
              >
                <Icon name="arrow-left" size={18} color={theme.colors.text} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                { 
                  backgroundColor: theme.colors.primary,
                  marginLeft: step > 1 ? 12 : 0,
                  flex: step === 6 ? 1 : 0.7,
                }
              ]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {step === 6 ? 'Get Started' : 'Next'}
              </Text>
              {step < 6 && (
                <Icon name="arrow-right" size={18} color="#FFFFFF" style={styles.nextButtonIcon} />
              )}
            </TouchableOpacity>
          </View>
        </Animatable.View>
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
    paddingVertical: 20,
  },
  innerContainer: {
    padding: 20,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 2,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  genderIcon: {
    marginRight: 8,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  measurementField: {
    flex: 0.48,
  },
  optionsList: {
    marginTop: 8,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
  },
  goalOptions: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalButton: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  resultUnit: {
    fontSize: 14,
    marginTop: 2,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonIcon: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
});

export default OnboardingQuestions;