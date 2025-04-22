import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Import components
import CalorieProgress from '../components/CalorieProgress';
import NutritionCard from '../components/NutritionCard';
import StepCounter from '../components/StepCounter';

// Import context and services
import { UserContext } from '../context/UserContext';
import { getFoodLogs } from '../services/StorageService';
import { getStepsForToday } from '../services/HealthKitService';
import { getNutrientIcon } from '../assets/icons';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { userProfile, calculateDailyProgress } = useContext(UserContext);
  
  // State for screen data
  const [refreshing, setRefreshing] = useState(false);
  const [todaysFoodLogs, setTodaysFoodLogs] = useState([]);
  const [calorieStats, setCalorieStats] = useState({ 
    caloriesConsumed: 0, 
    caloriesRemaining: 0, 
    percentage: 0 
  });
  const [macroTotals, setMacroTotals] = useState({
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [steps, setSteps] = useState(0);
  
  // Calculate today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Load initial data
  useEffect(() => {
    loadHomeData();
  }, []);
  
  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHomeData();
      return () => {};
    }, [])
  );
  
  // Function to load all home screen data
  const loadHomeData = async () => {
    setRefreshing(true);
    
    try {
      // Get today's food logs
      const logs = await getFoodLogs(today);
      setTodaysFoodLogs(logs);
      
      // Calculate calorie stats
      const stats = calculateDailyProgress(logs);
      setCalorieStats(stats);
      
      // Calculate macro totals
      const { protein, carbs, fat } = calculateMacroTotals(logs);
      setMacroTotals({ protein, carbs, fat });
      
      // Get step count
      const todaySteps = await getStepsForToday();
      setSteps(todaySteps);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Function to calculate macro totals from food logs
  const calculateMacroTotals = (logs) => {
    return logs.reduce((totals, food) => {
      return {
        protein: totals.protein + (food.protein || 0),
        carbs: totals.carbs + (food.carbs || 0),
        fat: totals.fat + (food.fat || 0)
      };
    }, { protein: 0, carbs: 0, fat: 0 });
  };
  
  // Get macro goals from user profile
  const getMacroGoals = () => {
    if (!userProfile || !userProfile.macroGoals) {
      return { proteinGoal: 0, carbsGoal: 0, fatGoal: 0 };
    }
    
    return {
      proteinGoal: userProfile.macroGoals.protein || 0,
      carbsGoal: userProfile.macroGoals.carbs || 0,
      fatGoal: userProfile.macroGoals.fat || 0
    };
  };
  
  const { proteinGoal, carbsGoal, fatGoal } = getMacroGoals();
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    await loadHomeData();
  };
  
  // Navigate to camera screen
  const navigateToCamera = () => {
    navigation.navigate('Camera');
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Welcome section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
            Welcome back,
          </Text>
          <Text style={[styles.nameText, { color: theme.colors.text }]}>
            {userProfile?.name || 'Friend'}
          </Text>
        </View>
        
        {/* Profile button */}
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: theme.colors.primary + '20' }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Feather name="user" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Calorie progress */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Today's Progress
        </Text>
        <CalorieProgress 
          consumed={calorieStats.caloriesConsumed}
          goal={userProfile?.calorieGoal || 2000}
          theme={theme}
        />
      </View>
      
      {/* Macro nutrients */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Macronutrients
        </Text>
        <View style={styles.macrosContainer}>
          <NutritionCard
            title="Protein"
            amount={Math.round(macroTotals.protein)}
            goal={proteinGoal}
            icon={getNutrientIcon('protein')}
            color={theme.colors.protein}
          />
          <NutritionCard
            title="Carbs"
            amount={Math.round(macroTotals.carbs)}
            goal={carbsGoal}
            icon={getNutrientIcon('carbs')}
            color={theme.colors.carbs}
          />
          <NutritionCard
            title="Fat"
            amount={Math.round(macroTotals.fat)}
            goal={fatGoal}
            icon={getNutrientIcon('fat')}
            color={theme.colors.fat}
          />
        </View>
      </View>
      
      {/* Steps section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Daily Activity
        </Text>
        <StepCounter 
          steps={steps} 
          goal={userProfile?.stepGoal || 10000}
          theme={theme}
        />
      </View>
      
      {/* Quick add button */}
      <View style={styles.quickAddSection}>
        <Button
          mode="contained"
          icon="camera"
          style={styles.quickAddButton}
          contentStyle={styles.quickAddButtonContent}
          labelStyle={styles.quickAddButtonLabel}
          onPress={navigateToCamera}
        >
          Take Photo of Food
        </Button>
        
        <Button
          mode="outlined"
          icon="plus"
          style={[styles.quickAddButton, styles.secondaryButton]}
          contentStyle={styles.quickAddButtonContent}
          onPress={() => navigation.navigate('Food Log')}
        >
          Add Food Manually
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAddSection: {
    marginTop: 8,
    marginBottom: 30,
  },
  quickAddButton: {
    marginBottom: 12,
  },
  quickAddButtonContent: {
    height: 50,
  },
  quickAddButtonLabel: {
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
  },
});

export default HomeScreen;