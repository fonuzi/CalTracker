import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Icon } from '../assets/icons';

/**
 * A component to display the user's daily calorie progress
 * @param {number} consumed - Calories consumed today
 * @param {number} goal - Calorie goal for the day
 * @param {Object} theme - Current theme
 */
const CalorieProgress = ({ consumed = 0, goal = 2000, theme }) => {
  // Calculate percentage of goal consumed
  const percentage = goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;
  
  // Calculate remaining calories
  const remaining = Math.max(0, goal - consumed);
  
  // Determine fill color based on percentage
  const getFillColor = () => {
    if (percentage < 80) {
      return theme.colors.success; // Good progress (green)
    } else if (percentage < 100) {
      return theme.colors.warning; // Warning (orange)
    } else {
      return theme.colors.error; // Over goal (red)
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Daily Calories</Text>
        <View style={styles.goalContainer}>
          <Icon name="target" size={16} color={theme.colors.secondaryText} style={styles.goalIcon} />
          <Text style={[styles.goalText, { color: theme.colors.secondaryText }]}>
            Goal: {goal}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <AnimatedCircularProgress
          size={140}
          width={12}
          backgroundWidth={8}
          fill={percentage}
          tintColor={getFillColor()}
          backgroundColor={theme.colors.surfaceHighlight}
          arcSweepAngle={240}
          rotation={-120}
          lineCap="round"
        >
          {() => (
            <View style={styles.progressTextContainer}>
              <Text style={[styles.consumedText, { color: theme.colors.text }]}>
                {consumed}
              </Text>
              <Text style={[styles.caloriesLabel, { color: theme.colors.secondaryText }]}>
                calories
              </Text>
            </View>
          )}
        </AnimatedCircularProgress>
        
        <View style={styles.remainingContainer}>
          <Text style={[styles.remainingText, { color: theme.colors.text }]}>
            {remaining}
          </Text>
          <Text style={[styles.remainingLabel, { color: theme.colors.secondaryText }]}>
            {remaining === 1 ? 'calorie left' : 'calories left'}
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
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    marginRight: 4,
  },
  goalText: {
    fontSize: 14,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  progressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumedText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  remainingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  remainingText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  remainingLabel: {
    fontSize: 14,
  },
});

export default CalorieProgress;