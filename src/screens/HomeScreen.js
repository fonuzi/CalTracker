import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { getFoodLogs } from '../services/StorageService';
import { getStepsForToday } from '../services/HealthKitService';
import CalorieProgress from '../components/CalorieProgress';
import NutritionCard from '../components/NutritionCard';
import StepCounter from '../components/StepCounter';
import { Icon } from '../assets/icons';
import { getNutrientColor, getNutrientIcon } from '../assets/icons';
import { calculateRemainingCalories } from '../utils/foodAnalysis';
import * as Animatable from 'react-native-animatable';

const HomeScreen = ({ navigation, theme }) => {
  const { userProfile } = useContext(UserContext);
  const [foodLogs, setFoodLogs] = useState([]);
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Default macro goals if user profile is not available yet
  const defaultMacroGoals = {
    protein: 100,
    carbs: 200,
    fat: 60,
  };
  
  // Default calorie goal if user profile is not available yet
  const defaultCalorieGoal = 2000;
  
  // Load data on mount and when screen is focused
  useEffect(() => {
    loadData();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Load all required data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get today's food logs
      const today = new Date().toISOString().split('T')[0];
      const logs = await getFoodLogs(today);
      setFoodLogs(logs);
      
      // Get step count
      const todaySteps = await getStepsForToday();
      setSteps(todaySteps);
    } catch (error) {
      console.error('Error loading home screen data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Pull-to-refresh functionality
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  // Calculate total calories consumed today
  const calculateCaloriesConsumed = () => {
    return foodLogs.reduce((total, food) => total + food.calories, 0);
  };
  
  // Calculate total macronutrients consumed today
  const calculateMacrosConsumed = () => {
    return foodLogs.reduce(
      (macros, food) => {
        return {
          protein: macros.protein + (food.protein || 0),
          carbs: macros.carbs + (food.carbs || 0),
          fat: macros.fat + (food.fat || 0),
        };
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
  };
  
  // Get macro goals from user profile or use defaults
  const getMacroGoals = () => {
    return userProfile?.macroGoals || defaultMacroGoals;
  };
  
  // Get calorie goal from user profile or use default
  const getCalorieGoal = () => {
    return userProfile?.calorieGoal || defaultCalorieGoal;
  };
  
  // Navigate to Camera screen to add food
  const handleAddFood = () => {
    navigation.navigate('Camera');
  };
  
  // Navigate to Activity screen
  const handleViewActivity = () => {
    navigation.navigate('Activity');
  };
  
  // Navigate to Food Log screen
  const handleViewFoodLog = () => {
    navigation.navigate('Food Log');
  };
  
  // Calculate nutrients consumed
  const caloriesConsumed = calculateCaloriesConsumed();
  const macrosConsumed = calculateMacrosConsumed();
  const macroGoals = getMacroGoals();
  const calorieGoal = getCalorieGoal();
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome section */}
      <Animatable.View
        animation="fadeIn"
        duration={600}
        style={styles.welcomeSection}
      >
        <Text style={[styles.welcomeText, { color: theme.colors.secondaryText }]}>
          {getGreeting()}
        </Text>
        <Text style={[styles.nameText, { color: theme.colors.text }]}>
          {userProfile?.name || 'Friend'}
        </Text>
      </Animatable.View>
      
      {/* Calorie progress */}
      <Animatable.View animation="fadeIn" duration={800} delay={100}>
        <CalorieProgress
          consumed={caloriesConsumed}
          goal={calorieGoal}
          theme={theme}
        />
      </Animatable.View>
      
      {/* Macronutrients */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Macronutrients
        </Text>
        <TouchableOpacity onPress={handleViewFoodLog}>
          <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>
            See all
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.macroContainer}>
        {/* Protein */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          <NutritionCard
            title="Protein"
            amount={Math.round(macrosConsumed.protein)}
            unit="g"
            icon={getNutrientIcon('protein')}
            color={getNutrientColor('protein')}
            goal={macroGoals.protein}
            theme={theme}
          />
        </Animatable.View>
        
        {/* Carbs */}
        <Animatable.View animation="fadeInUp" duration={600} delay={300}>
          <NutritionCard
            title="Carbs"
            amount={Math.round(macrosConsumed.carbs)}
            unit="g"
            icon={getNutrientIcon('carbs')}
            color={getNutrientColor('carbs')}
            goal={macroGoals.carbs}
            theme={theme}
          />
        </Animatable.View>
        
        {/* Fat */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400}>
          <NutritionCard
            title="Fat"
            amount={Math.round(macrosConsumed.fat)}
            unit="g"
            icon={getNutrientIcon('fat')}
            color={getNutrientColor('fat')}
            goal={macroGoals.fat}
            theme={theme}
          />
        </Animatable.View>
      </View>
      
      {/* Activity section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Daily Activity
        </Text>
        <TouchableOpacity onPress={handleViewActivity}>
          <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>
            Details
          </Text>
        </TouchableOpacity>
      </View>
      
      <Animatable.View animation="fadeIn" duration={800} delay={500}>
        <StepCounter steps={steps} goal={10000} theme={theme} />
      </Animatable.View>
      
      {/* Quick actions */}
      <View style={styles.quickActionsContainer}>
        <Animatable.View animation="fadeInUp" duration={600} delay={600}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleAddFood}
          >
            <Icon name="camera" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Take Food Photo</Text>
          </TouchableOpacity>
        </Animatable.View>
        
        <Animatable.View animation="fadeInUp" duration={600} delay={700}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => navigation.navigate('Add Food')}
          >
            <Icon
              name="type"
              size={20}
              color={theme.colors.primary}
              style={styles.buttonIcon}
            />
            <Text
              style={[styles.secondaryButtonText, { color: theme.colors.primary }]}
            >
              Enter Food Details
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </ScrollView>
  );
};

// Helper function to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good morning,';
  } else if (hour < 18) {
    return 'Good afternoon,';
  } else {
    return 'Good evening,';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  welcomeSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLink: {
    fontSize: 14,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionsContainer: {
    marginTop: 30,
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;