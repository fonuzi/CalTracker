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
  // Format time from timestamp (e.g., "8:30 AM")
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Get icon and color for meal type
  const mealTypeIcon = getMealTypeIcon(food.mealType);
  const mealTypeColor = getMealTypeColor(food.mealType);
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress(food)}
      activeOpacity={0.7}
    >
      {/* Left icon for meal type */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: mealTypeColor + '20' }, // 20% opacity
        ]}
      >
        <Icon name={mealTypeIcon} size={18} color={mealTypeColor} />
      </View>
      
      {/* Food info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.foodName, { color: theme.colors.text }]}>
          {food.name}
        </Text>
        <Text style={[styles.foodDetails, { color: theme.colors.secondaryText }]}>
          {food.calories} cal • P: {Math.round(food.protein)}g • C: {Math.round(food.carbs)}g • F: {Math.round(food.fat)}g
        </Text>
      </View>
      
      {/* Right section with time and delete button */}
      <View style={styles.rightContainer}>
        <Text style={[styles.timeText, { color: theme.colors.secondaryText }]}>
          {formatTime(food.timestamp)}
        </Text>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(food)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon name="trash-2" size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
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
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 12,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    marginBottom: 6,
  },
  deleteButton: {
    padding: 4,
  },
});

export default FoodItem;