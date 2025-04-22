import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { 
  getStepsForToday, 
  getStepsForPastWeek, 
  subscribeToStepUpdates 
} from '../services/HealthKitService';
import { calculateCaloriesBurned, stepsToDistance } from '../utils/calculators';
import { LineChart } from 'react-native-chart-kit';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

const StepTrackingScreen = ({ navigation, theme }) => {
  const { userProfile } = useContext(UserContext);
  const [steps, setSteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const stepGoal = 10000; // Default step goal
  const stepSubscription = useRef(null);
  
  useEffect(() => {
    // Load step data
    loadStepData();
    
    // Set up step counter subscription
    setupStepCounter();
    
    // Clean up subscription on unmount
    return () => {
      if (stepSubscription.current) {
        stepSubscription.current.remove();
      }
    };
  }, []);
  
  // Load step data from the HealthKit service
  const loadStepData = async () => {
    try {
      setLoading(true);
      
      // Get today's steps
      const todaySteps = await getStepsForToday();
      setSteps(todaySteps);
      
      // Get weekly steps
      const weekSteps = await getStepsForPastWeek();
      setWeeklySteps(weekSteps);
      
      setHasPermission(true);
    } catch (error) {
      console.error('Error loading step data:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Set up step counter subscription for real-time updates
  const setupStepCounter = () => {
    try {
      stepSubscription.current = subscribeToStepUpdates((newSteps) => {
        setSteps(newSteps);
      });
    } catch (error) {
      console.error('Error setting up step counter:', error);
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    return Math.min(100, Math.round((steps / stepGoal) * 100));
  };
  
  // Calculate calories burned based on steps and user weight
  const calculateCalories = () => {
    const weight = userProfile?.weight || 70; // Default to 70kg if no weight available
    return calculateCaloriesBurned(steps, weight);
  };
  
  // Calculate distance walked based on steps and user height
  const calculateDistance = () => {
    const height = userProfile?.height || 170; // Default to 170cm if no height available
    return stepsToDistance(steps, height);
  };
  
  // Get the last 7 days as formatted strings (e.g., "Mon", "Tue", etc.)
  const getWeekLabels = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(days[date.getDay()]);
    }
    
    return labels;
  };
  
  // Loading indicator
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  // No permission screen
  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Icon name="activity" size={48} color={theme.colors.error} style={{ opacity: 0.6 }} />
        <Text style={[styles.noPermissionText, { color: theme.colors.text }]}>
          Step tracking is not available on this device.
        </Text>
        <Text style={[styles.noPermissionSubText, { color: theme.colors.secondaryText }]}>
          Step data is either unavailable or permission has been denied.
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Main step counter */}
      <Animatable.View 
        animation="fadeIn" 
        duration={800} 
        style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.stepHeaderRow}>
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Daily Steps</Text>
          <View style={styles.goalContainer}>
            <Icon name="flag" size={16} color={theme.colors.primary} />
            <Text style={[styles.goalText, { color: theme.colors.text }]}>
              Goal: {stepGoal.toLocaleString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.stepCountContainer}>
          <Text style={[styles.stepCount, { color: theme.colors.text }]}>
            {steps.toLocaleString()}
          </Text>
          <Text style={[styles.stepLabel, { color: theme.colors.secondaryText }]}>
            steps
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { backgroundColor: theme.colors.border }
            ]}
          />
          <View
            style={[
              styles.progressFill,
              {
                width: `${calculateProgress()}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        
        <Text style={[styles.progressText, { color: theme.colors.secondaryText }]}>
          {calculateProgress()}% of daily goal
        </Text>
      </Animatable.View>
      
      {/* Step stats */}
      <View style={styles.statsContainer}>
        <Animatable.View 
          animation="fadeInUp" 
          delay={200} 
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        >
          <Icon name="zap" size={24} color={theme.colors.primary} style={styles.statIcon} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {calculateCalories()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
            calories burned
          </Text>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          delay={300} 
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        >
          <Icon name="map" size={24} color={theme.colors.primary} style={styles.statIcon} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {calculateDistance()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
            kilometers
          </Text>
        </Animatable.View>
      </View>
      
      {/* Weekly chart */}
      <Animatable.View 
        animation="fadeIn" 
        delay={400} 
        style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Weekly Activity
        </Text>
        
        <LineChart
          data={{
            labels: getWeekLabels(),
            datasets: [
              {
                data: weeklySteps,
                color: (opacity = 1) => theme.colors.primary,
                strokeWidth: 2,
              },
            ],
          }}
          width={Dimensions.get('window').width - 50}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(142, 124, 255, ${opacity})`,
            labelColor: (opacity = 1) => theme.colors.secondaryText,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: theme.colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </Animatable.View>
      
      {/* Tips section */}
      <Animatable.View 
        animation="fadeIn" 
        delay={500} 
        style={[styles.tipsCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
          Activity Tips
        </Text>
        
        <View style={styles.tipItem}>
          <Icon name="trending-up" size={20} color={theme.colors.primary} style={styles.tipIcon} />
          <Text style={[styles.tipText, { color: theme.colors.secondaryText }]}>
            Try to take a 5-minute walk every hour during the day
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Icon name="sun" size={20} color={theme.colors.primary} style={styles.tipIcon} />
          <Text style={[styles.tipText, { color: theme.colors.secondaryText }]}>
            Morning walks can boost your energy for the entire day
          </Text>
        </View>
        
        <View style={styles.tipItem}>
          <Icon name="heart" size={20} color={theme.colors.primary} style={styles.tipIcon} />
          <Text style={[styles.tipText, { color: theme.colors.secondaryText }]}>
            Aim for at least 150 minutes of walking each week
          </Text>
        </View>
      </Animatable.View>
    </ScrollView>
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
  stepCard: {
    borderRadius: 16,
    padding:
    20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    marginLeft: 6,
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
    marginTop: 5,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  tipsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  noPermissionText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 30,
  },
  noPermissionSubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 40,
  },
});

export default StepTrackingScreen;