import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';
import { calculateMacroPercentages } from '../utils/foodAnalysis';
import { getNutrientColor } from '../assets/icons';

/**
 * A component to display the results of food analysis from OpenAI
 * @param {Object} foodData - Food analysis data
 * @param {Function} onSave - Function to call when save button is pressed
 * @param {Function} onAdjust - Function to call when adjust button is pressed
 * @param {Function} onCancel - Function to call when cancel button is pressed
 */
const FoodAnalysisResult = ({ foodData, onSave, onAdjust, onCancel, theme }) => {
  // Calculate macro percentages
  const macroPercentages = calculateMacroPercentages(
    foodData.protein || 0,
    foodData.carbs || 0,
    foodData.fat || 0
  );
  
  // Get nutrient colors from theme
  const proteinColor = theme.colors.protein || getNutrientColor('protein');
  const carbsColor = theme.colors.carbs || getNutrientColor('carbs');
  const fatColor = theme.colors.fat || getNutrientColor('fat');
  
  return (
    <Animatable.View 
      animation="fadeInUp"
      duration={500}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Food Analysis
        </Text>
        
        <TouchableOpacity
          onPress={onCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="x" size={24} color={theme.colors.secondaryText} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.foodInfoContainer}>
          <Text style={[styles.foodName, { color: theme.colors.text }]}>
            {foodData.name || 'Unknown Food'}
          </Text>
          
          <View style={styles.calorieContainer}>
            <Text style={[styles.calorieCount, { color: theme.colors.text }]}>
              {foodData.calories || 0}
            </Text>
            <Text style={[styles.calorieUnit, { color: theme.colors.secondaryText }]}>
              kcal
            </Text>
          </View>
        </View>
        
        {/* Macro distribution chart */}
        <View style={styles.macroChart}>
          <View style={styles.macroBarContainer}>
            <View 
              style={[
                styles.macroBarSegment,
                { 
                  backgroundColor: proteinColor,
                  width: `${macroPercentages.protein}%`,
                }
              ]}
            />
            <View 
              style={[
                styles.macroBarSegment,
                { 
                  backgroundColor: carbsColor,
                  width: `${macroPercentages.carbs}%`,
                }
              ]}
            />
            <View 
              style={[
                styles.macroBarSegment,
                { 
                  backgroundColor: fatColor,
                  width: `${macroPercentages.fat}%`,
                }
              ]}
            />
          </View>
          
          <View style={styles.macroLegend}>
            <View style={styles.macroLegendItem}>
              <View style={[styles.macroLegendColor, { backgroundColor: proteinColor }]} />
              <Text style={[styles.macroLegendText, { color: theme.colors.secondaryText }]}>
                Protein {macroPercentages.protein}%
              </Text>
            </View>
            
            <View style={styles.macroLegendItem}>
              <View style={[styles.macroLegendColor, { backgroundColor: carbsColor }]} />
              <Text style={[styles.macroLegendText, { color: theme.colors.secondaryText }]}>
                Carbs {macroPercentages.carbs}%
              </Text>
            </View>
            
            <View style={styles.macroLegendItem}>
              <View style={[styles.macroLegendColor, { backgroundColor: fatColor }]} />
              <Text style={[styles.macroLegendText, { color: theme.colors.secondaryText }]}>
                Fat {macroPercentages.fat}%
              </Text>
            </View>
          </View>
        </View>
        
        {/* Nutrients */}
        <View style={styles.nutrientSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Nutrients
          </Text>
          
          <View style={styles.nutrientGrid}>
            <View style={styles.nutrientItem}>
              <Text style={[styles.nutrientValue, { color: proteinColor }]}>
                {foodData.protein || 0}g
              </Text>
              <Text style={[styles.nutrientLabel, { color: theme.colors.secondaryText }]}>
                Protein
              </Text>
            </View>
            
            <View style={styles.nutrientItem}>
              <Text style={[styles.nutrientValue, { color: carbsColor }]}>
                {foodData.carbs || 0}g
              </Text>
              <Text style={[styles.nutrientLabel, { color: theme.colors.secondaryText }]}>
                Carbs
              </Text>
            </View>
            
            <View style={styles.nutrientItem}>
              <Text style={[styles.nutrientValue, { color: fatColor }]}>
                {foodData.fat || 0}g
              </Text>
              <Text style={[styles.nutrientLabel, { color: theme.colors.secondaryText }]}>
                Fat
              </Text>
            </View>
            
            <View style={styles.nutrientItem}>
              <Text style={[styles.nutrientValue, { color: theme.colors.success }]}>
                {foodData.fiber || 0}g
              </Text>
              <Text style={[styles.nutrientLabel, { color: theme.colors.secondaryText }]}>
                Fiber
              </Text>
            </View>
            
            <View style={styles.nutrientItem}>
              <Text style={[styles.nutrientValue, { color: theme.colors.warning }]}>
                {foodData.sugar || 0}g
              </Text>
              <Text style={[styles.nutrientLabel, { color: theme.colors.secondaryText }]}>
                Sugar
              </Text>
            </View>
            
            <View style={styles.nutrientItem}>
              <Text style={[styles.nutrientValue, { color: theme.colors.secondary }]}>
                {foodData.healthScore || 0}/10
              </Text>
              <Text style={[styles.nutrientLabel, { color: theme.colors.secondaryText }]}>
                Health
              </Text>
            </View>
          </View>
        </View>
        
        {/* Description */}
        {foodData.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
              {foodData.description}
            </Text>
          </View>
        )}
        
        {/* Tips */}
        {foodData.tips && (
          <View style={styles.tipsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Tips
            </Text>
            <Text style={[styles.tips, { color: theme.colors.secondaryText }]}>
              {foodData.tips}
            </Text>
          </View>
        )}
        
        {/* Meal Type */}
        <View style={styles.mealTypeContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Meal Type
          </Text>
          
          <View style={[styles.mealTypeSelector, { backgroundColor: theme.colors.surfaceHighlight }]}>
            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.mealTypeOption,
                  { 
                    backgroundColor: 
                      foodData.mealType?.toLowerCase() === meal.toLowerCase() 
                        ? theme.colors.primary 
                        : 'transparent' 
                  }
                ]}
                onPress={() => {
                  if (onAdjust) {
                    onAdjust({
                      ...foodData,
                      mealType: meal.toLowerCase(),
                    });
                  }
                }}
              >
                <Text 
                  style={[
                    styles.mealTypeText, 
                    { 
                      color: foodData.mealType?.toLowerCase() === meal.toLowerCase() 
                        ? '#FFFFFF' 
                        : theme.colors.text 
                    }
                  ]}
                >
                  {meal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Actions */}
      <View 
        style={[
          styles.actionContainer,
          { borderTopColor: theme.colors.border }
        ]}
      >
        <TouchableOpacity
          style={[styles.adjustButton, { backgroundColor: theme.colors.surfaceHighlight }]}
          onPress={() => onAdjust && onAdjust(foodData)}
        >
          <Icon name="edit-2" size={16} color={theme.colors.text} style={styles.actionIcon} />
          <Text style={[styles.adjustButtonText, { color: theme.colors.text }]}>
            Adjust
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onSave && onSave(foodData)}
        >
          <Icon name="check" size={16} color="#FFFFFF" style={styles.actionIcon} />
          <Text style={styles.saveButtonText}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContainer: {
    maxHeight: '100%',
  },
  foodInfoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 16,
  },
  calorieContainer: {
    alignItems: 'center',
  },
  calorieCount: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  calorieUnit: {
    fontSize: 14,
  },
  macroChart: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  macroBarContainer: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  macroBarSegment: {
    height: '100%',
  },
  macroLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  macroLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroLegendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  macroLegendText: {
    fontSize: 12,
  },
  nutrientSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  nutrientItem: {
    width: '33.33%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nutrientLabel: {
    fontSize: 12,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tips: {
    fontSize: 14,
    lineHeight: 20,
  },
  mealTypeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mealTypeSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mealTypeOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  mealTypeText: {
    fontWeight: '500',
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  adjustButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexDirection: 'row',
  },
  saveButton: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  actionIcon: {
    marginRight: 8,
  },
  adjustButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FoodAnalysisResult;