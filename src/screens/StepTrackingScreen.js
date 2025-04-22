import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, useTheme, Title, Divider, ProgressBar } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getStepsForToday, getStepsForPastWeek, checkHealthKitPermissions, requestHealthKitPermissions } from '../services/HealthKitService';
import { calculateCaloriesBurned } from '../utils/calculators';
import { UserContext } from '../context/UserContext';
import StepCounter from '../components/StepCounter';

const StepTrackingScreen = () => {
  const theme = useTheme();
  const { userProfile } = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [steps, setSteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [weekLabels, setWeekLabels] = useState([]);
  const [distance, setDistance] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  
  const stepGoal = userProfile?.stepGoal || 10000;
  const weight = userProfile?.weight ? parseFloat(userProfile.weight) : 70; // Default weight in kg
  const height = userProfile?.height ? parseFloat(userProfile.height) : 170; // Default height in cm
  
  const checkPermissions = async () => {
    const granted = await checkHealthKitPermissions();
    setHasPermissions(granted);
    return granted;
  };

  const loadStepData = async () => {
    setRefreshing(true);
    
    try {
      const hasPermission = await checkPermissions();
      
      if (hasPermission) {
        // Get today's steps
        const todaySteps = await getStepsForToday();
        setSteps(todaySteps);
        
        // Calculate approximate distance (rough estimate)
        // Average stride length is about 0.762 meters for a person who is 1.7m tall
        const strideLength = height * 0.00045; // Rough formula: height * 0.00045
        const distanceInKm = (todaySteps * strideLength) / 1000;
        setDistance(distanceInKm);
        
        // Calculate calories burned from steps
        const burned = calculateCaloriesBurned(todaySteps, weight);
        setCaloriesBurned(burned);
        
        // Get weekly data
        const weekData = await getStepsForPastWeek();
        
        // Format data for chart
        const stepCounts = weekData.map(day => day.steps);
        setWeeklySteps(stepCounts);
        
        // Generate day labels for the chart
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const labels = weekData.map(day => days[new Date(day.date).getDay()]);
        setWeekLabels(labels);
      }
    } catch (error) {
      console.error('Error loading step data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStepData();
    }, [])
  );

  const handleRequestPermissions = async () => {
    try {
      const granted = await requestHealthKitPermissions();
      setHasPermissions(granted);
      
      if (granted) {
        loadStepData();
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const onRefresh = () => {
    loadStepData();
  };

  const renderPermissionRequest = () => (
    <View style={styles.permissionContainer}>
      <Avatar.Icon 
        size={80} 
        icon={(props) => <Feather name="activity" {...props} />} 
        style={{ backgroundColor: theme.colors.primary }} 
      />
      <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
        Access to Health Data Required
      </Text>
      <Text style={[styles.permissionText, { color: theme.colors.text }]}>
        We need permission to access your step count data to track your activity.
      </Text>
      <Button 
        mode="contained" 
        onPress={handleRequestPermissions}
        style={styles.permissionButton}
      >
        Grant Permission
      </Button>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {hasPermissions ? (
        <>
          {/* Today's steps card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.text }}>Today's Steps</Title>
              <StepCounter 
                steps={steps} 
                goal={stepGoal}
                theme={theme}
                large
              />
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Feather name="map-pin" size={24} color={theme.colors.primary} />
                  <View style={styles.statText}>
                    <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
                    <Text style={styles.statLabel}>Distance</Text>
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <Feather name="zap" size={24} color={theme.colors.primary} />
                  <View style={styles.statText}>
                    <Text style={styles.statValue}>{caloriesBurned} kcal</Text>
                    <Text style={styles.statLabel}>Calories</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          {/* Weekly activity card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.text, marginBottom: 15 }}>Weekly Activity</Title>
              {weeklySteps.length > 0 ? (
                <LineChart
                  data={{
                    labels: weekLabels,
                    datasets: [
                      {
                        data: weeklySteps,
                      }
                    ]
                  }}
                  width={Dimensions.get("window").width - 60}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=" steps"
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundColor: theme.colors.surface,
                    backgroundGradientFrom: theme.colors.surface,
                    backgroundGradientTo: theme.colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(${theme.colors.primary.replace(/[^\d,]/g, '')}, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: theme.colors.accent
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={{ color: theme.colors.text, textAlign: 'center' }}>
                    No step data available for the past week.
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
          
          {/* Activity insights card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.text }}>Activity Insights</Title>
              <Divider style={styles.divider} />
              
              <View style={styles.insightItem}>
                <View style={styles.insightHeader}>
                  <Feather name="trending-up" size={20} color={theme.colors.primary} />
                  <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Daily Average</Text>
                </View>
                <Text style={styles.insightValue}>
                  {weeklySteps.length > 0 
                    ? Math.round(weeklySteps.reduce((sum, current) => sum + current, 0) / weeklySteps.length) 
                    : 0} steps
                </Text>
                <ProgressBar 
                  progress={weeklySteps.length > 0 
                    ? Math.min(1, (weeklySteps.reduce((sum, current) => sum + current, 0) / weeklySteps.length) / stepGoal) 
                    : 0} 
                  color={theme.colors.primary} 
                  style={styles.progressBar} 
                />
              </View>
              
              <View style={styles.insightItem}>
                <View style={styles.insightHeader}>
                  <Feather name="award" size={20} color={theme.colors.primary} />
                  <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Best Day</Text>
                </View>
                <Text style={styles.insightValue}>
                  {weeklySteps.length > 0 
                    ? Math.max(...weeklySteps) 
                    : 0} steps
                </Text>
                <ProgressBar 
                  progress={weeklySteps.length > 0 
                    ? Math.min(1, Math.max(...weeklySteps) / stepGoal) 
                    : 0} 
                  color={theme.colors.primary} 
                  style={styles.progressBar} 
                />
              </View>
              
              <Divider style={styles.divider} />
              
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>Tip: </Text>
                Try to take a 5-minute walking break every hour during your day to increase your step count.
              </Text>
            </Card.Content>
          </Card>
          
          {/* Activity goals card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.text }}>Activity Goals</Title>
              <Text style={styles.goalText}>
                Your current daily step goal is <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{stepGoal.toLocaleString()} steps</Text>
              </Text>
              
              <View style={styles.healthBenefitsContainer}>
                <Text style={[styles.healthBenefitsTitle, { color: theme.colors.text }]}>
                  Health Benefits
                </Text>
                <View style={styles.benefitItem}>
                  <Feather name="heart" size={16} color={theme.colors.primary} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>Improved cardiovascular health</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Feather name="battery-charging" size={16} color={theme.colors.primary} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>Increased energy levels</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Feather name="smile" size={16} color={theme.colors.primary} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>Enhanced mood and mental wellbeing</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Feather name="moon" size={16} color={theme.colors.primary} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>Better sleep quality</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </>
      ) : (
        renderPermissionRequest()
      )}
      
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    color: '#fff',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  insightItem: {
    marginBottom: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  insightTitle: {
    fontSize: 16,
    marginLeft: 5,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  goalText: {
    fontSize: 16,
    marginVertical: 10,
    color: '#fff',
  },
  healthBenefitsContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  healthBenefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    marginRight: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 50,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  permissionButton: {
    paddingHorizontal: 30,
  },
  bottomPadding: {
    height: 80,
  },
});

export default StepTrackingScreen;
