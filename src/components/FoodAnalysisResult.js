import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput
} from 'react-native';
import { Icon, getNutrientIcon, getNutrientColor } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

/**
 * A component to display the results of food analysis from OpenAI
 * @param {Object} foodData - Food analysis data
 * @param {Function} onSave - Function to call when save button is pressed
 * @param {Function} onAdjust - Function to call when adjust button is pressed
 * @param {Function} onCancel - Function to call when cancel button is pressed
 */
const FoodAnalysisResult = ({ foodData, onSave, onAdjust, onCancel, theme }) => {
  // Local state for editable fields
  const [editableFood, setEditableFood] = useState({ ...foodData });
  const [isEditing, setIsEditing] = useState(false);
  
  // Update a specific field
  const updateField = (field, value) => {
    setEditableFood(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Format number to 1 decimal place if needed
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    const parsed = parseFloat(num);
    return Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(1);
  };
  
  // Calculate calories from macros
  const calculateCalories = (protein, carbs, fat) => {
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    return Math.round((p * 4) + (c * 4) + (f * 9));
  };
  
  // Update calories when macros change
  const updateCaloriesFromMacros = () => {
    const calories = calculateCalories(
      editableFood.protein, 
      editableFood.carbs, 
      editableFood.fat
    );
    updateField('calories', calories);
  };
  
  // Handle save button press
  const handleSave = () => {
    // Make sure calories are updated before saving
    if (isEditing) {
      updateCaloriesFromMacros();
      setIsEditing(false);
    }
    onSave(editableFood);
  };
  
  // Format item for display (add units, etc.)
  const formatItem = (value, unit = '') => {
    if (value === undefined || value === null) return '-';
    return `${formatNumber(value)}${unit}`;
  };
  
  // Render edit button and/or editing UI
  const renderEditOption = (label, field, unit = '', isNumeric = true) => {
    const value = editableFood[field];
    
    return (
      <View style={styles.nutrientRow}>
        <Text style={[styles.nutrientLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
        
        {isEditing ? (
          <TextInput
            style={[
              styles.editInput,
              { 
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceHighlight,
              }
            ]}
            value={value ? value.toString() : ''}
            onChangeText={(text) => {
              const newValue = isNumeric ? parseFloat(text) || 0 : text;
              updateField(field, newValue);
            }}
            keyboardType={isNumeric ? 'numeric' : 'default'}
            onEndEditing={() => {
              if (field === 'protein' || field === 'carbs' || field === 'fat') {
                updateCaloriesFromMacros();
              }
            }}
          />
        ) : (
          <Text style={[styles.nutrientValue, { color: theme.colors.text }]}>
            {formatItem(value, unit)}
          </Text>
        )}
      </View>
    );
  };
  
  // Get health score color
  const getHealthScoreColor = (score) => {
    if (score >= 8) return theme.colors.success;
    if (score >= 5) return theme.colors.warning;
    return theme.colors.error;
  };
  
  return (
    <Animatable.View 
      animation="fadeIn" 
      duration={500}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header with food name */}
        <View style={styles.header}>
          {isEditing ? (
            <TextInput
              style={[
                styles.nameInput,
                { 
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceHighlight,
                }
              ]}
              value={editableFood.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Food name"
              placeholderTextColor={theme.colors.placeholder}
            />
          ) : (
            <Text style={[styles.foodName, { color: theme.colors.text }]}>
              {editableFood.name || 'Food Item'}
            </Text>
          )}
          
          {!isEditing && (
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: theme.colors.surfaceHighlight }]}
              onPress={() => setIsEditing(true)}
            >
              <Icon name="edit-2" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Primary macros */}
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.text }]}>
              {formatItem(editableFood.calories)}
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Calories
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={styles.macroIconContainer}>
              <Icon 
                name={getNutrientIcon('protein')} 
                size={14} 
                color={getNutrientColor('protein')} 
              />
            </View>
            <Text style={[styles.macroValue, { color: theme.colors.text }]}>
              {formatItem(editableFood.protein, 'g')}
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Protein
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={styles.macroIconContainer}>
              <Icon 
                name={getNutrientIcon('carbs')} 
                size={14} 
                color={getNutrientColor('carbs')} 
              />
            </View>
            <Text style={[styles.macroValue, { color: theme.colors.text }]}>
              {formatItem(editableFood.carbs, 'g')}
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Carbs
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={styles.macroIconContainer}>
              <Icon 
                name={getNutrientIcon('fat')} 
                size={14} 
                color={getNutrientColor('fat')} 
              />
            </View>
            <Text style={[styles.macroValue, { color: theme.colors.text }]}>
              {formatItem(editableFood.fat, 'g')}
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Fat
            </Text>
          </View>
        </View>
        
        {/* Health score */}
        <View style={styles.healthScoreContainer}>
          <Text style={[styles.healthScoreLabel, { color: theme.colors.secondaryText }]}>
            Health Score
          </Text>
          <View style={styles.healthScoreRow}>
            <View 
              style={[
                styles.healthScoreCircle, 
                { backgroundColor: getHealthScoreColor(editableFood.healthScore) }
              ]}
            >
              <Text style={styles.healthScoreValue}>
                {editableFood.healthScore || 0}
              </Text>
            </View>
            <Text style={[styles.healthScoreDesc, { color: theme.colors.text }]}>
              {editableFood.healthScore >= 8 ? 'Excellent choice!' : 
               editableFood.healthScore >= 5 ? 'Good choice' : 
               'Could be healthier'}
            </Text>
          </View>
        </View>
        
        {/* Detailed nutrition */}
        <View style={styles.detailedSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Nutrition Details
          </Text>
          
          {renderEditOption('Calories', 'calories', ' kcal')}
          {renderEditOption('Protein', 'protein', 'g')}
          {renderEditOption('Carbs', 'carbs', 'g')}
          {renderEditOption('Fat', 'fat', 'g')}
          {renderEditOption('Fiber', 'fiber', 'g')}
          {renderEditOption('Sugar', 'sugar', 'g')}
          
          <View style={styles.divider} />
          
          {renderEditOption('Quantity', 'quantity', '', false)}
          {renderEditOption('Meal Type', 'mealType', '', false)}
        </View>
        
        {/* Ingredients */}
        <View style={styles.detailedSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Ingredients
          </Text>
          
          {isEditing ? (
            <TextInput
              style={[
                styles.ingredientsInput,
                { 
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceHighlight,
                }
              ]}
              value={
                Array.isArray(editableFood.ingredients) 
                  ? editableFood.ingredients.join(', ') 
                  : ''
              }
              onChangeText={(text) => {
                // Convert comma-separated text to array
                const ingredients = text.split(',').map(item => item.trim()).filter(Boolean);
                updateField('ingredients', ingredients);
              }}
              placeholder="e.g. Chicken, Rice, Broccoli"
              placeholderTextColor={theme.colors.placeholder}
              multiline
            />
          ) : (
            <View style={styles.ingredientsList}>
              {Array.isArray(editableFood.ingredients) && editableFood.ingredients.map((ingredient, index) => (
                <View 
                  key={index}
                  style={[
                    styles.ingredientTag,
                    { backgroundColor: theme.colors.surfaceHighlight }
                  ]}
                >
                  <Text style={[styles.ingredientText, { color: theme.colors.text }]}>
                    {ingredient}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={() => {
                setEditableFood({ ...foodData });
                setIsEditing(false);
              }}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.adjustButton, { borderColor: theme.colors.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
                Adjust
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                Add to Log
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    margin: 12,
    marginTop: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  foodName: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  macroItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  macroIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 12,
  },
  healthScoreContainer: {
    marginBottom: 20,
  },
  healthScoreLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  healthScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  healthScoreValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  healthScoreDesc: {
    fontSize: 16,
  },
  detailedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutrientLabel: {
    fontSize: 16,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  editInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 6,
    padding: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 12,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
  },
  ingredientsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  adjustButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  saveButton: {
    borderWidth: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
});

export default FoodAnalysisResult;