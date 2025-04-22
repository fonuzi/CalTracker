import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Text, Surface, useTheme, Button } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

// Import custom components and services
import StepCounter from '../components/StepCounter';
import { UserContext } from '../context/UserContext';
import { 
  getStepsForToday, 
  getStepsForPastWeek, 
  subscribeToStepUpdates,
  requestHealthKitPermissions
} from '../services/HealthKitService';
import { calculateCaloriesBurned, stepsToDistance } from '../utils/calculators';

const { width } = Dimensions.get('window');

const StepTrackingScreen = () => {
  const theme = useTheme();
  const { userProfile } = useContext(UserContext);
  const animationRef = useRef(null);
  
  // State
  const [steps, setSteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  
  // Effect to check permissions and load step data on mount
  useEffect(() => {
    const checkPermissionsAndLoadData = async () => {
      try {
        // Request permissions
        const permissionResult = await requestHealthKitPermissions();
        setHasPermission(permissionResult);
        
        if (permissionResult) {
          // Load step data
          await loadStepData();
        }
      } catch (error) {
        console.error('Error setting up step tracking:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPermissionsAndLoadData();
  }, []);
  
  // Effect to subscribe to step updates
  useEffect(() => {
    if (!hasPermission) return;
    
    // Subscribe to step updates
    const subscription = subscribeToStepUpdates(newSteps => {
      setSteps(prevSteps => {
        const updatedSteps = prevSteps + newSteps;
        
        // Play animation if steps increased
        if (newSteps > 0 && animationRef.current) {
          animationRef.current.pulse(800);
        }
        
        return updatedSteps;
      });
    });
    
    // Clean up subscription
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [hasPermission]);
  
  // Function to load step data
  const loadStepData = async () => {
    setRefreshing(true);
    
    try {
      // Get today's steps
      const todaySteps = await getStepsForToday();
      setSteps(todaySteps);
      
      // Get weekly step data
      const weekSteps = await getStepsForPastWeek();
      setWeeklySteps(weekSteps);
    } catch (error) {
      console.error('Error loading step data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Function to handle requesting permissions
  const handleRequestPermissions = async () => {
    try {
      const result = await requestHealthKitPermissions();
      setHasPermission(result);
      
      if (result) {
        // Load step data after getting permissions
        await loadStepData();
      }
    } catch (error) {
      console.error('Error requesting pedometer permissions:', error);
    }
  };
  
  // Function to handle refreshing
  const onRefresh = async () => {
    await loadStepData();
  };
  
  // Calculate stats
  const caloriesBurned = calculateCaloriesBurned(
    steps,
    userProfile?.weight || 70
  );
  
  const distanceKm = stepsToDistance(
    steps,
    userProfile?.height || 170
  );
  
  const stepGoal = userProfile?.stepGoal || 10000;
  const stepPercentage = Math.min(100, Math.round((steps / stepGoal) * 100));
  
  // Generate chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(-weeklySteps.length),
    datasets: [
      {
        data: weeklySteps.length > 0 ? weeklySteps : [0, 0, 0, 0, 0, 0, 0],
        color: () => theme.colors.primary,
        strokeWidth: 2
      }
    ],
  };
  
  // If permission not granted
  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContainer}>
          <Feather 
            name="activity" 
            size={70} 
            color={theme.colors.primary} 
            style={styles.permissionIcon} 
          />
          <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
            Step Tracking Permissions
          </Text>
          <Text style={[styles.permissionText, { color: theme.colors.secondaryText }]}>
            NutriTrack needs access to your step data to track your daily activity and provide better insights.
          </Text>
          <Button
            mode="contained"
            onPress={handleRequestPermissions}
            style={styles.permissionButton}
          >
            Enable Step Tracking
          </Button>
        </View>
      </View>
    );
  }
  
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
      {/* Step Counter */}
      <Animatable.View ref={animationRef}>
        <StepCounter
          steps={steps}
          goal={stepGoal}
          theme={theme}
        />
      </Animatable.View>
      
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statContent}>
            <Feather name="zap" size={24} color={theme.colors.warning} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {caloriesBurned}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
              CALORIES BURNED
            </Text>
          </View>
        </Surface>
        
        <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statContent}>
            <Feather name="map" size={24} color={theme.colors.info} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {distanceKm}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
              KM WALKED
            </Text>
          </View>
        </Surface>
      </View>
      
      {/* Weekly Progress Chart */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Weekly Steps
      </Text>
      
      <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
        <LineChart
          data={chartData}
          width={width - 32}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, // Primary color with opacity
            labelColor: () => theme.colors.secondaryText,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              stroke: theme.colors.primary,
              strokeWidth: '2',
            },
          }}
          style={styles.chart}
          bezier
        />
      </Surface>
      
      {/* Activity Insights */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Activity Insights
      </Text>
      
      <Surface style={[styles.insightsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.insightRow}>
          <Feather 
            name={stepPercentage >= 100 ? 'award' : 'trending-up'} 
            size={24} 
            color={stepPercentage >= 100 ? theme.colors.success : theme.colors.primary} 
            style={styles.insightIcon}
          />
          <View style={styles.insightTextContainer}>
            <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
              {stepPercentage >= 100 
                ? 'Daily Goal Achieved!'
                : `${stepPercentage}% of Daily Goal`
              }
            </Text>
            <Text style={[styles.insightDescription, { color: theme.colors.secondaryText }]}>
              {stepPercentage >= 100
                ? 'Great job on meeting your step goal today!'
                : `You need ${stepGoal - steps} more steps to reach your goal of ${stepGoal} steps.`
              }
            </Text>
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        <View style={styles.insightRow}>
          <Feather 
            name="zap" 
            size={24} 
            color={theme.colors.warning} 
            style={styles.insightIcon}
          />
          <View style={styles.insightTextContainer}>
            <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
              Calories Burned
            </Text>
            <Text style={[styles.insightDescription, { color: theme.colors.secondaryText }]}>
              You've burned approximately {caloriesBurned} calories through walking today.
            </Text>
          </View>
        </View>
      </Surface>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chartCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    elevation: 2,
  },
  chart: {
    borderRadius: 12,
    padding: 0,
  },
  insightsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  insightIcon: {
    marginRight: 16,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    paddingHorizontal: 16,
  },
});

export default StepTrackingScreen;