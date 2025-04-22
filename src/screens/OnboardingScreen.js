import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

const OnboardingScreen = ({ theme }) => {
  const { updateUserProfile } = useContext(UserContext);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');
  
  // Handle completion of onboarding
  const handleComplete = async () => {
    // Create a simple user profile
    const userProfile = {
      name: name || 'User',
      age: parseInt(age) || 30,
      gender: gender || 'other',
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 170,
      fitnessGoal: goal || 'maintain',
      calorieGoal: 2000, // Default calorie goal
      macroGoals: {
        protein: 100,
        carbs: 200,
        fat: 60
      },
      theme: 'dark',
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };
    
    // Save the user profile
    await updateUserProfile(userProfile);
  };
  
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Welcome to NutriTrack AI
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
        Your personal AI-powered nutrition coach
      </Text>
      
      <Animatable.View 
        animation="fadeIn" 
        delay={300} 
        style={styles.inputContainer}
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>
          What's your name?
        </Text>
        <TextInput
          style={[
            styles.input,
            { 
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border 
            }
          ]}
          placeholder="Enter your name"
          placeholderTextColor={theme.colors.placeholder}
          value={name}
          onChangeText={setName}
        />
      </Animatable.View>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => setStep(2)}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Basic Information
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
        Let's get to know you better
      </Text>
      
      <Animatable.View animation="fadeIn" style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Age
        </Text>
        <TextInput
          style={[
            styles.input,
            { 
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border 
            }
          ]}
          placeholder="Enter your age"
          placeholderTextColor={theme.colors.placeholder}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </Animatable.View>
      
      <Animatable.View animation="fadeIn" delay={100} style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Gender
        </Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              {
                backgroundColor: gender === 'male' ? theme.colors.primary : theme.colors.surface,
                borderColor: gender === 'male' ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setGender('male')}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: gender === 'male' ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.option,
              {
                backgroundColor: gender === 'female' ? theme.colors.primary : theme.colors.surface,
                borderColor: gender === 'female' ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setGender('female')}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: gender === 'female' ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.option,
              {
                backgroundColor: gender === 'other' ? theme.colors.primary : theme.colors.surface,
                borderColor: gender === 'other' ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setGender('other')}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: gender === 'other' ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              Other
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { borderColor: theme.colors.border },
          ]}
          onPress={() => setStep(1)}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
            Back
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary, flex: 1, marginLeft: 10 },
          ]}
          onPress={() => setStep(3)}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Physical Information
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
        This helps us calculate your calorie needs
      </Text>
      
      <Animatable.View animation="fadeIn" style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Weight (kg)
        </Text>
        <TextInput
          style={[
            styles.input,
            { 
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border 
            }
          ]}
          placeholder="Enter your weight"
          placeholderTextColor={theme.colors.placeholder}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
      </Animatable.View>
      
      <Animatable.View animation="fadeIn" delay={100} style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Height (cm)
        </Text>
        <TextInput
          style={[
            styles.input,
            { 
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border 
            }
          ]}
          placeholder="Enter your height"
          placeholderTextColor={theme.colors.placeholder}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
      </Animatable.View>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { borderColor: theme.colors.border },
          ]}
          onPress={() => setStep(2)}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
            Back
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary, flex: 1, marginLeft: 10 },
          ]}
          onPress={() => setStep(4)}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Your Goals
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
        What do you want to achieve?
      </Text>
      
      <Animatable.View animation="fadeIn" style={styles.goalsContainer}>
        <TouchableOpacity
          style={[
            styles.goalOption,
            {
              backgroundColor: goal === 'lose' ? theme.colors.primary + '20' : 'transparent',
              borderColor: goal === 'lose' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setGoal('lose')}
        >
          <Icon 
            name="trending-down" 
            size={24} 
            color={goal === 'lose' ? theme.colors.primary : theme.colors.text} 
          />
          <Text 
            style={[
              styles.goalTitle, 
              { color: goal === 'lose' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Lose Weight
          </Text>
          <Text 
            style={[
              styles.goalDescription, 
              { color: theme.colors.secondaryText }
            ]}
          >
            Create a calorie deficit to lose weight gradually
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.goalOption,
            {
              backgroundColor: goal === 'maintain' ? theme.colors.primary + '20' : 'transparent',
              borderColor: goal === 'maintain' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setGoal('maintain')}
        >
          <Icon 
            name="activity" 
            size={24} 
            color={goal === 'maintain' ? theme.colors.primary : theme.colors.text} 
          />
          <Text 
            style={[
              styles.goalTitle, 
              { color: goal === 'maintain' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Maintain Weight
          </Text>
          <Text 
            style={[
              styles.goalDescription, 
              { color: theme.colors.secondaryText }
            ]}
          >
            Stay at your current weight and improve nutrition
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.goalOption,
            {
              backgroundColor: goal === 'gain' ? theme.colors.primary + '20' : 'transparent',
              borderColor: goal === 'gain' ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setGoal('gain')}
        >
          <Icon 
            name="trending-up" 
            size={24} 
            color={goal === 'gain' ? theme.colors.primary : theme.colors.text} 
          />
          <Text 
            style={[
              styles.goalTitle, 
              { color: goal === 'gain' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Gain Muscle
          </Text>
          <Text 
            style={[
              styles.goalDescription, 
              { color: theme.colors.secondaryText }
            ]}
          >
            Increase calories and protein for muscle growth
          </Text>
        </TouchableOpacity>
      </Animatable.View>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { borderColor: theme.colors.border },
          ]}
          onPress={() => setStep(3)}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
            Back
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary, flex: 1, marginLeft: 10 },
          ]}
          onPress={handleComplete}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                {
                  backgroundColor: s <= step ? theme.colors.primary : theme.colors.border,
                  width: s === step ? 12 : 8,
                  height: s === step ? 12 : 8,
                },
              ]}
            />
          ))}
        </View>
        
        {renderCurrentStep()}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    borderRadius: 6,
    marginHorizontal: 6,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalsContainer: {
    marginBottom: 20,
  },
  goalOption: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;