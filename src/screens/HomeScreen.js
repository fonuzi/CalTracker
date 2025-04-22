import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { UserContext } from '../context/UserContext';
import { getFoodLogs } from '../services/StorageService';
import { getStepsForToday } from '../services/HealthKitService';
import CalorieProgress from '../components/CalorieProgress';
import NutritionCard from '../components/NutritionCard';
import StepCounter from '../components/StepCounter';
import { Icon } from '../assets/icons';
import { getNutrientIcon, getNutrientColor } from '../assets/icons';

const HomeScreen = ({ navigation, theme }) => {
  const { userProfile, calculateDailyProgress, calculateMacroTotals } = useContext(UserContext);
  const [foodLogs, setFoodLogs] = useState([]);
  const [nutritionData, setNutritionData] = useState({
    caloriesConsumed: 0,
    caloriesRemaining: 0,
    percentage: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadDailyData();
    
    // Set up interval to refresh data every minute
    const interval = setInterval(loadDailyData, 60000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);
  
  // Function to load daily food and step data
  const loadDailyData = async () => {
    try {
      setLoading(true);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Load food logs for today
      const logs = await getFoodLogs(today);
      setFoodLogs(logs);
      
      // Calculate daily nutrition progress
      const progress = calculateDailyProgress(logs);
      
      // Calculate macro totals
      const macros = calculateMacroTotals(logs);
      
      // Update nutrition data
      setNutritionData({
        ...progress,
        ...macros
      });
      
      // Get step count for today
      const todaySteps = await getStepsForToday();
      setSteps(todaySteps);
    } catch (error) {
      console.error('Error loading daily data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle add food button press
  const handleAddFood = () => {
    navigation.navigate('Add Food');
  };
  
  // Default calorie goal if user profile doesn't have one
  const calorieGoal = userProfile?.calorieGoal || 2000;
  
  // Default macro goals if user profile doesn't have them
  const macroGoals = {
    protein: userProfile?.macroGoals?.protein || 100,
    carbs: userProfile?.macroGoals?.carbs || 200,
    fat: userProfile?.macroGoals?.fat || 60
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header with greeting */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Hello, {userProfile?.name || 'there'}!
          </Text>
          <Text style={[styles.date, { color: theme.colors.secondaryText }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddFood}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Calorie progress */}
      <CalorieProgress 
        consumed={nutritionData.caloriesConsumed} 
        goal={calorieGoal} 
        theme={theme} 
      />
      
      {/* Macronutrient cards */}
      <View style={styles.macroSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Macronutrients
        </Text>
        
        <NutritionCard
          title="Protein"
          amount={nutritionData.protein}
          goal={macroGoals.protein}
          icon={getNutrientIcon('protein')}
          color={getNutrientColor('protein')}
          theme={theme}
        />
        
        <NutritionCard
          title="Carbs"
          amount={nutritionData.carbs}
          goal={macroGoals.carbs}
          icon={getNutrientIcon('carbs')}
          color={getNutrientColor('carbs')}
          theme={theme}
        />
        
        <NutritionCard
          title="Fat"
          amount={nutritionData.fat}
          goal={macroGoals.fat}
          icon={getNutrientIcon('fat')}
          color={getNutrientColor('fat')}
          theme={theme}
        />
      </View>
      
      {/* Step counter */}
      <StepCounter 
        steps={steps} 
        goal={10000} 
        theme={theme} 
      />
      
      {/* Recent meals section - could be expanded in future */}
      <View style={styles.recentMealsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Meals
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Food Log')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        
        {foodLogs.length > 0 ? (
          <Text style={{ color: theme.colors.secondaryText }}>
            You've logged {foodLogs.length} meal{foodLogs.length !== 1 ? 's' : ''} today.
          </Text>
        ) : (
          <Text style={{ color: theme.colors.secondaryText }}>
            No meals logged today. Tap the + button to add a meal.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
  },
  date: {
    fontSize: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  macroSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  recentMealsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;