import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../assets/icons';
import { getMealTypeIcon, getMealTypeColor } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

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
  
  // Format the timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Animatable.View 
      animation="fadeIn"
      duration={500}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <TouchableOpacity 
        style={styles.contentContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View 
          style={[
            styles.iconContainer, 
            { backgroundColor: mealTypeColor + '20' }
          ]}
        >
          <Icon name={mealTypeIcon} size={16} color={mealTypeColor} />
        </View>
        
        <View style={styles.detailsContainer}>
          <Text 
            style={[styles.foodName, { color: theme.colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {food.name}
          </Text>
          
          <View style={styles.macrosContainer}>
            <Text style={[styles.mealType, { color: theme.colors.secondaryText }]}>
              {food.mealType?.charAt(0).toUpperCase() + food.mealType?.slice(1)} • {formatTime(food.timestamp)}
            </Text>
            
            <View style={styles.macrosRow}>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: theme.colors.protein }]}>
                  {food.protein || 0}g
                </Text>
                <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                  Protein
                </Text>
              </View>
              
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: theme.colors.carbs }]}>
                  {food.carbs || 0}g
                </Text>
                <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                  Carbs
                </Text>
              </View>
              
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: theme.colors.fat }]}>
                  {food.fat || 0}g
                </Text>
                <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                  Fat
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.caloriesContainer}>
          <Text style={[styles.calories, { color: theme.colors.text }]}>
            {food.calories || 0}
          </Text>
          <Text style={[styles.caloriesUnit, { color: theme.colors.secondaryText }]}>
            kcal
          </Text>
        </View>
      </TouchableOpacity>
      
      {onDelete && (
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: theme.colors.error + '20' }]}
          onPress={() => onDelete(food.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="trash-2" size={16} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  contentContainer: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    paddingRight: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  macrosContainer: {
    
  },
  mealType: {
    fontSize: 12,
    marginBottom: 4,
  },
  macrosRow: {
    flexDirection: 'row',
  },
  macroItem: {
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  macroLabel: {
    fontSize: 12,
  },
  caloriesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calories: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  caloriesUnit: {
    fontSize: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FoodItem;