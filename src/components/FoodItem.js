import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../assets/icons';
import { getMealTypeIcon, getMealTypeColor } from '../assets/icons';

/**
 * A component to display a food entry in the food log
 * @param {Object} food - Food data object
 * @param {Function} onPress - Function to call when the item is pressed
 * @param {Function} onDelete - Function to call when delete button is pressed
 */
const FoodItem = ({ food, onPress, onDelete, theme }) => {
  if (!food) return null;
  
  // Format macros for display
  const formatMacro = (value) => {
    if (value === undefined || value === null) return '-';
    return Math.round(value) + 'g';
  };
  
  // Get meal type icon and color
  const mealTypeIcon = getMealTypeIcon(food.mealType);
  const mealTypeColor = getMealTypeColor(food.mealType);
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Meal type icon */}
      <View style={[styles.iconContainer, { backgroundColor: mealTypeColor + '20' }]}>
        <Icon name={mealTypeIcon} size={24} color={mealTypeColor} />
      </View>
      
      {/* Food details */}
      <View style={styles.detailsContainer}>
        <Text style={[styles.foodName, { color: theme.colors.text }]}>
          {food.name}
        </Text>
        
        <View style={styles.macrosContainer}>
          <Text style={[styles.caloriesText, { color: theme.colors.text }]}>
            {Math.round(food.calories || 0)} kcal
          </Text>
          
          <Text style={[styles.macroText, { color: theme.colors.secondaryText }]}>
            P: {formatMacro(food.protein)}
          </Text>
          
          <Text style={[styles.macroText, { color: theme.colors.secondaryText }]}>
            C: {formatMacro(food.carbs)}
          </Text>
          
          <Text style={[styles.macroText, { color: theme.colors.secondaryText }]}>
            F: {formatMacro(food.fat)}
          </Text>
        </View>
        
        {food.quantity && (
          <Text style={[styles.quantityText, { color: theme.colors.secondaryText }]}>
            {food.quantity}
          </Text>
        )}
      </View>
      
      {/* Delete button */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(food.id)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon name="trash-2" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
  },
  macroText: {
    fontSize: 12,
    marginRight: 8,
  },
  quantityText: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
});

export default FoodItem;