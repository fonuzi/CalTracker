import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculateRemainingCalories } from '../utils/foodAnalysis';

/**
 * A component to display the user's daily calorie progress
 * @param {number} consumed - Calories consumed today
 * @param {number} goal - Calorie goal for the day
 * @param {Object} theme - Current theme
 */
const CalorieProgress = ({ consumed, goal, theme }) => {
  // Calculate percentage for progress bar
  const percentage = Math.min(100, Math.round((consumed / goal) * 100));
  
  // Calculate calories remaining
  const remaining = calculateRemainingCalories(goal, consumed);
  
  // Determine color based on percentage
  const getProgressColor = () => {
    if (percentage < 50) {
      return theme.colors.success;
    } else if (percentage < 80) {
      return theme.colors.warning;
    } else if (percentage < 100) {
      return theme.colors.caution;
    } else {
      return theme.colors.error;
    }
  };
  
  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Calorie Budget</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {formatNumber(consumed)} / {formatNumber(goal)}
        </Text>
      </View>
      
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>
      
      {/* Info row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {formatNumber(consumed)}
          </Text>
          <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
            Consumed
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {formatNumber(remaining)}
          </Text>
          <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
            Remaining
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {formatNumber(goal)}
          </Text>
          <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
            Goal
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
  },
});

export default CalorieProgress;