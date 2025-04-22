import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { Icon } from '../assets/icons';
import { getMealTypeIcon, getMealTypeColor } from '../assets/icons';
import * as Animatable from 'react-native-animatable';
import { suggestMealTypeByTime } from '../utils/foodAnalysis';

/**
 * A component to display the results of food analysis from OpenAI
 * @param {Object} foodData - Food analysis data
 * @param {Function} onSave - Function to call when save button is pressed
 * @param {Function} onAdjust - Function to call when adjust button is pressed
 * @param {Function} onCancel - Function to call when cancel button is pressed
 */
const FoodAnalysisResult = ({ foodData, onSave, onCancel, theme }) => {
  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...foodData });
  const [selectedMealType, setSelectedMealType] = useState(
    foodData.mealType || suggestMealTypeByTime()
  );
  
  // Meal type options
  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snack' },
  ];
  
  // Format numbers with one decimal place if needed
  const formatNumber = (num) => {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return num.toFixed(1);
  };
  
  // Handle save with current data
  const handleSave = () => {
    // Include selected meal type
    const dataToSave = {
      ...foodData,
      mealType: selectedMealType,
    };
    
    onSave(dataToSave);
  };
  
  // Handle save with edited data
  const handleSaveEdited = () => {
    // Include selected meal type
    const dataToSave = {
      ...editedData,
      mealType: selectedMealType,
    };
    
    onSave(dataToSave);
  };
  
  // Toggle editing mode
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };
  
  // Update edited data field
  const updateField = (field, value) => {
    setEditedData({
      ...editedData,
      [field]: value,
    });
  };
  
  // Update numerical field (with validation)
  const updateNumericField = (field, value) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) || value === '') {
      updateField(field, value === '' ? 0 : parsedValue);
    }
  };
  
  // Icon and color for selected meal type
  const mealTypeIcon = getMealTypeIcon(selectedMealType);
  const mealTypeColor = getMealTypeColor(selectedMealType);
  
  // Render the nutrition info section (non-editing mode)
  const renderNutritionInfo = () => (
    <View style={styles.nutritionContainer}>
      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <Text
            style={[
              styles.nutritionValue,
              { color: theme.colors.text, fontSize: 28 },
            ]}
          >
            {foodData.calories}
          </Text>
          <Text
            style={[
              styles.nutritionLabel,
              { color: theme.colors.secondaryText },
            ]}
          >
            Calories
          </Text>
        </View>
      </View>
      
      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
            {formatNumber(foodData.protein)}g
          </Text>
          <Text
            style={[
              styles.nutritionLabel,
              { color: theme.colors.secondaryText },
            ]}
          >
            Protein
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
            {formatNumber(foodData.carbs)}g
          </Text>
          <Text
            style={[
              styles.nutritionLabel,
              { color: theme.colors.secondaryText },
            ]}
          >
            Carbs
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
            {formatNumber(foodData.fat)}g
          </Text>
          <Text
            style={[
              styles.nutritionLabel,
              { color: theme.colors.secondaryText },
            ]}
          >
            Fat
          </Text>
        </View>
      </View>
      
      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
            {formatNumber(foodData.fiber || 0)}g
          </Text>
          <Text
            style={[
              styles.nutritionLabel,
              { color: theme.colors.secondaryText },
            ]}
          >
            Fiber
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
            {formatNumber(foodData.sugar || 0)}g
          </Text>
          <Text
            style={[
              styles.nutritionLabel,
              { color: theme.colors.secondaryText },
            ]}
          >
            Sugar
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
            {foodData.healthScore ? foodData.healthScore + '/10' : 'N/A'}
          </Text>
          <Text
            style={[
              styles.nutritionLabel,
              { color: theme.colors.secondaryText },
            ]}
          >
            Health
          </Text>
        </View>
      </View>
    </View>
  );
  
  // Render editable nutrition fields
  const renderEditableNutrition = () => (
    <View style={styles.editableNutritionContainer}>
      <View style={styles.editRow}>
        <Text style={[styles.editLabel, { color: theme.colors.text }]}>
          Name:
        </Text>
        <TextInput
          style={[
            styles.editInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surfaceHighlight,
              borderColor: theme.colors.border,
            },
          ]}
          value={editedData.name}
          onChangeText={(text) => updateField('name', text)}
          placeholder="Food name"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
      
      <View style={styles.editRow}>
        <Text style={[styles.editLabel, { color: theme.colors.text }]}>
          Calories:
        </Text>
        <TextInput
          style={[
            styles.editInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surfaceHighlight,
              borderColor: theme.colors.border,
            },
          ]}
          value={String(editedData.calories)}
          onChangeText={(text) => updateNumericField('calories', text)}
          keyboardType="numeric"
          placeholder="Calories"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
      
      <View style={styles.editRow}>
        <Text style={[styles.editLabel, { color: theme.colors.text }]}>
          Protein (g):
        </Text>
        <TextInput
          style={[
            styles.editInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surfaceHighlight,
              borderColor: theme.colors.border,
            },
          ]}
          value={String(editedData.protein)}
          onChangeText={(text) => updateNumericField('protein', text)}
          keyboardType="numeric"
          placeholder="Protein"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
      
      <View style={styles.editRow}>
        <Text style={[styles.editLabel, { color: theme.colors.text }]}>
          Carbs (g):
        </Text>
        <TextInput
          style={[
            styles.editInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surfaceHighlight,
              borderColor: theme.colors.border,
            },
          ]}
          value={String(editedData.carbs)}
          onChangeText={(text) => updateNumericField('carbs', text)}
          keyboardType="numeric"
          placeholder="Carbs"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
      
      <View style={styles.editRow}>
        <Text style={[styles.editLabel, { color: theme.colors.text }]}>
          Fat (g):
        </Text>
        <TextInput
          style={[
            styles.editInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surfaceHighlight,
              borderColor: theme.colors.border,
            },
          ]}
          value={String(editedData.fat)}
          onChangeText={(text) => updateNumericField('fat', text)}
          keyboardType="numeric"
          placeholder="Fat"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
      
      <View style={styles.editRow}>
        <Text style={[styles.editLabel, { color: theme.colors.text }]}>
          Fiber (g):
        </Text>
        <TextInput
          style={[
            styles.editInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surfaceHighlight,
              borderColor: theme.colors.border,
            },
          ]}
          value={String(editedData.fiber || 0)}
          onChangeText={(text) => updateNumericField('fiber', text)}
          keyboardType="numeric"
          placeholder="Fiber"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
      
      <View style={styles.editRow}>
        <Text style={[styles.editLabel, { color: theme.colors.text }]}>
          Sugar (g):
        </Text>
        <TextInput
          style={[
            styles.editInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surfaceHighlight,
              borderColor: theme.colors.border,
            },
          ]}
          value={String(editedData.sugar || 0)}
          onChangeText={(text) => updateNumericField('sugar', text)}
          keyboardType="numeric"
          placeholder="Sugar"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
    </View>
  );
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onCancel}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Food Analysis
        </Text>
        <TouchableOpacity style={styles.editButton} onPress={toggleEditing}>
          <Icon
            name={isEditing ? 'x' : 'edit-2'}
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
      
      {/* Food Name */}
      <Animatable.View animation="fadeIn" duration={600}>
        <Text style={[styles.foodName, { color: theme.colors.text }]}>
          {isEditing ? editedData.name : foodData.name}
        </Text>
      </Animatable.View>
      
      {/* Nutrition Info */}
      <Animatable.View animation="fadeIn" duration={600} delay={100}>
        {isEditing ? renderEditableNutrition() : renderNutritionInfo()}
      </Animatable.View>
      
      {/* Description */}
      {!isEditing && foodData.description && (
        <Animatable.View animation="fadeIn" duration={600} delay={200}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Description
          </Text>
          <Text
            style={[
              styles.descriptionText,
              { color: theme.colors.secondaryText },
            ]}
          >
            {foodData.description}
          </Text>
        </Animatable.View>
      )}
      
      {/* Health Tips */}
      {!isEditing && foodData.tips && (
        <Animatable.View animation="fadeIn" duration={600} delay={300}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Health Tips
          </Text>
          <View
            style={[
              styles.tipsContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Icon
              name="info"
              size={20}
              color={theme.colors.primary}
              style={styles.tipsIcon}
            />
            <Text
              style={[styles.tipsText, { color: theme.colors.secondaryText }]}
            >
              {foodData.tips}
            </Text>
          </View>
        </Animatable.View>
      )}
      
      {/* Meal Type Selection */}
      <Animatable.View animation="fadeIn" duration={600} delay={400}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Meal Type
        </Text>
        <View style={styles.mealTypeContainer}>
          {mealTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.mealTypeButton,
                {
                  backgroundColor:
                    selectedMealType === type.id
                      ? getMealTypeColor(type.id) + '20'
                      : theme.colors.surface,
                  borderColor:
                    selectedMealType === type.id
                      ? getMealTypeColor(type.id)
                      : theme.colors.border,
                },
              ]}
              onPress={() => setSelectedMealType(type.id)}
            >
              <Icon
                name={getMealTypeIcon(type.id)}
                size={18}
                color={
                  selectedMealType === type.id
                    ? getMealTypeColor(type.id)
                    : theme.colors.text
                }
                style={styles.mealTypeIcon}
              />
              <Text
                style={[
                  styles.mealTypeText,
                  {
                    color:
                      selectedMealType === type.id
                        ? getMealTypeColor(type.id)
                        : theme.colors.text,
                  },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animatable.View>
      
      {/* Action Buttons */}
      <Animatable.View animation="fadeIn" duration={600} delay={500}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={isEditing ? handleSaveEdited : handleSave}
        >
          <Icon name="check" size={20} color="#FFFFFF" style={styles.saveButtonIcon} />
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Save Changes' : 'Add to Food Log'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.cancelButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  nutritionContainer: {
    marginBottom: 24,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  tipsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: '48%',
    marginBottom: 10,
  },
  mealTypeIcon: {
    marginRight: 8,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  editableNutritionContainer: {
    marginBottom: 24,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  editLabel: {
    width: 100,
    fontSize: 16,
    fontWeight: '500',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});

export default FoodAnalysisResult;