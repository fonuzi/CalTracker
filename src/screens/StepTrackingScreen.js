import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';
import { 
  subscribeToStepUpdates, 
  getStepsForToday, 
  getStepsForPastWeek 
} from '../services/HealthKitService';
import { calculateCaloriesBurned, stepsToDistance } from '../utils/calculators';

const StepTrackingScreen = ({ navigation, theme }) => {
  const { userProfile } = useContext(UserContext);
  
  // State for steps
  const [steps, setSteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [subscription, setSubscription] = useState(null);
  
  // Get user's step goal
  const stepGoal = userProfile?.stepGoal || 10000;
  
  // Load steps on mount
  useEffect(() => {
    loadSteps();
    
    // Subscribe to step updates
    const stepSubscription = subscribeToStepUpdates((newSteps) => {
      setSteps(newSteps);
    });
    
    setSubscription(stepSubscription);
    
    // Clean up subscription on unmount
    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);
  
  // Load weekly steps on mount
  useEffect(() => {
    loadWeeklySteps();
  }, []);
  
  // Load steps
  const loadSteps = async () => {
    try {
      const todaysSteps = await getStepsForToday();
      setSteps(todaysSteps);
    } catch (error) {
      console.error('Error loading steps:', error);
    }
  };
  
  // Load weekly steps
  const loadWeeklySteps = async () => {
    try {
      const weekSteps = await getStepsForPastWeek();
      setWeeklySteps(weekSteps);
    } catch (error) {
      console.error('Error loading weekly steps:', error);
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    return Math.min(100, Math.round((steps / stepGoal) * 100));
  };
  
  // Format number with commas
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Get day name for weekly data
  const getDayName = (index) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const dayIndex = (today - 6 + index + 7) % 7;
    return days[dayIndex];
  };
  
  // Calculate day progress percentage for weekly chart
  const calculateDayProgress = (daySteps) => {
    return Math.min(100, Math.round((daySteps / stepGoal) * 100));
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Step Tracking
          </Text>
        </View>
        
        {/* Today's steps */}
        <Animatable.View 
          animation="fadeIn" 
          duration={800}
          style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.stepCountContainer}>
            <Text style={[styles.stepCount, { color: theme.colors.text }]}>
              {formatNumber(steps)}
            </Text>
            <Text style={[styles.stepLabel, { color: theme.colors.secondaryText }]}>
              steps today
            </Text>
          </View>
          
          <View style={styles.goalContainer}>
            <View style={[styles.progressBackground, { backgroundColor: theme.colors.surfaceHighlight }]}>
              <Animatable.View 
                animation="slideInLeft" 
                duration={1000}
                style={[
                  styles.progressFill, 
                  { 
                    width: `${calculateProgress()}%`,
                    backgroundColor: theme.colors.primary
                  }
                ]}
              />
            </View>
            <View style={styles.goalTextContainer}>
              <Text style={[styles.goalPercentage, { color: theme.colors.text }]}>
                {calculateProgress()}%
              </Text>
              <Text style={[styles.goalLabel, { color: theme.colors.secondaryText }]}>
                of {formatNumber(stepGoal)} goal
              </Text>
            </View>
          </View>
        </Animatable.View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Icon name="navigation" size={22} color={theme.colors.secondary} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stepsToDistance(steps, userProfile?.heightCm).toFixed(2)} km
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
              Distance
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Icon name="zap" size={22} color={theme.colors.warning} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {calculateCaloriesBurned(steps, userProfile?.weightKg)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
              Calories
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Icon name="clock" size={22} color={theme.colors.info} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {Math.round(steps / 1000 * 10)} min
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
              Active Time
            </Text>
          </View>
        </View>
        
        {/* Weekly progress */}
        <View style={[styles.weeklyCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Last 7 Days
          </Text>
          
          <View style={styles.chartContainer}>
            {weeklySteps.map((daySteps, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${calculateDayProgress(daySteps)}%`,
                        backgroundColor: 
                          daySteps >= stepGoal 
                            ? theme.colors.success 
                            : theme.colors.primary
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, { color: theme.colors.secondaryText }]}>
                  {getDayName(index)}
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.weeklyStatsContainer}>
            <View style={styles.weeklyStat}>
              <Text style={[styles.weeklyStatValue, { color: theme.colors.text }]}>
                {formatNumber(weeklySteps.reduce((sum, steps) => sum + steps, 0))}
              </Text>
              <Text style={[styles.weeklyStatLabel, { color: theme.colors.secondaryText }]}>
                Weekly Steps
              </Text>
            </View>
            
            <View style={styles.weeklyStat}>
              <Text style={[styles.weeklyStatValue, { color: theme.colors.text }]}>
                {Math.round(weeklySteps.reduce((sum, steps) => sum + steps, 0) / 7).toLocaleString()}
              </Text>
              <Text style={[styles.weeklyStatLabel, { color: theme.colors.secondaryText }]}>
                Daily Average
              </Text>
            </View>
          </View>
        </View>
        
        {/* Set goal button */}
        <TouchableOpacity
          style={[styles.setGoalButton, { borderColor: theme.colors.primary }]}
          onPress={() => {/* Navigate to goal setting */}}
        >
          <Text style={[styles.setGoalText, { color: theme.colors.primary }]}>
            Adjust Step Goal
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  stepCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepCountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepCount: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  goalContainer: {
    marginBottom: 10,
  },
  progressBackground: {
    height: 12,
    borderRadius: 6,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  goalTextContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  goalLabel: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  weeklyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    marginBottom: 16,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: 10,
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 5,
  },
  dayLabel: {
    fontSize: 12,
  },
  weeklyStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weeklyStatLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  setGoalButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 40,
  },
  setGoalText: {
    fontSize: 16,
    fontWeight: '600',
  }
});

export default StepTrackingScreen;