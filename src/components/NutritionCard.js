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
const NutritionCard = ({ title, amount = 0, unit = 'g', icon, color, goal = 100, theme }) => {
  // Calculate percentage
  const percentage = Math.min(100, Math.round((amount / goal) * 100));
  
  // Format number to 1 decimal place if needed
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    const parsed = parseFloat(num);
    return Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(1);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.amount, { color: theme.colors.text }]}>
        {formatNumber(amount)}{unit}
      </Text>
      
      <View style={[styles.progressBackground, { backgroundColor: theme.colors.surfaceHighlight }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${percentage}%`,
              backgroundColor: color
            }
          ]}
        />
      </View>
      
      <Text style={[styles.goal, { color: theme.colors.secondaryText }]}>
        Goal: {formatNumber(goal)}{unit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBackground: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goal: {
    fontSize: 10,
  },
});

export default NutritionCard;