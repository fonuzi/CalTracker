import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Animatable from 'react-native-animatable';

/**
 * A component to display the user's step count progress
 * @param {number} steps - Current step count
 * @param {number} goal - Step count goal
 * @param {Object} theme - Current theme
 */
const StepCounter = ({ steps = 0, goal = 10000, theme }) => {
  // Calculate the percentage of goal met
  const percentage = Math.min(100, Math.round((steps / goal) * 100));
  
  // Estimate calories burned and distance walked
  const caloriesBurned = Math.round(steps * 0.05); // rough estimate
  const distanceKm = (steps * 0.0007).toFixed(2); // rough conversion assuming ~70cm stride
  
  // Format numbers for display
  const formattedSteps = steps.toLocaleString();
  const formattedGoal = goal.toLocaleString();
  
  return (
    <View style={styles.container}>
      <View style={styles.progressSection}>
        <AnimatedCircularProgress
          size={120}
          width={10}
          fill={percentage}
          tintColor={theme.colors.primary}
          backgroundColor={theme.colors.disabled}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.innerContent}>
              <Feather name="activity" size={26} color={theme.colors.primary} />
              <Text style={[styles.stepsText, { color: theme.colors.text }]}>
                {formattedSteps}
              </Text>
              <Text style={[styles.stepsLabel, { color: theme.colors.secondaryText }]}>
                steps
              </Text>
            </Animatable.View>
          )}
        </AnimatedCircularProgress>
        
        <View style={styles.goalContainer}>
          <Text style={[styles.goalText, { color: theme.colors.secondaryText }]}>
            Goal: {formattedGoal} steps
          </Text>
          <View style={styles.linearProgress}>
            <View 
              style={[
                styles.linearProgressFill, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${percentage}%` 
                }
              ]} 
            />
          </View>
          <Text style={[styles.percentageText, { color: theme.colors.primary }]}>
            {percentage}% Complete
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Feather name="zap" size={20} color={theme.colors.warning} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {caloriesBurned}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
            calories
          </Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Feather name="map" size={20} color={theme.colors.accent} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {distanceKm}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
            kilometers
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  stepsLabel: {
    fontSize: 12,
  },
  goalContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  goalText: {
    fontSize: 14,
    marginBottom: 10,
  },
  linearProgress: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  linearProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 10,
  },
});

export default StepCounter;