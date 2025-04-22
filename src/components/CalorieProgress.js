import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { CircularProgress } from 'react-native-circular-progress';
import { Feather } from '@expo/vector-icons';

/**
 * A component to display the user's daily calorie progress
 * @param {number} consumed - Calories consumed today
 * @param {number} goal - Calorie goal for the day
 * @param {Object} theme - Current theme
 */
const CalorieProgress = ({ consumed = 0, goal = 2000, theme }) => {
  // Calculate percentage and remaining calories
  const percentage = Math.min(100, Math.round((consumed / goal) * 100));
  const remaining = Math.max(0, goal - consumed);
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.content}>
        {/* Left side: Progress circle */}
        <View style={styles.circleContainer}>
          <CircularProgress
            size={120}
            width={12}
            backgroundWidth={6}
            fill={percentage}
            tintColor={theme.colors.primary}
            backgroundColor={`${theme.colors.primary}20`}
            lineCap="round"
            rotation={0}
            renderCap={({ center }) => (
              <View
                style={[
                  styles.progressCap,
                  {
                    left: center.x - 6,
                    top: center.y - 65,
                    backgroundColor: theme.colors.primary,
                    transform: [{ rotate: `${percentage * 3.6}deg` }],
                  },
                ]}
              />
            )}
          >
            {() => (
              <View style={styles.progressTextContainer}>
                <Text style={[styles.percentageText, { color: theme.colors.primary }]}>
                  {percentage}%
                </Text>
                <Text style={[styles.goalText, { color: theme.colors.secondaryText }]}>
                  of goal
                </Text>
              </View>
            )}
          </CircularProgress>
        </View>
        
        {/* Right side: Calorie info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Feather 
                name="zap" 
                size={18} 
                color={theme.colors.primary} 
                style={styles.infoIcon} 
              />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
                Consumed
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatNumber(consumed)} cal
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Feather 
                name="flag" 
                size={18} 
                color={theme.colors.success} 
                style={styles.infoIcon} 
              />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
                Remaining
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.success }]}>
                {formatNumber(remaining)} cal
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Feather 
                name="target" 
                size={18} 
                color={theme.colors.secondaryText} 
                style={styles.infoIcon} 
              />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
                Daily Goal
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatNumber(goal)} cal
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleContainer: {
    marginRight: 20,
  },
  progressCap: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
  },
  progressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  goalText: {
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoIcon: {},
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalorieProgress;