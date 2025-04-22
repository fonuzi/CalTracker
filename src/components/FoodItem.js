import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, IconButton, useTheme } from 'react-native-paper';
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
  
  // Get meal type icon and color
  const mealTypeIcon = getMealTypeIcon(food.mealType || 'other');
  const mealTypeColor = getMealTypeColor(food.mealType || 'other');
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <TouchableOpacity onPress={() => onPress && onPress(food)}>
      <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: `${mealTypeColor}20` }]}>
            <Feather name={mealTypeIcon} size={20} color={mealTypeColor} />
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {food.name || 'Unknown Food'}
          </Text>
          
          <View style={styles.detailsContainer}>
            <Text style={[styles.mealType, { color: theme.colors.secondaryText }]}>
              {food.mealType ? food.mealType.charAt(0).toUpperCase() + food.mealType.slice(1) : 'Other'}
            </Text>
            
            <Text style={[styles.time, { color: theme.colors.secondaryText }]}>
              {formatTime(food.timestamp)}
            </Text>
          </View>
          
          <View style={styles.macrosContainer}>
            {food.protein !== undefined && (
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: theme.colors.protein }]}>
                  {Math.round(food.protein)}g
                </Text>
                <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                  Protein
                </Text>
              </View>
            )}
            
            {food.carbs !== undefined && (
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: theme.colors.carbs }]}>
                  {Math.round(food.carbs)}g
                </Text>
                <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                  Carbs
                </Text>
              </View>
            )}
            
            {food.fat !== undefined && (
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: theme.colors.fat }]}>
                  {Math.round(food.fat)}g
                </Text>
                <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                  Fat
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.caloriesContainer}>
          <Text style={[styles.calories, { color: theme.colors.text }]}>
            {food.calories || 0}
          </Text>
          <Text style={[styles.caloriesLabel, { color: theme.colors.secondaryText }]}>
            cal
          </Text>
        </View>
        
        {onDelete && (
          <IconButton
            icon="trash-2"
            size={20}
            color={theme.colors.error}
            onPress={() => onDelete(food.id)}
            style={styles.deleteButton}
          />
        )}
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  mealType: {
    fontSize: 12,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  macrosContainer: {
    flexDirection: 'row',
  },
  macroItem: {
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  macroLabel: {
    fontSize: 12,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  calories: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    fontSize: 12,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
});

export default FoodItem;