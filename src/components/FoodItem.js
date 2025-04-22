import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { getMealTypeIcon, getMealTypeColor } from '../assets/icons';

/**
 * A component to display a food entry in the food log
 * @param {Object} food - Food data object
 * @param {Function} onPress - Function to call when the item is pressed
 * @param {Function} onDelete - Function to call when delete button is pressed
 */
const FoodItem = ({ food, onPress, onDelete }) => {
  const theme = useTheme();
  
  if (!food) return null;
  
  // Get icon and color based on meal type
  const mealIcon = getMealTypeIcon(food.mealType);
  const mealColor = getMealTypeColor(food.mealType);
  
  // Format the time if available
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${mealColor}20` }]}>
          <Feather name={mealIcon} size={20} color={mealColor} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.foodName, { color: theme.colors.text }]}>
              {food.name}
            </Text>
            <Text style={[styles.mealType, { color: mealColor }]}>
              {food.mealType}
            </Text>
          </View>
          
          <View style={styles.details}>
            <Text style={[styles.time, { color: theme.colors.secondaryText }]}>
              {formatTime(food.timestamp)}
            </Text>
            <View style={styles.macros}>
              <Text style={[styles.macro, { color: theme.colors.protein }]}>
                P: {food.protein || 0}g
              </Text>
              <Text style={[styles.macro, { color: theme.colors.carbs }]}>
                C: {food.carbs || 0}g
              </Text>
              <Text style={[styles.macro, { color: theme.colors.fat }]}>
                F: {food.fat || 0}g
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.calorieContainer}>
          <Text style={[styles.calories, { color: theme.colors.text }]}>
            {food.calories || 0}
          </Text>
          <Text style={[styles.calorieLabel, { color: theme.colors.secondaryText }]}>
            cal
          </Text>
        </View>
        
        {onDelete && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => onDelete(food.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealType: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
  },
  macros: {
    flexDirection: 'row',
  },
  macro: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  calorieContainer: {
    marginLeft: 12,
    alignItems: 'center',
    minWidth: 50,
  },
  calories: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 10,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default FoodItem;