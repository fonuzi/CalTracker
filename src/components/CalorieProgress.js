import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircularProgress } from 'react-native-circular-progress';
import { Icon } from '../assets/icons';

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
  
  // Get status color based on percentage
  const getStatusColor = () => {
    if (percentage >= 100) {
      return theme.colors.error;
    } else if (percentage >= 85) {
      return theme.colors.warning;
    } else {
      return theme.colors.success;
    }
  };
  
  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.progressContainer}>
        <CircularProgress
          size={120}
          width={12}
          fill={percentage}
          tintColor={getStatusColor()}
          backgroundColor={theme.colors.surfaceHighlight}
          rotation={0}
          lineCap="round"
        >
          {() => (
            <View style={styles.progressTextContainer}>
              <Text style={[styles.calorieCount, { color: theme.colors.text }]}>
                {formatNumber(consumed)}
              </Text>
              <Text style={[styles.calorieLabel, { color: theme.colors.secondaryText }]}>
                KCAL
              </Text>
            </View>
          )}
        </CircularProgress>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Daily Calories
        </Text>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="target" size={18} color={theme.colors.primary} style={styles.detailIcon} />
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatNumber(goal)}
            </Text>
            <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
              Goal
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="battery-charging" size={18} color={getStatusColor()} style={styles.detailIcon} />
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatNumber(remaining)}
            </Text>
            <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
              Remaining
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="percent" size={18} color={theme.colors.secondary} style={styles.detailIcon} />
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {percentage}%
            </Text>
            <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
              Complete
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    marginRight: 20,
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  calorieCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailIcon: {
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default CalorieProgress;