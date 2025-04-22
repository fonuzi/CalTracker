import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme, ProgressBar } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

/**
 * A component to display the user's step count progress
 * @param {number} steps - Current step count
 * @param {number} goal - Step count goal
 * @param {Object} theme - Current theme
 */
const StepCounter = ({ steps, goal, theme }) => {
  // Calculate percentage of goal
  const percentage = Math.min(1, steps / goal);
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Feather name="activity" size={20} color={theme.colors.primary} style={styles.icon} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Daily Steps
          </Text>
        </View>
        
        <Text style={[styles.goal, { color: theme.colors.secondaryText }]}>
          Goal: {formatNumber(goal)}
        </Text>
      </View>
      
      <View style={styles.countContainer}>
        <Text style={[styles.stepCount, { color: theme.colors.text }]}>
          {formatNumber(steps)}
        </Text>
        <Text style={[styles.stepLabel, { color: theme.colors.secondaryText }]}>
          steps
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={percentage} 
          color={theme.colors.primary} 
          style={styles.progressBar} 
        />
        
        <Text style={[styles.percentage, { color: theme.colors.primary }]}>
          {Math.round(percentage * 100)}%
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goal: {
    fontSize: 14,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  stepCount: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  percentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default StepCounter;