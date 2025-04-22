import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

/**
 * A component to display the user's daily calorie progress
 * @param {number} consumed - Calories consumed today
 * @param {number} goal - Calorie goal for the day
 * @param {Object} theme - Current theme
 */
const CalorieProgress = ({ consumed = 0, goal = 2000, theme }) => {
  // Calculate percentage
  const percentage = Math.min(100, Math.round((consumed / goal) * 100));
  
  // Calculate remaining calories
  const remaining = Math.max(0, goal - consumed);
  
  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={200}
        width={15}
        fill={percentage}
        tintColor={theme.colors.primary}
        backgroundColor={theme.colors.border}
        arcSweepAngle={240}
        rotation={240}
        lineCap="round"
      >
        {() => (
          <View style={styles.innerContainer}>
            <Text style={[styles.consumedText, { color: theme.colors.text }]}>
              {consumed}
            </Text>
            <Text style={[styles.unitText, { color: theme.colors.secondaryText }]}>
              calories
            </Text>
          </View>
        )}
      </AnimatedCircularProgress>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>Goal</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{goal}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>Remaining</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{remaining}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumedText: {
    fontSize: 36,
    fontWeight: '700',
  },
  unitText: {
    fontSize: 16,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '80%',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#333333',
  },
});

export default CalorieProgress;