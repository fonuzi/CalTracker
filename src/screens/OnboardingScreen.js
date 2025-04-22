import React, { useContext } from 'react';
import { View, StyleSheet, StatusBar, ImageBackground, Image, Text } from 'react-native';
import { UserContext } from '../context/UserContext';
import { saveUserProfile, saveOnboardingStatus } from '../services/StorageService';
import OnboardingQuestions from '../components/OnboardingQuestions';

const OnboardingScreen = ({ navigation, theme }) => {
  const { updateUserProfile } = useContext(UserContext);
  
  // Handle onboarding completion
  const handleOnboardingComplete = async (userData) => {
    try {
      // Save user profile to storage
      await saveUserProfile(userData);
      
      // Mark onboarding as complete
      await saveOnboardingStatus(true);
      
      // Update user profile in context
      updateUserProfile(userData);
      
      // Navigate to home screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      
      <View style={styles.logoContainer}>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>NutriTrack AI</Text>
        <Text style={[styles.slogan, { color: theme.colors.secondaryText }]}>
          AI-powered nutrition tracking
        </Text>
      </View>
      
      <OnboardingQuestions onComplete={handleOnboardingComplete} theme={theme} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  slogan: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default OnboardingScreen;