import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

/**
 * A component to display the results of food analysis from OpenAI
 * @param {Object} foodData - Food analysis data
 * @param {Function} onSave - Function to call when save button is pressed
 * @param {Function} onAdjust - Function to call when adjust button is pressed
 * @param {Function} onCancel - Function to call when cancel button is pressed
 */
const FoodAnalysisResult = ({ 
  foodData, 
  onSave, 
  onCancel, 
  theme,
  editable = true,
}) => {
  // State for editable values
  const [editedFoodData, setEditedFoodData] = useState({
    ...foodData,
  });
  
  // Function to handle changes to the food data
  const handleChange = (field, value) => {
    setEditedFoodData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle numeric input fields
  const handleNumericChange = (field, value) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    handleChange(field, numericValue);
  };
  
  // Function to handle save button press
  const handleSave = () => {
    // Convert string numeric values to actual numbers
    const processedData = {
      ...editedFoodData,
      calories: parseFloat(editedFoodData.calories) || 0,
      protein: parseFloat(editedFoodData.protein) || 0,
      carbs: parseFloat(editedFoodData.carbs) || 0,
      fat: parseFloat(editedFoodData.fat) || 0,
      fiber: parseFloat(editedFoodData.fiber) || 0,
      sugar: parseFloat(editedFoodData.sugar) || 0,
    };
    
    if (onSave) {
      onSave(processedData);
    }
  };
  
  // Render nutritional values in a list
  const renderNutritionList = () => {
    const nutritionItems = [
      { label: 'Calories', value: editedFoodData.calories, unit: 'cal', field: 'calories' },
      { label: 'Protein', value: editedFoodData.protein, unit: 'g', field: 'protein' },
      { label: 'Carbs', value: editedFoodData.carbs, unit: 'g', field: 'carbs' },
      { label: 'Fat', value: editedFoodData.fat, unit: 'g', field: 'fat' },
      { label: 'Fiber', value: editedFoodData.fiber, unit: 'g', field: 'fiber' },
      { label: 'Sugar', value: editedFoodData.sugar, unit: 'g', field: 'sugar' },
    ];
    
    return nutritionItems.map((item, index) => (
      <View key={index} style={styles.nutritionItem}>
        <Text style={[styles.nutritionLabel, { color: theme.colors.text }]}>
          {item.label}
        </Text>
        <View style={styles.nutritionValueContainer}>
          {editable ? (
            <TextInput
              style={[styles.nutritionInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={item.value.toString()}
              onChangeText={(text) => handleNumericChange(item.field, text)}
              keyboardType="numeric"
              selectTextOnFocus
            />
          ) : (
            <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
              {item.value}
            </Text>
          )}
          <Text style={[styles.nutritionUnit, { color: theme.colors.secondaryText }]}>
            {item.unit}
          </Text>
        </View>
      </View>
    ));
  };
  
  // Render lists (ingredients, health benefits, concerns)
  const renderList = (title, items) => {
    if (!items || items.length === 0) return null;
    
    return (
      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: theme.colors.text }]}>{title}</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={[styles.listItemText, { color: theme.colors.secondaryText }]}>
              • {item}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  
  return (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Food Analysis
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
            Powered by AI
          </Text>
        </View>
        <TouchableOpacity onPress={onCancel} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Icon name="x" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.foodInfoContainer}>
          <Text style={[styles.foodInfoLabel, { color: theme.colors.secondaryText }]}>
            Food Name
          </Text>
          {editable ? (
            <TextInput
              style={[styles.foodNameInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={editedFoodData.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Enter food name"
              placeholderTextColor={theme.colors.placeholder}
            />
          ) : (
            <Text style={[styles.foodName, { color: theme.colors.text }]}>
              {editedFoodData.name}
            </Text>
          )}
        </View>
        
        <View style={styles.foodInfoContainer}>
          <Text style={[styles.foodInfoLabel, { color: theme.colors.secondaryText }]}>
            Serving Size
          </Text>
          {editable ? (
            <TextInput
              style={[styles.servingSizeInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={editedFoodData.serving_size}
              onChangeText={(text) => handleChange('serving_size', text)}
              placeholder="Enter serving size"
              placeholderTextColor={theme.colors.placeholder}
            />
          ) : (
            <Text style={[styles.servingSize, { color: theme.colors.text }]}>
              {editedFoodData.serving_size}
            </Text>
          )}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.nutritionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Nutrition Facts
          </Text>
          {renderNutritionList()}
        </View>
        
        <View style={styles.divider} />
        
        {renderList('Ingredients', editedFoodData.ingredients)}
        
        {editedFoodData.ingredients && editedFoodData.ingredients.length > 0 && (
          <View style={styles.divider} />
        )}
        
        {renderList('Health Benefits', editedFoodData.health_benefits)}
        
        {editedFoodData.health_benefits && editedFoodData.health_benefits.length > 0 && (
          <View style={styles.divider} />
        )}
        
        {renderList('Potential Concerns', editedFoodData.concerns)}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        {editable && (
          <TouchableOpacity
            style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
  },
  foodInfoContainer: {
    marginBottom: 15,
  },
  foodInfoLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  foodNameInput: {
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
  },
  servingSizeInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  servingSize: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 15,
  },
  nutritionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nutritionLabel: {
    fontSize: 16,
  },
  nutritionValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionInput: {
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  nutritionUnit: {
    fontSize: 14,
    marginLeft: 4,
  },
  listContainer: {
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  listItem: {
    marginBottom: 5,
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    marginRight: 10,
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FoodAnalysisResult;