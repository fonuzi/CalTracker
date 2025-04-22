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
  // Format time from ISO string or timestamp
  const formatTime = () => {
    if (!food.timestamp) return '';
    
    const date = new Date(food.timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
  };
  
  // Get icon and color for meal type
  const mealTypeIcon = getMealTypeIcon(food.mealType);
  const mealTypeColor = getMealTypeColor(food.mealType);
  
  // Capitalize first letter of meal type
  const formatMealType = (mealType) => {
    if (!mealType) return '';
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress(food)}
      activeOpacity={0.7}
    >
      {/* Meal type indicator */}
      <View
        style={[
          styles.mealTypeIndicator,
          { backgroundColor: mealTypeColor },
        ]}
      >
        <Icon name={mealTypeIcon} size={20} color="#FFFFFF" />
      </View>
      
      {/* Food info */}
      <View style={styles.foodInfo}>
        <Text style={[styles.foodName, { color: theme.colors.text }]}>
          {food.name}
        </Text>
        
        <View style={styles.foodDetails}>
          <Text
            style={[styles.mealTypeText, { color: mealTypeColor }]}
          >
            {formatMealType(food.mealType)}
          </Text>
          <Text
            style={[styles.timeText, { color: theme.colors.secondaryText }]}
          >
            {formatTime()}
          </Text>
        </View>
      </View>
      
      {/* Nutrition summary */}
      <View style={styles.nutritionSummary}>
        <Text style={[styles.calorieText, { color: theme.colors.text }]}>
          {Math.round(food.calories)}
        </Text>
        <Text
          style={[
            styles.calorieLabel,
            { color: theme.colors.secondaryText },
          ]}
        >
          cal
        </Text>
      </View>
      
      {/* Delete button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(food)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="trash-2" size={18} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
  },
  mealTypeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  foodDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeText: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 8,
  },
  timeText: {
    fontSize: 13,
  },
  nutritionSummary: {
    alignItems: 'center',
    marginRight: 10,
  },
  calorieText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 5,
  },
});

export default FoodItem;