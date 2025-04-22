import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../assets/icons';

/**
 * A component to display the user's step count progress
 * @param {number} steps - Current step count
 * @param {number} goal - Step count goal
 * @param {Object} theme - Current theme
 */
const StepCounter = ({ steps = 0, goal = 10000, theme, onPress }) => {
  // Calculate percentage
  const percentage = Math.min(100, Math.round((steps / goal) * 100));
  
  // Calculate kilometers based on steps (rough estimate)
  const kilometers = (steps * 0.0008).toFixed(2);
  
  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Icon name="activity" size={20} color={theme.colors.primary} style={styles.titleIcon} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Today's Steps
          </Text>
        </View>
        
        <Icon name="chevron-right" size={20} color={theme.colors.secondaryText} />
      </View>
      
      <View style={styles.contentRow}>
        <View style={styles.stepsContainer}>
          <Text style={[styles.stepCount, { color: theme.colors.text }]}>
            {formatNumber(steps)}
          </Text>
          <Text style={[styles.stepLabel, { color: theme.colors.secondaryText }]}>
            steps
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.goalContainer}>
            <Text style={[styles.progressText, { color: theme.colors.secondaryText }]}>
              {percentage}% of daily goal
            </Text>
            <Text style={[styles.goalText, { color: theme.colors.secondaryText }]}>
              Goal: {formatNumber(goal)}
            </Text>
          </View>
          
          <View style={[styles.progressBackground, { backgroundColor: theme.colors.surfaceHighlight }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${percentage}%`,
                  backgroundColor: percentage >= 100 
                    ? theme.colors.success 
                    : theme.colors.primary
                }
              ]}
            />
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="navigation" size={14} color={theme.colors.secondary} style={styles.statIcon} />
              <Text style={[styles.statText, { color: theme.colors.secondaryText }]}>
                {kilometers} km
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="zap" size={14} color={theme.colors.warning} style={styles.statIcon} />
              <Text style={[styles.statText, { color: theme.colors.secondaryText }]}>
                {Math.round(steps * 0.04)} kcal
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepsContainer: {
    marginRight: 20,
  },
  stepCount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 14,
  },
  progressContainer: {
    flex: 1,
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
  },
  goalText: {
    fontSize: 12,
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
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
    fontSize: 12,
  },
});

export default StepCounter;