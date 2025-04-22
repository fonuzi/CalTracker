import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

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
  // Calculate percentage of goal consumed (capped at 100%)
  const percentage = Math.min(100, Math.round((amount / goal) * 100));
  
  return (
    <Animatable.View
      animation="fadeIn"
      duration={1000}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name={icon} size={18} color={color} style={styles.icon} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.amount, { color: theme.colors.text }]}>
          {amount}{unit} / {goal}{unit}
        </Text>
      </View>
      
      <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border }]}>
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[
            styles.progressBar,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      
      <Text style={[styles.percentage, { color: theme.colors.secondaryText }]}>
        {percentage}%
      </Text>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    textAlign: 'right',
  },
});

export default NutritionCard;