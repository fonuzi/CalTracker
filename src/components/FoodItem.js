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
  // Get the appropriate icon and color for the meal type
  const mealTypeIcon = getMealTypeIcon(food.mealType);
  const mealTypeColor = getMealTypeColor(food.mealType);
  
  // Format the time (assuming timestamp is in ISO format)
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress && onPress(food)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: mealTypeColor + '20' },
          ]}
        >
          <Icon name={mealTypeIcon} size={20} color={mealTypeColor} />
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.foodName, { color: theme.colors.text }]}>
              {food.name}
            </Text>
            <TouchableOpacity
              onPress={() => onDelete && onDelete(food)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="trash-2" size={16} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={[styles.mealType, { color: theme.colors.secondaryText }]}>
              {food.mealType || 'Meal'} · {formatTime(food.timestamp)}
            </Text>
            <Text style={[styles.calories, { color: theme.colors.primary }]}>
              {food.calories} cal
            </Text>
          </View>
          
          <View style={styles.macrosRow}>
            <Text style={[styles.macroText, { color: theme.colors.secondaryText }]}>
              P: {food.protein}g
            </Text>
            <Text style={[styles.macroText, { color: theme.colors.secondaryText }]}>
              C: {food.carbs}g
            </Text>
            <Text style={[styles.macroText, { color: theme.colors.secondaryText }]}>
              F: {food.fat}g
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealType: {
    fontSize: 12,
  },
  calories: {
    fontSize: 14,
    fontWeight: '600',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  macroText: {
    fontSize: 12,
  },
});

export default FoodItem;