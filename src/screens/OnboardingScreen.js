import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';
import { requestHealthKitPermissions } from '../services/HealthKitService';
import OnboardingQuestions from '../components/OnboardingQuestions';
import { calculateBMI, calculateBMR, calculateTDEE, calculateCalorieGoal, calculateMacroGoals } from '../utils/calculators';

const OnboardingScreen = ({ theme, onComplete }) => {
  const { updateUserProfile } = useContext(UserContext);
  
  // Onboarding state
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // User data state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('other');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [fitnessGoal, setFitnessGoal] = useState('maintain');
  
  // Form validation
  const isCurrentStepValid = () => {
    switch (step) {
      case 0:
        return true; // Welcome screen
      case 1:
        return name.trim() !== ''; // Name is required
      case 2:
        return age !== '' && parseInt(age) > 0 && parseInt(age) < 120; // Age is required and should be reasonable
      case 3:
        return gender !== ''; // Gender is required
      case 4:
        return weight !== '' && height !== ''; // Weight and height are required
      case 5:
        return true; // Activity level is already set with default value
      case 6:
        return true; // Fitness goal is already set with default value
      default:
        return true;
    }
  };
  
  // Check if all steps are valid
  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      age !== '' &&
      gender !== '' &&
      weight !== '' &&
      height !== ''
    );
  };
  
  // Move to next step
  const handleNext = () => {
    if (!isCurrentStepValid()) {
      Alert.alert('Missing Information', 'Please fill in all the required fields before continuing.');
      return;
    }
    
    if (step < 7) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };
  
  // Move to previous step
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  // Handle onboarding completion
  const handleComplete = async () => {
    if (!isFormValid()) {
      Alert.alert('Missing Information', 'Please fill in all the required fields before completing onboarding.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Request health kit permissions for step tracking
      await requestHealthKitPermissions();
      
      // Parse numerical values
      const ageNum = parseInt(age);
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      
      // Calculate health metrics
      const bmi = calculateBMI(weightNum, heightNum);
      const bmr = calculateBMR(weightNum, heightNum, ageNum, gender);
      const tdee = calculateTDEE(bmr, activityLevel);
      const calorieGoal = calculateCalorieGoal(tdee, fitnessGoal);
      const macroGoals = calculateMacroGoals(calorieGoal, fitnessGoal, weightNum);
      
      // Create user profile
      const userProfile = {
        name,
        age: ageNum,
        gender,
        weight: weightNum,
        height: heightNum,
        activityLevel,
        fitnessGoal,
        bmi,
        bmr,
        tdee,
        calorieGoal,
        macroGoals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save user profile
      await updateUserProfile(userProfile);
      
      // Complete onboarding
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Welcome screen
  const WelcomeScreen = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.stepContainer}>
      <Text style={[styles.welcomeTitle, { color: theme.colors.primary }]}>
        Welcome to NutriTrack AI
      </Text>
      <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
        Your personal AI-powered nutrition assistant
      </Text>
      <View style={styles.featureRow}>
        <Icon name="camera" size={24} color={theme.colors.primary} style={styles.featureIcon} />
        <View style={styles.featureTextContainer}>
          <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
            Analyze Food with AI
          </Text>
          <Text style={[styles.featureDescription, { color: theme.colors.secondaryText }]}>
            Take photos of your meals or describe them for instant nutritional analysis
          </Text>
        </View>
      </View>
      <View style={styles.featureRow}>
        <Icon name="activity" size={24} color={theme.colors.primary} style={styles.featureIcon} />
        <View style={styles.featureTextContainer}>
          <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
            Track Steps & Activity
          </Text>
          <Text style={[styles.featureDescription, { color: theme.colors.secondaryText }]}>
            Automatically track your steps and daily activity
          </Text>
        </View>
      </View>
      <View style={styles.featureRow}>
        <Icon name="zap" size={24} color={theme.colors.primary} style={styles.featureIcon} />
        <View style={styles.featureTextContainer}>
          <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
            Personalized Recommendations
          </Text>
          <Text style={[styles.featureDescription, { color: theme.colors.secondaryText }]}>
            Get AI-powered nutrition insights tailored to your goals
          </Text>
        </View>
      </View>
    </Animatable.View>
  );
  
  // Name input screen
  const NameScreen = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        What's your name?
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
        We'll use this to personalize your experience
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceHighlight,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Enter your name"
        placeholderTextColor={theme.colors.placeholder}
        value={name}
        onChangeText={setName}
        autoFocus
      />
    </Animatable.View>
  );
  
  // Age input screen
  const AgeScreen = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        How old are you?
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
        Your age helps us calculate your nutritional needs
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceHighlight,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Enter your age"
        placeholderTextColor={theme.colors.placeholder}
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        maxLength={3}
        autoFocus
      />
    </Animatable.View>
  );
  
  // Gender selection screen
  const GenderScreen = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        What's your gender?
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
        This helps us calculate your calorie needs more accurately
      </Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            {
              backgroundColor: gender === 'male' ? theme.colors.primary : theme.colors.surfaceHighlight,
              borderColor: gender === 'male' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setGender('male')}
        >
          <Icon
            name="user"
            size={28}
            color={gender === 'male' ? '#FFFFFF' : theme.colors.text}
            style={styles.optionIcon}
          />
          <Text
            style={[
              styles.optionText,
              { color: gender === 'male' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.optionButton,
            {
              backgroundColor: gender === 'female' ? theme.colors.primary : theme.colors.surfaceHighlight,
              borderColor: gender === 'female' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setGender('female')}
        >
          <Icon
            name="user"
            size={28}
            color={gender === 'female' ? '#FFFFFF' : theme.colors.text}
            style={styles.optionIcon}
          />
          <Text
            style={[
              styles.optionText,
              { color: gender === 'female' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.optionButton,
            {
              backgroundColor: gender === 'other' ? theme.colors.primary : theme.colors.surfaceHighlight,
              borderColor: gender === 'other' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setGender('other')}
        >
          <Icon
            name="user"
            size={28}
            color={gender === 'other' ? '#FFFFFF' : theme.colors.text}
            style={styles.optionIcon}
          />
          <Text
            style={[
              styles.optionText,
              { color: gender === 'other' ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            Other
          </Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );
  
  // Weight & Height input screen
  const MeasurementsScreen = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        What's your weight & height?
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
        This helps us calculate your BMI and calorie needs
      </Text>
      
      <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
        Weight (kg)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceHighlight,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Enter your weight in kg"
        placeholderTextColor={theme.colors.placeholder}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        autoFocus
      />
      
      <Text style={[styles.inputLabel, { color: theme.colors.text, marginTop: 16 }]}>
        Height (cm)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceHighlight,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Enter your height in cm"
        placeholderTextColor={theme.colors.placeholder}
        value={height}
        onChangeText={setHeight}
        keyboardType="decimal-pad"
      />
    </Animatable.View>
  );
  
  // Activity level selection screen
  const ActivityLevelScreen = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        What's your activity level?
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
        This helps us estimate your daily calorie needs
      </Text>
      
      <ScrollView style={styles.activityLevelContainer}>
        <TouchableOpacity
          style={[
            styles.activityOption,
            {
              backgroundColor: activityLevel === 'sedentary' ? theme.colors.primary + '20' : 'transparent',
              borderColor: activityLevel === 'sedentary' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setActivityLevel('sedentary')}
        >
          <Text
            style={[
              styles.activityTitle,
              { color: activityLevel === 'sedentary' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            Sedentary
          </Text>
          <Text
            style={[styles.activityDescription, { color: theme.colors.secondaryText }]}
          >
            Little to no exercise, desk job
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.activityOption,
            {
              backgroundColor: activityLevel === 'light' ? theme.colors.primary + '20' : 'transparent',
              borderColor: activityLevel === 'light' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setActivityLevel('light')}
        >
          <Text
            style={[
              styles.activityTitle,
              { color: activityLevel === 'light' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            Lightly Active
          </Text>
          <Text
            style={[styles.activityDescription, { color: theme.colors.secondaryText }]}
          >
            Light exercise 1-3 days per week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.activityOption,
            {
              backgroundColor: activityLevel === 'moderate' ? theme.colors.primary + '20' : 'transparent',
              borderColor: activityLevel === 'moderate' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setActivityLevel('moderate')}
        >
          <Text
            style={[
              styles.activityTitle,
              { color: activityLevel === 'moderate' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            Moderately Active
          </Text>
          <Text
            style={[styles.activityDescription, { color: theme.colors.secondaryText }]}
          >
            Moderate exercise 3-5 days per week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.activityOption,
            {
              backgroundColor: activityLevel === 'active' ? theme.colors.primary + '20' : 'transparent',
              borderColor: activityLevel === 'active' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setActivityLevel('active')}
        >
          <Text
            style={[
              styles.activityTitle,
              { color: activityLevel === 'active' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            Very Active
          </Text>
          <Text
            style={[styles.activityDescription, { color: theme.colors.secondaryText }]}
          >
            Hard exercise 6-7 days per week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.activityOption,
            {
              backgroundColor: activityLevel === 'very active' ? theme.colors.primary + '20' : 'transparent',
              borderColor: activityLevel === 'very active' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setActivityLevel('very active')}
        >
          <Text
            style={[
              styles.activityTitle,
              { color: activityLevel === 'very active' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            Extremely Active
          </Text>
          <Text
            style={[styles.activityDescription, { color: theme.colors.secondaryText }]}
          >
            Very hard exercise, physical job or training twice a day
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Animatable.View>
  );
  
  // Fitness goal selection screen
  const FitnessGoalScreen = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        What's your fitness goal?
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.secondaryText }]}>
        This helps us adjust your calorie and macro targets
      </Text>
      
      <View style={styles.fitnessGoalsContainer}>
        <TouchableOpacity
          style={[
            styles.fitnessGoalOption,
            {
              backgroundColor: fitnessGoal === 'lose' ? theme.colors.primary + '20' : 'transparent',
              borderColor: fitnessGoal === 'lose' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setFitnessGoal('lose')}
        >
          <Icon
            name="trending-down"
            size={32}
            color={fitnessGoal === 'lose' ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.fitnessGoalTitle,
              { color: fitnessGoal === 'lose' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            Lose Weight
          </Text>
          <Text
            style={[styles.fitnessGoalDescription, { color: theme.colors.secondaryText }]}
          >
            Calorie deficit for steady weight loss
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.fitnessGoalOption,
            {
              backgroundColor: fitnessGoal === 'maintain' ? theme.colors.primary + '20' : 'transparent',
              borderColor: fitnessGoal === 'maintain' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setFitnessGoal('maintain')}
        >
          <Icon
            name="activity"
            size={32}
            color={fitnessGoal === 'maintain' ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.fitnessGoalTitle,
              { color: fitnessGoal === 'maintain' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            Maintain Weight
          </Text>
          <Text
            style={[styles.fitnessGoalDescription, { color: theme.colors.secondaryText }]}
          >
            Balance calories for current weight
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.fitnessGoalOption,
            {
              backgroundColor: fitnessGoal === 'gain' ? theme.colors.primary + '20' : 'transparent',
              borderColor: fitnessGoal === 'gain' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setFitnessGoal('gain')}
        >
          <Icon
            name="trending-up"
            size={32}
            color={fitnessGoal === 'gain' ? theme.colors.primary : theme.colors.text}
          />
          <Text
            style={[
              styles.fitnessGoalTitle,
              { color: fitnessGoal === 'gain' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            Gain Muscle
          </Text>
          <Text
            style={[styles.fitnessGoalDescription, { color: theme.colors.secondaryText }]}
          >
            Calorie surplus for muscle growth
          </Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );
  
  // Complete screen
  const CompleteScreen = () => (
    <Animatable.View animation="fadeIn" duration={800} style={styles.stepContainer}>
      <Icon name="check-circle" size={80} color={theme.colors.primary} style={styles.completeIcon} />
      <Text style={[styles.completeTitle, { color: theme.colors.text }]}>
        You're all set!
      </Text>
      <Text style={[styles.completeDescription, { color: theme.colors.secondaryText }]}>
        We've personalized your nutrition plan based on your information. Let's start tracking your food and activity!
      </Text>
    </Animatable.View>
  );
  
  // Render the appropriate screen based on the current step
  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeScreen />;
      case 1:
        return <NameScreen />;
      case 2:
        return <AgeScreen />;
      case 3:
        return <GenderScreen />;
      case 4:
        return <MeasurementsScreen />;
      case 5:
        return <ActivityLevelScreen />;
      case 6:
        return <FitnessGoalScreen />;
      case 7:
        return <CompleteScreen />;
      default:
        return <WelcomeScreen />;
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Progress indicator */}
        {step > 0 && step < 7 && (
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      index <= step
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
              />
            ))}
          </View>
        )}
        
        {/* Step content */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
        
        {/* Navigation buttons */}
        <View style={styles.buttonContainer}>
          {step > 0 && (
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={handleBack}
              disabled={loading}
            >
              <Text
                style={[styles.backButtonText, { color: theme.colors.text }]}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={step === 7 ? handleComplete : handleNext}
            disabled={loading || !isCurrentStepValid()}
          >
            <Text style={styles.nextButtonText}>
              {step === 0
                ? 'Get Started'
                : step === 6
                ? 'Continue'
                : step === 7
                ? 'Done'
                : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingVertical: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  featureIcon: {
    marginRight: 20,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 30,
  },
  input: {
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginTop: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
  },
  optionIcon: {
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityLevelContainer: {
    maxHeight: 400,
  },
  activityOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 14,
  },
  fitnessGoalsContainer: {
    marginTop: 20,
  },
  fitnessGoalOption: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  fitnessGoalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  fitnessGoalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  completeIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  completeDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    flex: 1,
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;