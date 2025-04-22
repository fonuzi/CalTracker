import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { getFoodLogs, getFoodLogDates, deleteFoodLog } from '../services/StorageService';
import FoodItem from '../components/FoodItem';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

const FoodLogScreen = ({ navigation, theme }) => {
  const { userProfile } = useContext(UserContext);
  
  // State
  const [foodLogs, setFoodLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // Load food logs for selected date
  useEffect(() => {
    const loadFoodLogs = async () => {
      try {
        setLoading(true);
        const logs = await getFoodLogs(selectedDate);
        setFoodLogs(logs);
      } catch (error) {
        console.error('Error loading food logs:', error);
        Alert.alert('Error', 'Failed to load food logs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFoodLogs();
  }, [selectedDate]);
  
  // Load available dates
  useEffect(() => {
    const loadDates = async () => {
      try {
        const availableDates = await getFoodLogDates();
        
        // Make sure today's date is included
        const today = new Date().toISOString().split('T')[0];
        if (!availableDates.includes(today)) {
          availableDates.push(today);
        }
        
        // Sort dates in descending order (newest first)
        availableDates.sort((a, b) => new Date(b) - new Date(a));
        
        setDates(availableDates);
      } catch (error) {
        console.error('Error loading food log dates:', error);
      }
    };
    
    loadDates();
    
    // Refresh dates when screen is focused
    const unsubscribe = navigation.addListener('focus', loadDates);
    return unsubscribe;
  }, [navigation]);
  
  // Handle editing a food item
  const handleEditFood = (food) => {
    // Navigate to the food editing screen
    navigation.navigate('Edit Food', { food });
  };
  
  // Handle deleting a food item
  const handleDeleteFood = (food) => {
    Alert.alert(
      'Delete Food',
      `Are you sure you want to delete "${food.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteFoodLog(food.id);
              
              // Update the food logs
              const updatedLogs = foodLogs.filter((log) => log.id !== food.id);
              setFoodLogs(updatedLogs);
            } catch (error) {
              console.error('Error deleting food log:', error);
              Alert.alert('Error', 'Failed to delete food log. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };
  
  // Calculate total daily nutrients
  const calculateTotalNutrients = () => {
    return foodLogs.reduce(
      (total, food) => {
        return {
          calories: total.calories + (food.calories || 0),
          protein: total.protein + (food.protein || 0),
          carbs: total.carbs + (food.carbs || 0),
          fat: total.fat + (food.fat || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  // Add food button
  const AddFoodButton = () => (
    <TouchableOpacity
      style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
      onPress={() => navigation.navigate('Camera')}
    >
      <Icon name="plus" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
  
  // Total nutrients
  const totalNutrients = calculateTotalNutrients();
  
  // Empty state
  const EmptyState = () => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      style={styles.emptyStateContainer}
    >
      <Icon name="book" size={64} color={theme.colors.border} style={styles.emptyStateIcon} />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
        No Food Logged Today
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.colors.secondaryText }]}>
        Start tracking your meals to see your nutrition data
      </Text>
      <TouchableOpacity
        style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Camera')}
      >
        <Icon name="camera" size={18} color="#FFFFFF" style={styles.emptyStateButtonIcon} />
        <Text style={styles.emptyStateButtonText}>Add Food</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
  
  // Loading indicator
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Food Log
        </Text>
      </View>
      
      {/* Date selector */}
      <View style={styles.dateContainer}>
        <FlatList
          horizontal
          data={dates}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor:
                    item === selectedDate
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderColor:
                    item === selectedDate
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={() => setSelectedDate(item)}
            >
              <Text
                style={[
                  styles.dateText,
                  {
                    color:
                      item === selectedDate
                        ? '#FFFFFF'
                        : theme.colors.text,
                  },
                ]}
              >
                {formatDate(item)}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.dateList}
        />
      </View>
      
      {/* Summary card */}
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
          Day Summary
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {Math.round(totalNutrients.calories)}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>
              Calories
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {Math.round(totalNutrients.protein)}g
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>
              Protein
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {Math.round(totalNutrients.carbs)}g
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>
              Carbs
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {Math.round(totalNutrients.fat)}g
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.secondaryText }]}>
              Fat
            </Text>
          </View>
        </View>
      </View>
      
      {/* Food list */}
      <View style={styles.foodListContainer}>
        {foodLogs.length > 0 ? (
          <FlatList
            data={foodLogs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Animatable.View animation="fadeIn" duration={500}>
                <FoodItem
                  food={item}
                  onPress={handleEditFood}
                  onDelete={handleDeleteFood}
                  theme={theme}
                />
              </Animatable.View>
            )}
            contentContainerStyle={styles.foodList}
          />
        ) : (
          <EmptyState />
        )}
      </View>
      
      {/* Add food button */}
      <AddFoodButton />
      
      {/* Overlay when deleting */}
      {deleting && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateContainer: {
    marginVertical: 8,
  },
  dateList: {
    paddingHorizontal: 16,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  foodListContainer: {
    flex: 1,
  },
  foodList: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  emptyStateButtonIcon: {
    marginRight: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FoodLogScreen;