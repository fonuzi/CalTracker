import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../assets/icons';
import { calculateCaloriesBurned, stepsToDistance } from '../utils/calculators';

/**
 * A component to display the user's step count progress
 * @param {number} steps - Current step count
 * @param {number} goal - Step count goal
 * @param {Object} theme - Current theme
 */
const StepCounter = ({ steps = 0, goal = 10000, theme, userWeight = 70, onPress }) => {
  // Calculate percentage of goal reached
  const percentage = Math.min(100, Math.round((steps / goal) * 100));
  
  // Calculate distance in kilometers
  const distance = stepsToDistance(steps);
  
  // Calculate calories burned
  const caloriesBurned = calculateCaloriesBurned(steps, userWeight);
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      activeOpacity={0.8}
    >
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Icon 
            name="activity" 
            size={20} 
            color={theme.colors.primary} 
            style={styles.titleIcon}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>Steps</Text>
        </View>
        
        <Icon 
          name="chevron-right" 
          size={18} 
          color={theme.colors.secondaryText} 
        />
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.stepsContainer}>
          <Text style={[styles.stepsCount, { color: theme.colors.text }]}>
            {steps.toLocaleString()}
          </Text>
          <Text style={[styles.stepsGoal, { color: theme.colors.secondaryText }]}>
            / {goal.toLocaleString()}
          </Text>
        </View>
        
        <View 
          style={[
            styles.progressBar, 
            { backgroundColor: theme.colors.surfaceHighlight }
          ]}
        >
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: theme.colors.primary,
                width: `${percentage}%`,
              }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon 
            name="map-pin" 
            size={16} 
            color={theme.colors.secondaryText} 
            style={styles.statIcon} 
          />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {distance.toFixed(2)} km
          </Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Icon 
            name="zap" 
            size={16} 
            color={theme.colors.secondaryText} 
            style={styles.statIcon} 
          />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {caloriesBurned} kcal
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  stepsCount: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  stepsGoal: {
    fontSize: 16,
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statIcon: {
    marginRight: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
  },
});

export default StepCounter;