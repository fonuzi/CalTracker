import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';
import { stepsToDistance, calculateCaloriesBurned } from '../utils/calculators';

/**
 * A component to display the user's step count progress
 * @param {number} steps - Current step count
 * @param {number} goal - Step count goal
 * @param {Object} theme - Current theme
 */
const StepCounter = ({ steps = 0, goal = 10000, theme, userWeight, onPress }) => {
  // Calculate percentage of goal achieved (capped at 100%)
  const percentage = Math.min(100, Math.round((steps / goal) * 100));
  
  // Calculate distance based on steps
  const distance = stepsToDistance(steps);
  
  // Calculate calories burned
  const caloriesBurned = calculateCaloriesBurned(steps, userWeight);
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animatable.View animation="fadeIn" duration={1000} style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="activity" size={20} color={theme.colors.primary} style={styles.icon} />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Steps
            </Text>
          </View>
          
          <Text style={[styles.stepCount, { color: theme.colors.text }]}>
            {steps.toLocaleString()}
          </Text>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <Animatable.View
            animation="slideInLeft"
            duration={1000}
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="target" size={16} color={theme.colors.secondaryText} style={styles.statIcon} />
            <Text style={[styles.statText, { color: theme.colors.secondaryText }]}>
              Goal: {goal.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="map-pin" size={16} color={theme.colors.secondaryText} style={styles.statIcon} />
            <Text style={[styles.statText, { color: theme.colors.secondaryText }]}>
              {distance.toFixed(2)} km
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="zap" size={16} color={theme.colors.secondaryText} style={styles.statIcon} />
            <Text style={[styles.statText, { color: theme.colors.secondaryText }]}>
              {caloriesBurned} cal
            </Text>
          </View>
        </View>
      </Animatable.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  icon: {
    marginRight: 4,
  },
  stepCount: {
    fontSize: 20,
    fontWeight: 'bold',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 14,
  },
});

export default StepCounter;