import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, Chip, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

/**
 * A component to display the results of food analysis from OpenAI
 * @param {Object} foodData - Food analysis data
 * @param {Function} onSave - Function to call when save button is pressed
 * @param {Function} onAdjust - Function to call when adjust button is pressed
 * @param {Function} onCancel - Function to call when cancel button is pressed
 */
const FoodAnalysisResult = ({ foodData, onSave, onAdjust, onCancel }) => {
  const theme = useTheme();
  
  if (!foodData) return null;
  
  // Format nutrition data
  const formatNutritionValue = (value, unit = 'g') => {
    if (value === undefined || value === null) return '-';
    return `${value}${unit}`;
  };
  
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {foodData.name || 'Food Analysis'}
          </Text>
          
          <Text style={[styles.calories, { color: theme.colors.primary }]}>
            {foodData.calories || 0} calories
          </Text>
        </View>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Macronutrients
        </Text>
        
        <View style={styles.macrosContainer}>
          <View style={[styles.macroItem, { borderColor: theme.colors.protein }]}>
            <Text style={[styles.macroValue, { color: theme.colors.protein }]}>
              {formatNutritionValue(foodData.protein)}
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.text }]}>
              Protein
            </Text>
          </View>
          
          <View style={[styles.macroItem, { borderColor: theme.colors.carbs }]}>
            <Text style={[styles.macroValue, { color: theme.colors.carbs }]}>
              {formatNutritionValue(foodData.carbs)}
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.text }]}>
              Carbs
            </Text>
          </View>
          
          <View style={[styles.macroItem, { borderColor: theme.colors.fat }]}>
            <Text style={[styles.macroValue, { color: theme.colors.fat }]}>
              {formatNutritionValue(foodData.fat)}
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.text }]}>
              Fat
            </Text>
          </View>
        </View>
        
        <View style={styles.nutritionDetails}>
          <View style={styles.nutritionRow}>
            <Text style={[styles.nutritionLabel, { color: theme.colors.secondaryText }]}>
              Fiber
            </Text>
            <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
              {formatNutritionValue(foodData.fiber)}
            </Text>
          </View>
          
          <View style={styles.nutritionRow}>
            <Text style={[styles.nutritionLabel, { color: theme.colors.secondaryText }]}>
              Sugar
            </Text>
            <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
              {formatNutritionValue(foodData.sugar)}
            </Text>
          </View>
          
          <View style={styles.nutritionRow}>
            <Text style={[styles.nutritionLabel, { color: theme.colors.secondaryText }]}>
              Serving Size
            </Text>
            <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
              {foodData.serving_size || '-'}
            </Text>
          </View>
        </View>
        
        {foodData.ingredients && foodData.ingredients.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Ingredients
            </Text>
            <View style={styles.chipsContainer}>
              {foodData.ingredients.map((ingredient, index) => (
                <Chip 
                  key={`ingredient-${index}`}
                  style={[styles.chip, { backgroundColor: `${theme.colors.primary}20` }]}
                  textStyle={{ color: theme.colors.text }}
                >
                  {ingredient}
                </Chip>
              ))}
            </View>
          </>
        )}
        
        {foodData.health_benefits && foodData.health_benefits.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Health Benefits
            </Text>
            {foodData.health_benefits.map((benefit, index) => (
              <View key={`benefit-${index}`} style={styles.listItem}>
                <Feather 
                  name="check-circle" 
                  size={16} 
                  color={theme.colors.success} 
                  style={styles.listIcon} 
                />
                <Text style={[styles.listText, { color: theme.colors.text }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </>
        )}
        
        {foodData.concerns && foodData.concerns.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Health Concerns
            </Text>
            {foodData.concerns.map((concern, index) => (
              <View key={`concern-${index}`} style={styles.listItem}>
                <Feather 
                  name="alert-circle" 
                  size={16} 
                  color={theme.colors.warning} 
                  style={styles.listIcon} 
                />
                <Text style={[styles.listText, { color: theme.colors.text }]}>
                  {concern}
                </Text>
              </View>
            ))}
          </>
        )}
        
        <View style={styles.methodInfo}>
          <Feather 
            name={foodData.method === 'image' ? 'camera' : 'type'} 
            size={14} 
            color={theme.colors.secondaryText} 
          />
          <Text style={[styles.methodText, { color: theme.colors.secondaryText }]}>
            {foodData.method === 'image' 
              ? 'Analyzed from image' 
              : 'Analyzed from text description'}
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.actions}>
        {onCancel && (
          <Button 
            mode="outlined" 
            onPress={onCancel}
            style={[styles.button, styles.cancelButton]}
            labelStyle={{ color: theme.colors.error }}
          >
            Cancel
          </Button>
        )}
        
        {onAdjust && (
          <Button 
            mode="outlined" 
            onPress={onAdjust}
            style={styles.button}
            icon="edit-2"
          >
            Adjust
          </Button>
        )}
        
        {onSave && (
          <Button 
            mode="contained" 
            onPress={onSave}
            style={[styles.button, styles.saveButton]}
            icon="check"
          >
            Save
          </Button>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    maxHeight: '80%',
  },
  scrollView: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calories: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  macroItem: {
    width: '30%',
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
  },
  nutritionDetails: {
    marginTop: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  nutritionLabel: {
    fontSize: 14,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  chip: {
    margin: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  methodText: {
    fontSize: 12,
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    padding: 15,
  },
  button: {
    marginLeft: 10,
  },
  saveButton: {
    minWidth: 100,
  },
  cancelButton: {
    borderColor: 'rgba(255,0,0,0.3)',
  },
});

export default FoodAnalysisResult;