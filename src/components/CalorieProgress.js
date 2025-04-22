import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

/**
 * A component to display the user's daily calorie progress
 * @param {number} consumed - Calories consumed today
 * @param {number} goal - Calorie goal for the day
 * @param {Object} theme - Current theme
 */
const CalorieProgress = ({ consumed = 0, goal = 2000, theme }) => {
  // Calculate the percentage of goal consumed
  const percentage = Math.min(100, Math.round((consumed / goal) * 100));
  
  // Determine the color based on percentage
  const getColor = () => {
    if (percentage <= 30) return theme.colors.success;
    if (percentage <= 75) return theme.colors.primary;
    if (percentage <= 95) return theme.colors.warning;
    return theme.colors.error;
  };
  
  // Format the text display
  const formattedConsumed = consumed.toLocaleString();
  const formattedGoal = goal.toLocaleString();
  
  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={180}
        width={12}
        fill={percentage}
        tintColor={getColor()}
        backgroundColor={theme.colors.disabled}
        rotation={0}
        lineCap="round"
      >
        {() => (
          <View style={styles.innerContent}>
            <Text style={[styles.percentage, { color: theme.colors.text }]}>
              {percentage}%
            </Text>
            <Text style={[styles.calorieText, { color: theme.colors.secondaryText }]}>
              {formattedConsumed} / {formattedGoal}
            </Text>
            <Text style={[styles.label, { color: theme.colors.secondaryText }]}>
              calories
            </Text>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  calorieText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    marginTop: 3,
  },
});

export default CalorieProgress;