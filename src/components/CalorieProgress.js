import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircularProgress } from 'react-native-circular-progress';
import * as Animatable from 'react-native-animatable';

/**
 * A component to display the user's daily calorie progress
 * @param {number} consumed - Calories consumed today
 * @param {number} goal - Calorie goal for the day
 * @param {Object} theme - Current theme
 */
const CalorieProgress = ({ consumed = 0, goal = 2000, theme }) => {
  // Calculate percentage of goal consumed (capped at 100%)
  const percentage = Math.min(100, Math.round((consumed / goal) * 100));
  
  // Determine remaining calories
  const remaining = Math.max(0, goal - consumed);
  
  // Get color based on percentage
  const getColor = () => {
    if (percentage < 50) {
      return theme.colors.success;
    } else if (percentage < 85) {
      return theme.colors.warning;
    } else {
      return theme.colors.error;
    }
  };
  
  return (
    <Animatable.View 
      animation="fadeIn" 
      duration={1000} 
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.progressContainer}>
        <CircularProgress
          size={180}
          width={15}
          fill={percentage}
          tintColor={getColor()}
          backgroundColor={theme.colors.border}
          rotation={0}
          lineCap="round"
          backgroundWidth={5}
        >
          {() => (
            <View style={styles.innerContent}>
              <Text style={[styles.calorieCount, { color: theme.colors.text }]}>
                {consumed}
              </Text>
              <Text style={[styles.calorieLabel, { color: theme.colors.secondaryText }]}>
                calories consumed
              </Text>
            </View>
          )}
        </CircularProgress>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {goal}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
            Daily Goal
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {remaining}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
            Remaining
          </Text>
        </View>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieCount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default CalorieProgress;