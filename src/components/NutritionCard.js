import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
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
  icon, 
  color = '#6C63FF', 
  goal = 0
}) => {
  const theme = useTheme();
  
  // Calculate percentage towards goal
  const percentage = goal > 0 ? Math.min(100, Math.round((amount / goal) * 100)) : 0;
  
  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Feather name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
      </View>
      
      <Text style={[styles.amount, { color: theme.colors.text }]}>
        {amount}{unit}
      </Text>
      
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { backgroundColor: `${color}30` }
          ]}
        >
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: color,
                width: `${percentage}%` 
              }
            ]} 
          />
        </View>
        <Text style={[styles.goalText, { color: theme.colors.secondaryText }]}>
          {goal > 0 ? `${percentage}% of ${goal}${unit}` : 'No goal set'}
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    margin: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  progressContainer: {
    marginTop: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalText: {
    fontSize: 10,
  },
});

export default NutritionCard;