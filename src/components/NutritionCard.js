import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
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
const NutritionCard = ({ 
  title, 
  amount = 0, 
  unit = 'g', 
  icon, 
  color, 
  goal = 0,
  theme 
}) => {
  // Calculate percentage of goal reached
  const percentage = goal > 0 ? Math.min(100, Math.round((amount / goal) * 100)) : 0;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View 
            style={[
              styles.iconContainer, 
              { backgroundColor: color + '20' } // Add transparency to the color
            ]}
          >
            <Icon name={icon} size={16} color={color} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: theme.colors.text }]}>
            {amount}
            <Text style={[styles.unit, { color: theme.colors.secondaryText }]}>{unit}</Text>
          </Text>
          <Text style={[styles.goal, { color: theme.colors.secondaryText }]}>
            / {goal}{unit}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBackground, 
            { backgroundColor: theme.colors.surfaceHighlight }
          ]}
        >
          <Animatable.View 
            animation="fadeIn" 
            duration={500}
            style={[
              styles.progressFill, 
              { 
                backgroundColor: color,
                width: `${percentage}%` 
              }
            ]} 
          />
        </View>
        
        <Text style={[styles.percentage, { color: theme.colors.secondaryText }]}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  unit: {
    fontSize: 14,
    fontWeight: 'normal',
    marginLeft: 1,
  },
  goal: {
    fontSize: 14,
    marginLeft: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    flex: 1,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    width: 35,
    textAlign: 'right',
  },
});

export default NutritionCard;