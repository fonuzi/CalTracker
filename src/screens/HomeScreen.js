import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { getFoodLogs } from '../services/StorageService';
import { getStepsForToday, subscribeToStepUpdates } from '../services/HealthKitService';
import { analyzeFitnessGoals } from '../services/OpenAIService';
import CalorieProgress from '../components/CalorieProgress';
import NutritionCard from '../components/NutritionCard';
import StepCounter from '../components/StepCounter';
import FoodItem from '../components/FoodItem';
import { Icon } from '../assets/icons';
import { getNutrientIcon, getNutrientColor } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

const HomeScreen = ({ navigation, theme }) => {
  const { userProfile, calculateDailyProgress } = useContext(UserContext);
  
  // State
  const [foodLogs, setFoodLogs] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({
    calories: { consumed: 0, goal: 0, percentage: 0 },
    macros: {
      protein: { consumed: 0, goal: 0, percentage: 0 },
      carbs: { consumed: 0, goal: 0, percentage: 0 },
      fat: { consumed: 0, goal: 0, percentage: 0 },
    },
  });
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  
  // Load data on mount and focus
  useEffect(() => {
    loadData();
    
    // Subscribe to steps updates
    const subscription = subscribeToStepUpdates((newSteps) => {
      setSteps(newSteps);
    });
    
    // When navigating back to this screen, refresh the data
    const unsubscribe = navigation.addListener('focus', loadData);
    
    return () => {
      // Clean up subscriptions
      subscription?.remove?.();
      unsubscribe();
    };
  }, [navigation, userProfile]);
  
  // Load data function
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      
      // Get food logs for today
      const logs = await getFoodLogs(today);
      setFoodLogs(logs);
      
      // Calculate daily progress based on food logs
      const progress = calculateDailyProgress(logs);
      setDailyProgress(progress);
      
      // Get step count for today
      const todaySteps = await getStepsForToday();
      setSteps(todaySteps);
      
      // Get fitness recommendations if user profile exists
      if (userProfile) {
        try {
          // Only make this call occasionally to avoid overusing the API
          const shouldFetchRecommendations = !recommendations || Math.random() < 0.2;
          
          if (shouldFetchRecommendations) {
            // Prepare user data for analysis
            const userData = {
              ...userProfile,
              todayNutrition: {
                calories: progress.calories.consumed,
                protein: progress.macros.protein.consumed,
                carbs: progress.macros.carbs.consumed,
                fat: progress.macros.fat.consumed,
              },
              steps: todaySteps,
              date: today,
            };
            
            // Get recommendations
            const fitnessRecommendations = await analyzeFitnessGoals(userData);
            setRecommendations(fitnessRecommendations);
          }
        } catch (error) {
          console.error('Error getting fitness recommendations:', error);
          // Non-critical error, so we can continue
        }
      }
    } catch (error) {
      console.error('Error loading home screen data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  // Handle adding food
  const handleAddFood = () => {
    navigation.navigate('Camera');
  };
  
  // Handle viewing food log
  const handleViewFoodLog = () => {
    navigation.navigate('Food Log');
  };
  
  // Handle viewing steps
  const handleViewSteps = () => {
    navigation.navigate('Step Tracking');
  };
  
  // Loading screen
  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  // Check if user is onboarded
  if (!userProfile) {
    return (
      <View style={[styles.notOnboardedContainer, { backgroundColor: theme.colors.background }]}>
        <Icon name="user-x" size={50} color={theme.colors.text} style={styles.notOnboardedIcon} />
        <Text style={[styles.notOnboardedTitle, { color: theme.colors.text }]}>
          Welcome to NutriTrack AI
        </Text>
        <Text style={[styles.notOnboardedText, { color: theme.colors.secondaryText }]}>
          Please complete the onboarding process to set up your profile and goals.
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
        />
      }
      contentContainerStyle={styles.contentContainer}
    >
      {/* Welcome message */}
      <View style={styles.welcomeContainer}>
        <View>
          <Text style={[styles.welcomeText, { color: theme.colors.secondaryText }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {userProfile?.name || 'User'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddFood}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Calorie Progress */}
      <Animatable.View animation="fadeInUp" duration={600} delay={100}>
        <CalorieProgress
          consumed={dailyProgress.calories.consumed}
          goal={dailyProgress.calories.goal}
          theme={theme}
        />
      </Animatable.View>
      
      {/* Nutrition Cards */}
      <Animatable.View animation="fadeInUp" duration={600} delay={200}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Nutrition
          </Text>
          <TouchableOpacity onPress={handleViewFoodLog}>
            <Text style={[styles.sectionAction, { color: theme.colors.primary }]}>
              View Log
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.nutritionCards}>
          <NutritionCard
            title="Protein"
            amount={dailyProgress.macros.protein.consumed}
            goal={dailyProgress.macros.protein.goal}
            icon={getNutrientIcon('protein')}
            color={getNutrientColor('protein')}
            theme={theme}
          />
          <NutritionCard
            title="Carbs"
            amount={dailyProgress.macros.carbs.consumed}
            goal={dailyProgress.macros.carbs.goal}
            icon={getNutrientIcon('carbs')}
            color={getNutrientColor('carbs')}
            theme={theme}
          />
          <NutritionCard
            title="Fat"
            amount={dailyProgress.macros.fat.consumed}
            goal={dailyProgress.macros.fat.goal}
            icon={getNutrientIcon('fat')}
            color={getNutrientColor('fat')}
            theme={theme}
          />
        </View>
      </Animatable.View>
      
      {/* Step Counter */}
      <Animatable.View animation="fadeInUp" duration={600} delay={300}>
        <StepCounter
          steps={steps}
          goal={10000}
          theme={theme}
          userWeight={userProfile?.weight}
          onPress={handleViewSteps}
        />
      </Animatable.View>
      
      {/* Recent Meals */}
      <Animatable.View animation="fadeInUp" duration={600} delay={400}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Meals
          </Text>
          <TouchableOpacity onPress={handleViewFoodLog}>
            <Text style={[styles.sectionAction, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        
        {foodLogs.length > 0 ? (
          <View>
            {foodLogs.slice(0, 3).map((food) => (
              <FoodItem
                key={food.id}
                food={food}
                onPress={() => navigation.navigate('Edit Food', { food })}
                onDelete={() => {}}
                theme={theme}
              />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyMealsContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Icon name="coffee" size={24} color={theme.colors.secondaryText} style={styles.emptyMealsIcon} />
            <Text
              style={[
                styles.emptyMealsText,
                { color: theme.colors.secondaryText },
              ]}
            >
              No meals logged today
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyMealsButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleAddFood}
            >
              <Text style={styles.emptyMealsButtonText}>Add Food</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animatable.View>
      
      {/* AI Recommendations */}
      {recommendations && (
        <Animatable.View animation="fadeInUp" duration={600} delay={500}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              AI Recommendations
            </Text>
          </View>
          
          <View
            style={[
              styles.recommendationsContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text
              style={[
                styles.recommendationTitle,
                { color: theme.colors.text },
              ]}
            >
              Today's Focus
            </Text>
            
            {recommendations.nutritionTips?.length > 0 && (
              <View style={styles.recommendationItem}>
                <Icon name="award" size={18} color={theme.colors.primary} style={styles.recommendationIcon} />
                <Text
                  style={[
                    styles.recommendationText,
                    { color: theme.colors.secondaryText },
                  ]}
                >
                  {recommendations.nutritionTips[0]}
                </Text>
              </View>
            )}
            
            {recommendations.exerciseRecommendations?.length > 0 && (
              <View style={styles.recommendationItem}>
                <Icon name="activity" size={18} color={theme.colors.primary} style={styles.recommendationIcon} />
                <Text
                  style={[
                    styles.recommendationText,
                    { color: theme.colors.secondaryText },
                  ]}
                >
                  {recommendations.exerciseRecommendations[0]}
                </Text>
              </View>
            )}
            
            <Text
              style={[
                styles.motivationalMessage,
                { color: theme.colors.text },
              ]}
            >
              {recommendations.motivationalMessage}
            </Text>
          </View>
        </Animatable.View>
      )}
      
      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionAction: {
    fontSize: 14,
  },
  nutritionCards: {
    paddingHorizontal: 16,
  },
  emptyMealsContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  emptyMealsIcon: {
    marginBottom: 10,
  },
  emptyMealsText: {
    fontSize: 16,
    marginBottom: 15,
  },
  emptyMealsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  emptyMealsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recommendationsContainer: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  motivationalMessage: {
    fontSize: 15,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  notOnboardedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notOnboardedIcon: {
    marginBottom: 20,
  },
  notOnboardedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  notOnboardedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  bottomSpacing: {
    height: 60,
  },
});

export default HomeScreen;