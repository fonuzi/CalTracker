import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Icon } from '../assets/icons';

/**
 * A component to display the user's step count progress
 * @param {number} steps - Current step count
 * @param {number} goal - Step count goal
 * @param {Object} theme - Current theme
 */
const StepCounter = ({ steps = 0, goal = 10000, theme }) => {
  // Calculate percentage
  const percentage = Math.min(100, Math.round((steps / goal) * 100));
  
  // Format the step count with commas
  const formattedSteps = steps.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedGoal = goal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Steps</Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
            Today
          </Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Icon name="activity" size={18} color={theme.colors.primary} />
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <AnimatedCircularProgress
          size={90}
          width={8}
          fill={percentage}
          tintColor={theme.colors.primary}
          backgroundColor={theme.colors.border}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <View style={styles.innerTextContainer}>
              <Text style={[styles.stepsText, { color: theme.colors.text }]}>
                {formattedSteps}
              </Text>
              <Text style={[styles.stepsLabel, { color: theme.colors.secondaryText }]}>
                steps
              </Text>
            </View>
          )}
        </AnimatedCircularProgress>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {percentage}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
              of goal
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formattedGoal}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
              target
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  innerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepsLabel: {
    fontSize: 10,
  },
  statsContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  statItem: {
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
});

export default StepCounter;