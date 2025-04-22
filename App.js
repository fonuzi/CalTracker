import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image, 
  Button,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserProvider, UserContext } from './src/context/UserContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { darkTheme } from './src/theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main app component wrapped with providers
export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

// App content with navigation
function AppContent() {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing user profile with periodic polling
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem('user_profile');
        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial check
    checkUserProfile();
    
    // Set up a polling mechanism to check for user profile changes
    // This helps ensure that if the profile is created in onboarding, 
    // we detect it and update the UI accordingly
    const profilePollInterval = setInterval(() => {
      checkUserProfile();
    }, 2000); // Check every 2 seconds
    
    // Clear the interval when the component unmounts
    return () => clearInterval(profilePollInterval);
  }, []);
  
  // Function to reset user profile (for testing)
  const resetUserProfile = async () => {
    try {
      await AsyncStorage.removeItem('user_profile');
      setUserProfile(null);
      Alert.alert('Profile Reset', 'User profile has been reset. You can now access the onboarding screen.');
    } catch (error) {
      console.error('Error resetting profile:', error);
      Alert.alert('Error', 'Failed to reset user profile.');
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // For testing, show a button to reset user profile if already exists
  if (userProfile) {
    return (
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar style="light" />
          <HomeScreen />
          <View style={styles.resetButtonContainer}>
            <Button 
              title="Reset Profile to Test Onboarding" 
              onPress={resetUserProfile} 
              color="#8E7CFF"
            />
          </View>
        </View>
      </NavigationContainer>
    );
  }
  
  // Show onboarding if no user profile
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Onboarding" 
          options={{ headerShown: false }}
        >
          {props => <OnboardingScreen {...props} theme={darkTheme} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Home screen component (the original App content)
function HomeScreen() {
  const { userProfile } = useContext(UserContext);
  const [dailyCalories, setDailyCalories] = useState(1200);
  const [steps, setSteps] = useState(5300);
  
  // Get goals from user profile if available
  const calorieGoal = userProfile?.calorieGoal || 2000;
  const proteinGoal = userProfile?.macroGoals?.protein || 80;
  const carbsGoal = userProfile?.macroGoals?.carbs || 200;
  const fatGoal = userProfile?.macroGoals?.fat || 60;
  
  // Current consumption (normally would be tracked through the day)
  const protein = Math.round(proteinGoal * 0.45);  // Simulating 45% of goal consumed
  const carbs = Math.round(carbsGoal * 0.6);       // Simulating 60% of goal consumed  
  const fat = Math.round(fatGoal * 0.5);           // Simulating 50% of goal consumed
  
  // Calculate percentages
  const caloriePercentage = Math.min(100, Math.round((dailyCalories / calorieGoal) * 100));
  const proteinPercentage = Math.min(100, Math.round((protein / proteinGoal) * 100));
  const carbsPercentage = Math.min(100, Math.round((carbs / carbsGoal) * 100));
  const fatPercentage = Math.min(100, Math.round((fat / fatGoal) * 100));
  const stepsPercentage = Math.min(100, Math.round((steps / 10000) * 100));
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header with profile button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{userProfile?.name || 'Friend'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Feather name="user" size={24} color="#8E7CFF" />
          </TouchableOpacity>
        </View>
        
        {/* Calorie Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.calorieCard}>
            <View style={styles.calorieHeader}>
              <Text style={styles.calorieTitle}>Calories</Text>
              <Text style={styles.calorieValue}>{dailyCalories} / {calorieGoal}</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${caloriePercentage}%`, backgroundColor: '#8E7CFF' }
                ]} 
              />
            </View>
            <Text style={styles.calorieRemaining}>
              {calorieGoal - dailyCalories} calories remaining
            </Text>
          </View>
        </View>
        
        {/* Macronutrients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macroContainer}>
            {/* Protein */}
            <View style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <Feather name="box" size={16} color="#FF6B6B" />
                <Text style={styles.macroTitle}>Protein</Text>
              </View>
              <Text style={styles.macroValue}>{protein}g</Text>
              <View style={styles.macroProgressBar}>
                <View 
                  style={[
                    styles.macroProgressFill, 
                    { width: `${proteinPercentage}%`, backgroundColor: '#FF6B6B' }
                  ]} 
                />
              </View>
            </View>
            
            {/* Carbs */}
            <View style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <Feather name="circle" size={16} color="#4ECDC4" />
                <Text style={styles.macroTitle}>Carbs</Text>
              </View>
              <Text style={styles.macroValue}>{carbs}g</Text>
              <View style={styles.macroProgressBar}>
                <View 
                  style={[
                    styles.macroProgressFill, 
                    { width: `${carbsPercentage}%`, backgroundColor: '#4ECDC4' }
                  ]} 
                />
              </View>
            </View>
            
            {/* Fat */}
            <View style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <Feather name="droplet" size={16} color="#FFD166" />
                <Text style={styles.macroTitle}>Fat</Text>
              </View>
              <Text style={styles.macroValue}>{fat}g</Text>
              <View style={styles.macroProgressBar}>
                <View 
                  style={[
                    styles.macroProgressFill, 
                    { width: `${fatPercentage}%`, backgroundColor: '#FFD166' }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
        
        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Activity</Text>
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Feather name="activity" size={20} color="#8E7CFF" />
              <Text style={styles.stepTitle}>Steps</Text>
              <Text style={styles.stepValue}>{steps} / 10,000</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${stepsPercentage}%`, backgroundColor: '#8E7CFF' }
                ]} 
              />
            </View>
          </View>
        </View>
        
        {/* Quick Add Button */}
        <TouchableOpacity style={styles.quickAddButton}>
          <Feather name="camera" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Take Photo of Food</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.manualAddButton}>
          <Feather name="plus" size={20} color="#8E7CFF" style={styles.buttonIcon} />
          <Text style={styles.manualButtonText}>Add Food Manually</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#8E7CFF" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Feather name="book" size={24} color="#888888" />
          <Text style={styles.navText}>Food Log</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.cameraButton]}>
          <Feather name="camera" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Feather name="activity" size={24} color="#888888" />
          <Text style={styles.navText}>Activity</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Feather name="settings" size={24} color="#888888" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  resetButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 16,
    color: '#BBBBBB',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(142, 124, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  calorieCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calorieTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calorieValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  calorieRemaining: {
    fontSize: 14,
    color: '#BBBBBB',
    textAlign: 'right',
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    width: '31%',
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  macroValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  macroProgressBar: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  macroProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  stepCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  stepValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  quickAddButton: {
    backgroundColor: '#8E7CFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  manualAddButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8E7CFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8E7CFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  cameraButton: {
    backgroundColor: '#8E7CFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    bottom: 15,
  },
  navText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  activeNavText: {
    color: '#8E7CFF',
  },
});