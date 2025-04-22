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
const NutritionCard = ({
  title,
  amount = 0,
  unit = 'g',
  icon,
  color,
  goal = 100,
  theme,
}) => {
  // Calculate percentage
  const percentage = Math.min(100, Math.round((amount / goal) * 100));
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
            {amount} {unit} of {goal} {unit}
          </Text>
        </View>
        
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={18} color={color} />
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: theme.colors.border, width: '100%' },
          ]}
        />
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: color,
              width: `${percentage}%`,
            },
          ]}
        />
      </View>
      
      <Text style={[styles.percentageText, { color: theme.colors.secondaryText }]}>
        {percentage}% of daily goal
      </Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleContainer: {
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
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    left: 0,
    top: 0,
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    left: 0,
    top: 0,
  },
  percentageText: {
    fontSize: 12,
    textAlign: 'right',
  },
});

export default NutritionCard;