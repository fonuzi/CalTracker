import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../assets/icons';

/**
 * A component to display a specific nutrient value and goal
 * @param {string} title - Nutrient name (e.g., "Protein", "Carbs")
 * @param {number} amount - Amount consumed
 * @param {string} unit - Unit of measurement (e.g., "g")
 * @param {string} icon - Feather icon name
 * @param {string} color - Color for the icon and progress bar
 * @param {number} goal - Goal amount for this nutrient
 */
const NutritionCard = ({ title, amount, unit, icon, color, goal, theme }) => {
  // Calculate percentage for the progress bar
  const percentage = Math.min(100, Math.round((amount / goal) * 100));
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header with icon and title */}
      <View style={styles.header}>
        <Icon name={icon} size={18} color={color} />
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      </View>
      
      {/* Amount display */}
      <Text style={[styles.amount, { color: theme.colors.text }]}>
        {amount}
        <Text style={[styles.unit, { color: theme.colors.secondaryText }]}>
          {unit}
        </Text>
      </Text>
      
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      
      {/* Goal text */}
      <Text style={[styles.goal, { color: theme.colors.secondaryText }]}>
        Goal: {goal}{unit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    width: '31%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  unit: {
    fontSize: 14,
    fontWeight: 'normal',
    marginLeft: 2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goal: {
    fontSize: 12,
  },
});

export default NutritionCard;