import React, { useContext, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, Card, Title, TextInput, Button, useTheme, Divider } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext';
import { calculateBMI, calculateBMR } from '../utils/calculators';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { userProfile, updateUserProfile } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    age: userProfile?.age || '',
    gender: userProfile?.gender || '',
    weight: userProfile?.weight || '',
    height: userProfile?.height || '',
    activityLevel: userProfile?.activityLevel || '',
    fitnessGoal: userProfile?.fitnessGoal || '',
    dietaryRestrictions: userProfile?.dietaryRestrictions || [],
  });

  const bmi = userProfile ? calculateBMI(
    parseFloat(userProfile.weight), 
    parseFloat(userProfile.height)
  ) : null;
  
  const bmr = userProfile ? calculateBMR(
    parseFloat(userProfile.weight),
    parseFloat(userProfile.height),
    parseInt(userProfile.age, 10),
    userProfile.gender
  ) : null;

  const activityLevels = {
    'sedentary': 'Mostly inactive',
    'light': 'Light exercise 1-3 days/week',
    'moderate': 'Moderate exercise 3-5 days/week',
    'active': 'Active exercise 6-7 days/week',
    'very_active': 'Very active & physical job'
  };

  const fitnessGoals = {
    'lose_weight': 'Lose Weight',
    'maintain': 'Maintain Weight',
    'gain_muscle': 'Gain Muscle',
    'improve_fitness': 'Improve Fitness'
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }

    try {
      // Update user profile with new data
      updateUserProfile(formData);
      setIsEditing(false);
      
      Alert.alert('Success', 'Your profile has been updated!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    }
  };

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#64B5F6' };
    if (bmi < 25) return { category: 'Healthy Weight', color: '#66BB6A' };
    if (bmi < 30) return { category: 'Overweight', color: '#FFB74D' };
    return { category: 'Obesity', color: '#E57373' };
  };

  const renderProfileDetails = () => {
    const bmiInfo = bmi ? getBmiCategory(bmi) : null;

    return (
      <View style={styles.profileDetails}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text }}>Personal Information</Title>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {userProfile?.name || 'Not set'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Age</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {userProfile?.age ? `${userProfile.age} years` : 'Not set'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {userProfile?.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : 'Not set'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {userProfile?.weight ? `${userProfile.weight} kg` : 'Not set'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {userProfile?.height ? `${userProfile.height} cm` : 'Not set'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text }}>Fitness Profile</Title>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Activity Level</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {userProfile?.activityLevel ? activityLevels[userProfile.activityLevel] : 'Not set'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fitness Goal</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {userProfile?.fitnessGoal ? fitnessGoals[userProfile.fitnessGoal] : 'Not set'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Daily Calorie Goal</Text>
              <Text style={[styles.detailValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                {userProfile?.calorieGoal ? `${userProfile.calorieGoal} calories` : 'Not set'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {bmi && bmr && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.text }}>Health Metrics</Title>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{bmi.toFixed(1)}</Text>
                  <Text style={styles.metricLabel}>BMI</Text>
                  <Text style={[styles.metricStatus, { color: bmiInfo.color }]}>
                    {bmiInfo.category}
                  </Text>
                </View>
                
                <Divider style={styles.verticalDivider} />
                
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{Math.round(bmr)}</Text>
                  <Text style={styles.metricLabel}>BMR</Text>
                  <Text style={styles.metricSubtext}>calories/day</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {userProfile?.dietaryRestrictions?.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.text }}>Dietary Restrictions</Title>
              <View style={styles.restrictionsContainer}>
                {userProfile.dietaryRestrictions.map((restriction, index) => (
                  <View key={index} style={styles.restrictionItem}>
                    <Feather name="check-circle" size={16} color={theme.colors.primary} style={styles.restrictionIcon} />
                    <Text style={styles.restrictionText}>{restriction}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {userProfile?.aiRecommendations && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.text }}>AI Recommendations</Title>
              <Text style={styles.recommendationText}>
                {userProfile.aiRecommendations}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Button 
          mode="contained" 
          onPress={() => setIsEditing(true)}
          style={styles.editButton}
          icon="pencil"
        >
          Edit Profile
        </Button>
      </View>
    );
  };

  const renderEditForm = () => {
    return (
      <View style={styles.editForm}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text, marginBottom: 15 }}>Edit Profile</Title>
            
            <TextInput
              label="Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Age"
              value={formData.age}
              onChangeText={(text) => handleInputChange('age', text)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Gender (male/female)"
              value={formData.gender}
              onChangeText={(text) => handleInputChange('gender', text.toLowerCase())}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Weight (kg)"
              value={formData.weight}
              onChangeText={(text) => handleInputChange('weight', text)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Height (cm)"
              value={formData.height}
              onChangeText={(text) => handleInputChange('height', text)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            
            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={() => setIsEditing(false)}
                style={[styles.button, styles.cancelButton]}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={[styles.button, styles.saveButton]}
              >
                Save
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Icon 
          size={100} 
          icon="account" 
          style={{ backgroundColor: theme.colors.primary }} 
        />
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {userProfile?.name || 'User Profile'}
        </Text>
        <Text style={styles.subtitle}>
          {userProfile?.fitnessGoal 
            ? `Goal: ${fitnessGoals[userProfile.fitnessGoal]}` 
            : 'Set your fitness goals'}
        </Text>
      </View>
      
      {isEditing ? renderEditForm() : renderProfileDetails()}
      
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    color: '#fff',
    marginTop: 5,
  },
  profileDetails: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
    marginBottom: 2,
  },
  metricStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  verticalDivider: {
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  restrictionsContainer: {
    marginTop: 10,
  },
  restrictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  restrictionIcon: {
    marginRight: 10,
  },
  restrictionText: {
    fontSize: 16,
    color: '#fff',
  },
  recommendationText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginTop: 10,
  },
  editButton: {
    marginTop: 10,
  },
  editForm: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    borderColor: '#aaa',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  bottomPadding: {
    height: 80,
  },
});

export default ProfileScreen;
