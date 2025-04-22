import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../assets/icons';
import { stepsToDistance, calculateCaloriesBurned } from '../utils/calculators';

/**
 * A component to display the user's step count progress
 * @param {number} steps - Current step count
 * @param {number} goal - Step count goal
 * @param {Object} theme - Current theme
 */
const StepCounter = ({ steps, goal, theme }) => {
  // Calculate percentage of daily goal
  const percentage = Math.min(100, Math.round((steps / goal) * 100));
  
  // Calculate distance in km (estimated based on average stride length)
  const distance = stepsToDistance(steps);
  
  // Calculate calories burned (estimated based on average metrics)
  const caloriesBurned = calculateCaloriesBurned(steps);
  
  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="activity" size={20} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Daily Steps</Text>
        </View>
        <Text style={[styles.goalText, { color: theme.colors.secondaryText }]}>
          Goal: {formatNumber(goal)}
        </Text>
      </View>
      
      {/* Step count */}
      <Text style={[styles.stepCount, { color: theme.colors.text }]}>
        {formatNumber(steps)}
        <Text style={[styles.stepLabel, { color: theme.colors.secondaryText }]}>
          {' '}steps
        </Text>
      </Text>
      
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>
      
      {/* Additional metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Icon name="map-pin" size={16} color={theme.colors.primary} style={styles.metricIcon} />
          <Text style={[styles.metricValue, { color: theme.colors.text }]}>
            {distance} km
          </Text>
        </View>
        
        <View style={styles.metricItem}>
          <Icon name="zap" size={16} color={theme.colors.primary} style={styles.metricIcon} />
          <Text style={[styles.metricValue, { color: theme.colors.text }]}>
            {caloriesBurned} kcal
          </Text>
        </View>
        
        <View style={styles.metricItem}>
          <Icon name="percent" size={16} color={theme.colors.primary} style={styles.metricIcon} />
          <Text style={[styles.metricValue, { color: theme.colors.text }]}>
            {percentage}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  goalText: {
    fontSize: 14,
  },
  stepCount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StepCounter;