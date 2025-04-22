import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Icon } from '../assets/icons';
import { calculateBMI, getBMICategory } from '../utils/calculators';
import * as Animatable from 'react-native-animatable';

const ProfileScreen = ({ navigation, theme }) => {
  const { userProfile, updateUserProfile } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(userProfile?.age ? String(userProfile.age) : '');
  const [gender, setGender] = useState(userProfile?.gender || 'other');
  const [weight, setWeight] = useState(
    userProfile?.weight ? String(userProfile.weight) : ''
  );
  const [height, setHeight] = useState(
    userProfile?.height ? String(userProfile.height) : ''
  );
  const [activityLevel, setActivityLevel] = useState(
    userProfile?.activityLevel || 'moderate'
  );
  const [fitnessGoal, setFitnessGoal] = useState(
    userProfile?.fitnessGoal || 'maintain'
  );
  
  // Handle save profile
  const handleSaveProfile = async () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create updated profile
      const updatedProfile = {
        ...userProfile,
        name,
        age: parseInt(age) || 30,
        gender,
        weight: parseFloat(weight) || 70,
        height: parseFloat(height) || 170,
        activityLevel,
        fitnessGoal,
        updatedAt: new Date().toISOString(),
      };
      
      // Update user profile
      await updateUserProfile(updatedProfile);
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate BMI if weight and height are available
  const calculateUserBMI = () => {
    const userWeight = parseFloat(weight);
    const userHeight = parseFloat(height);
    
    if (userWeight && userHeight) {
      return calculateBMI(userWeight, userHeight);
    }
    
    return 0;
  };
  
  // Get BMI category
  const getBMICategoryInfo = () => {
    const bmi = calculateUserBMI();
    return getBMICategory(bmi);
  };
  
  // BMI info
  const bmi = calculateUserBMI();
  const bmiCategory = getBMICategoryInfo();
  
  // Loading indicator
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Profile
          </Text>
        </View>
        
        {/* Basic Information */}
        <Animatable.View animation="fadeIn" duration={600}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            BASIC INFORMATION
          </Text>
          
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Name
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
              />
            </View>
            
            {/* Age */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Age
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
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
              />
            </View>
            
            {/* Gender */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Gender
              </Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    {
                      backgroundColor:
                        gender === 'male'
                          ? theme.colors.primary
                          : theme.colors.surfaceHighlight,
                      borderColor:
                        gender === 'male'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          gender === 'male' ? '#FFFFFF' : theme.colors.text,
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
                      backgroundColor:
                        gender === 'female'
                          ? theme.colors.primary
                          : theme.colors.surfaceHighlight,
                      borderColor:
                        gender === 'female'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          gender === 'female' ? '#FFFFFF' : theme.colors.text,
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
                      backgroundColor:
                        gender === 'other'
                          ? theme.colors.primary
                          : theme.colors.surfaceHighlight,
                      borderColor:
                        gender === 'other'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setGender('other')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          gender === 'other' ? '#FFFFFF' : theme.colors.text,
                      },
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animatable.View>
        
        {/* Physical Information */}
        <Animatable.View animation="fadeIn" duration={600} delay={100}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            PHYSICAL INFORMATION
          </Text>
          
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {/* Weight */}
            <View style={styles.inputContainer}>
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
                placeholder="Enter your weight"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
            
            {/* Height */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
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
                placeholder="Enter your height"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="decimal-pad"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            
            {/* BMI */}
            {bmi > 0 && (
              <View style={styles.bmiContainer}>
                <View style={styles.bmiLabelContainer}>
                  <Text style={[styles.bmiLabel, { color: theme.colors.text }]}>
                    BMI
                  </Text>
                  <Text
                    style={[
                      styles.bmiValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {bmi}
                  </Text>
                </View>
                <View
                  style={[
                    styles.bmiCategoryContainer,
                    { backgroundColor: bmiCategory.color + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.bmiCategoryText,
                      { color: bmiCategory.color },
                    ]}
                  >
                    {bmiCategory.category}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animatable.View>
        
        {/* Fitness Goals */}
        <Animatable.View animation="fadeIn" duration={600} delay={200}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
            FITNESS GOALS
          </Text>
          
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {/* Activity Level */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Activity Level
              </Text>
              <View style={styles.activityOptionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.activityOption,
                    {
                      backgroundColor:
                        activityLevel === 'sedentary'
                          ? theme.colors.primary + '20'
                          : 'transparent',
                      borderColor:
                        activityLevel === 'sedentary'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setActivityLevel('sedentary')}
                >
                  <Icon
                    name="coffee"
                    size={18}
                    color={
                      activityLevel === 'sedentary'
                        ? theme.colors.primary
                        : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.activityOptionTitle,
                      {
                        color:
                          activityLevel === 'sedentary'
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    Sedentary
                  </Text>
                  <Text
                    style={[
                      styles.activityOptionDesc,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Little to no exercise
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.activityOption,
                    {
                      backgroundColor:
                        activityLevel === 'light'
                          ? theme.colors.primary + '20'
                          : 'transparent',
                      borderColor:
                        activityLevel === 'light'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setActivityLevel('light')}
                >
                  <Icon
                    name="sunset"
                    size={18}
                    color={
                      activityLevel === 'light'
                        ? theme.colors.primary
                        : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.activityOptionTitle,
                      {
                        color:
                          activityLevel === 'light'
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    Light
                  </Text>
                  <Text
                    style={[
                      styles.activityOptionDesc,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Exercise 1-3 times/week
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.activityOption,
                    {
                      backgroundColor:
                        activityLevel === 'moderate'
                          ? theme.colors.primary + '20'
                          : 'transparent',
                      borderColor:
                        activityLevel === 'moderate'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setActivityLevel('moderate')}
                >
                  <Icon
                    name="trending-up"
                    size={18}
                    color={
                      activityLevel === 'moderate'
                        ? theme.colors.primary
                        : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.activityOptionTitle,
                      {
                        color:
                          activityLevel === 'moderate'
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    Moderate
                  </Text>
                  <Text
                    style={[
                      styles.activityOptionDesc,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Exercise 3-5 times/week
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.activityOption,
                    {
                      backgroundColor:
                        activityLevel === 'active'
                          ? theme.colors.primary + '20'
                          : 'transparent',
                      borderColor:
                        activityLevel === 'active'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setActivityLevel('active')}
                >
                  <Icon
                    name="activity"
                    size={18}
                    color={
                      activityLevel === 'active'
                        ? theme.colors.primary
                        : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.activityOptionTitle,
                      {
                        color:
                          activityLevel === 'active'
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    Active
                  </Text>
                  <Text
                    style={[
                      styles.activityOptionDesc,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    Exercise 5-7 times/week
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Fitness Goal */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Goal
              </Text>
              <View style={styles.goalsContainer}>
                <TouchableOpacity
                  style={[
                    styles.goalOption,
                    {
                      backgroundColor:
                        fitnessGoal === 'lose'
                          ? theme.colors.primary + '20'
                          : 'transparent',
                      borderColor:
                        fitnessGoal === 'lose'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setFitnessGoal('lose')}
                >
                  <Icon
                    name="trending-down"
                    size={24}
                    color={
                      fitnessGoal === 'lose'
                        ? theme.colors.primary
                        : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.goalTitle,
                      {
                        color:
                          fitnessGoal === 'lose'
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    Lose Weight
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.goalOption,
                    {
                      backgroundColor:
                        fitnessGoal === 'maintain'
                          ? theme.colors.primary + '20'
                          : 'transparent',
                      borderColor:
                        fitnessGoal === 'maintain'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setFitnessGoal('maintain')}
                >
                  <Icon
                    name="activity"
                    size={24}
                    color={
                      fitnessGoal === 'maintain'
                        ? theme.colors.primary
                        : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.goalTitle,
                      {
                        color:
                          fitnessGoal === 'maintain'
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    Maintain
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.goalOption,
                    {
                      backgroundColor:
                        fitnessGoal === 'gain'
                          ? theme.colors.primary + '20'
                          : 'transparent',
                      borderColor:
                        fitnessGoal === 'gain'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => setFitnessGoal('gain')}
                >
                  <Icon
                    name="trending-up"
                    size={24}
                    color={
                      fitnessGoal === 'gain'
                        ? theme.colors.primary
                        : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.goalTitle,
                      {
                        color:
                          fitnessGoal === 'gain'
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    Gain Muscle
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animatable.View>
        
        {/* Save Button */}
        <Animatable.View animation="fadeIn" duration={600} delay={300}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSaveProfile}
          >
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bmiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  bmiLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  bmiValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bmiCategoryContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bmiCategoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityOptionsContainer: {
    marginTop: 8,
  },
  activityOption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  activityOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  activityOptionDesc: {
    fontSize: 14,
    marginTop: 4,
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  goalOption: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;