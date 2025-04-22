import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button, Chip, useTheme, Divider } from 'react-native-paper';
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
  
  // Format the ingredients list for display
  const formatIngredients = (ingredients) => {
    if (!ingredients || !Array.isArray(ingredients)) return 'No ingredients data';
    
    return ingredients.join(', ');
  };
  
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {foodData.name || 'Food Analysis'}
          </Text>
          
          <Chip 
            mode="outlined" 
            style={[styles.methodChip, { borderColor: theme.colors.primary }]}
            textStyle={{ color: theme.colors.primary }}
          >
            {foodData.method === 'image' ? 'AI Image Analysis' : 'AI Text Analysis'}
          </Chip>
        </View>
        
        <View style={styles.calorieContainer}>
          <Text style={[styles.calorieValue, { color: theme.colors.text }]}>
            {foodData.calories || 0}
          </Text>
          <Text style={[styles.calorieLabel, { color: theme.colors.secondaryText }]}>
            calories
          </Text>
        </View>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.protein }]}>
              {foodData.protein || 0}g
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Protein
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.carbs }]}>
              {foodData.carbs || 0}g
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Carbs
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.fat }]}>
              {foodData.fat || 0}g
            </Text>
            <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
              Fat
            </Text>
          </View>
        </View>
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        <View style={styles.detailsContainer}>
          {foodData.serving_size && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                Serving Size
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {foodData.serving_size}
              </Text>
            </View>
          )}
          
          {foodData.sugar !== undefined && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                Sugar
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {foodData.sugar}g
              </Text>
            </View>
          )}
          
          {foodData.fiber !== undefined && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                Fiber
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {foodData.fiber}g
              </Text>
            </View>
          )}
        </View>
        
        {foodData.ingredients && (
          <View style={styles.ingredientsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Ingredients
            </Text>
            <Text style={[styles.ingredientsText, { color: theme.colors.secondaryText }]}>
              {formatIngredients(foodData.ingredients)}
            </Text>
          </View>
        )}
        
        <View style={styles.infoContainer}>
          {foodData.health_benefits && Array.isArray(foodData.health_benefits) && foodData.health_benefits.length > 0 && (
            <View style={styles.infoSection}>
              <View style={styles.infoHeader}>
                <Feather name="heart" size={16} color={theme.colors.success} style={styles.infoIcon} />
                <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                  Health Benefits
                </Text>
              </View>
              
              <View style={styles.bulletList}>
                {foodData.health_benefits.map((benefit, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <Text style={[styles.bullet, { color: theme.colors.success }]}>•</Text>
                    <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {foodData.concerns && Array.isArray(foodData.concerns) && foodData.concerns.length > 0 && (
            <View style={styles.infoSection}>
              <View style={styles.infoHeader}>
                <Feather name="alert-circle" size={16} color={theme.colors.error} style={styles.infoIcon} />
                <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                  Health Concerns
                </Text>
              </View>
              
              <View style={styles.bulletList}>
                {foodData.concerns.map((concern, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <Text style={[styles.bullet, { color: theme.colors.error }]}>•</Text>
                    <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                      {concern}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="text" 
            onPress={onCancel}
            style={styles.button}
          >
            Cancel
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={onAdjust}
            style={styles.button}
          >
            Adjust
          </Button>
          
          <Button 
            mode="contained" 
            onPress={onSave}
            style={styles.button}
          >
            Save
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  container: {
    borderRadius: 16,
    padding: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  methodChip: {
    height: 28,
  },
  calorieContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieValue: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 16,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '33.3%',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ingredientsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bulletList: {},
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: -2,
  },
  bulletText: {
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default FoodAnalysisResult;