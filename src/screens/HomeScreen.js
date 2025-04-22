import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Icon } from '../assets/icons';
import CalorieProgress from '../components/CalorieProgress';
import NutritionCard from '../components/NutritionCard';
import StepCounter from '../components/StepCounter';
import * as Animatable from 'react-native-animatable';

const HomeScreen = ({ navigation, theme }) => {
  const { userProfile } = useContext(UserContext);
  
  // State
  const [refreshing, setRefreshing] = useState(false);
  const [todayStats, setTodayStats] = useState({
    calories: {
      consumed: 0,
      goal: 2000,
    },
    protein: {
      consumed: 0,
      goal: 120,
    },
    carbs: {
      consumed: 0,
      goal: 250,
    },
    fat: {
      consumed: 0,
      goal: 70,
    },
    steps: {
      count: 0,
      goal: 10000,
    },
  });
  
  // Update stats when user profile changes
  useEffect(() => {
    if (userProfile) {
      updateGoals();
    }
  }, [userProfile]);
  
  // Update goals based on user profile
  const updateGoals = () => {
    if (!userProfile) return;
    
    const { dailyCalorieGoal, macroGoals, stepGoal } = userProfile;
    
    if (dailyCalorieGoal) {
      setTodayStats(prev => ({
        ...prev,
        calories: {
          ...prev.calories,
          goal: dailyCalorieGoal
        }
      }));
    }
    
    if (macroGoals) {
      setTodayStats(prev => ({
        ...prev,
        protein: {
          ...prev.protein,
          goal: macroGoals.protein
        },
        carbs: {
          ...prev.carbs,
          goal: macroGoals.carbs
        },
        fat: {
          ...prev.fat,
          goal: macroGoals.fat
        }
      }));
    }
    
    if (stepGoal) {
      setTodayStats(prev => ({
        ...prev,
        steps: {
          ...prev.steps,
          goal: stepGoal
        }
      }));
    }
  };
  
  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Load data here
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {userProfile?.name || 'Fitness Enthusiast'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: theme.colors.surfaceHighlight }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="user" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Calorie Progress */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={600}
          delay={100}
        >
          <CalorieProgress
            consumed={todayStats.calories.consumed}
            goal={todayStats.calories.goal}
            theme={theme}
          />
        </Animatable.View>
        
        {/* Quick Add Buttons */}
        <View style={styles.quickAddContainer}>
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            delay={200}
          >
            <TouchableOpacity
              style={[styles.quickAddButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Camera')}
            >
              <Icon name="camera" size={20} color="#FFFFFF" style={styles.quickAddIcon} />
              <Text style={styles.quickAddText}>Add Food</Text>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            delay={300}
          >
            <TouchableOpacity
              style={[styles.quickAddButton, { backgroundColor: theme.colors.secondary }]}
              onPress={() => navigation.navigate('Activity')}
            >
              <Icon name="activity" size={20} color="#FFFFFF" style={styles.quickAddIcon} />
              <Text style={styles.quickAddText}>Track Steps</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
        
        {/* Nutrition Cards */}
        <View style={styles.nutritionSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Today's Nutrition
          </Text>
          
          <View style={styles.nutritionCards}>
            <Animatable.View 
              animation="fadeInUp" 
              duration={600}
              delay={400}
              style={styles.nutritionCardWrapper}
            >
              <NutritionCard
                title="Protein"
                amount={todayStats.protein.consumed}
                unit="g"
                icon="target"
                color={theme.colors.protein}
                goal={todayStats.protein.goal}
                theme={theme}
              />
            </Animatable.View>
            
            <Animatable.View 
              animation="fadeInUp" 
              duration={600}
              delay={500}
              style={styles.nutritionCardWrapper}
            >
              <NutritionCard
                title="Carbs"
                amount={todayStats.carbs.consumed}
                unit="g"
                icon="circle"
                color={theme.colors.carbs}
                goal={todayStats.carbs.goal}
                theme={theme}
              />
            </Animatable.View>
            
            <Animatable.View 
              animation="fadeInUp" 
              duration={600}
              delay={600}
              style={styles.nutritionCardWrapper}
            >
              <NutritionCard
                title="Fat"
                amount={todayStats.fat.consumed}
                unit="g"
                icon="triangle"
                color={theme.colors.fat}
                goal={todayStats.fat.goal}
                theme={theme}
              />
            </Animatable.View>
          </View>
        </View>
        
        {/* Step Counter */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={600}
          delay={700}
        >
          <StepCounter
            steps={todayStats.steps.count}
            goal={todayStats.steps.goal}
            theme={theme}
            onPress={() => navigation.navigate('Activity')}
          />
        </Animatable.View>
        
        {/* Quick Access */}
        <View style={styles.quickAccessSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Access
          </Text>
          
          <View style={styles.quickAccessCards}>
            <Animatable.View 
              animation="fadeInUp" 
              duration={600}
              delay={800}
            >
              <TouchableOpacity
                style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('Food Log')}
              >
                <View style={[styles.quickAccessIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="book-open" size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.quickAccessTitle, { color: theme.colors.text }]}>
                  Food Log
                </Text>
                <Text style={[styles.quickAccessSubtitle, { color: theme.colors.secondaryText }]}>
                  View your meals
                </Text>
              </TouchableOpacity>
            </Animatable.View>
            
            <Animatable.View 
              animation="fadeInUp" 
              duration={600}
              delay={900}
            >
              <TouchableOpacity
                style={[styles.quickAccessCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => {/* Navigate to water tracking */}}
              >
                <View style={[styles.quickAccessIconContainer, { backgroundColor: theme.colors.info + '20' }]}>
                  <Icon name="droplet" size={24} color={theme.colors.info} />
                </View>
                <Text style={[styles.quickAccessTitle, { color: theme.colors.text }]}>
                  Water
                </Text>
                <Text style={[styles.quickAccessSubtitle, { color: theme.colors.secondaryText }]}>
                  Track hydration
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Helper function to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 18) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 0.48,
  },
  quickAddIcon: {
    marginRight: 8,
  },
  quickAddText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nutritionSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nutritionCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionCardWrapper: {
    width: '31%',
    marginBottom: 12,
  },
  quickAccessSection: {
    marginTop: 16,
  },
  quickAccessCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontSize: 14,
  },
});

export default HomeScreen;