import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme, ProgressBar } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

/**
 * A component to display a specific nutrient value and goal
 * @param {string} title - Nutrient name (e.g., "Protein", "Carbs")
 * @param {number} amount - Amount consumed
 * @param {string} unit - Unit of measurement (e.g., "g")
 * @param {string} icon - Feather icon name
 * @param {string} color - Color for the icon and progress bar
 * @param {number} goal - Goal amount for this nutrient
 */
const NutritionCard = ({ 
  title, 
  amount = 0, 
  unit = 'g', 
  icon = 'circle', 
  color = '#8B5CF6',
  goal = 0
}) => {
  const theme = useTheme();
  
  // Calculate percentage of goal
  const percentage = goal > 0 ? Math.min(1, amount / goal) : 0;
  
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Feather name={icon} size={16} color={color} style={styles.icon} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
        </View>
        
        <Text style={[styles.percentage, { color }]}>
          {goal > 0 ? `${Math.round(percentage * 100)}%` : '--'}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: theme.colors.text }]}>
          {amount}
        </Text>
        <Text style={[styles.unit, { color: theme.colors.secondaryText }]}>
          {unit}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={percentage} 
          color={color} 
          style={styles.progressBar} 
        />
        
        <Text style={[styles.goal, { color: theme.colors.secondaryText }]}>
          {goal > 0 ? `Goal: ${goal}${unit}` : 'No goal set'}
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  percentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 2,
  },
  unit: {
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  goal: {
    fontSize: 12,
    textAlign: 'right',
  },
});

export default NutritionCard;