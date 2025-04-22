import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { getFoodLogs, getFoodLogDates } from '../services/StorageService';
import { Icon } from '../assets/icons';
import FoodItem from '../components/FoodItem';

const FoodLogScreen = ({ navigation, theme }) => {
  // State
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableDates, setAvailableDates] = useState([]);
  
  // Load food logs for selected date
  useEffect(() => {
    loadFoods();
  }, [selectedDate]);
  
  // Load available dates
  useEffect(() => {
    loadAvailableDates();
  }, []);
  
  // Load foods for the selected date
  const loadFoods = async () => {
    try {
      setIsLoading(true);
      const foodLogs = await getFoodLogs(selectedDate);
      setFoods(foodLogs);
    } catch (error) {
      console.error('Error loading food logs:', error);
      setFoods([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load dates that have food logs
  const loadAvailableDates = async () => {
    try {
      const dates = await getFoodLogDates();
      setAvailableDates(dates);
      
      // If no dates available, use today's date
      if (dates.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        setAvailableDates([today]);
      }
    } catch (error) {
      console.error('Error loading available dates:', error);
    }
  };
  
  // Navigate to previous date
  const goToPreviousDate = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };
  
  // Navigate to next date
  const goToNextDate = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };
  
  // Format date for display (e.g., "Monday, Jan 15")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Check if date is today
  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };
  
  // Calculate total calories for the day
  const calculateTotalCalories = () => {
    return foods.reduce((total, food) => total + (food.calories || 0), 0);
  };
  
  // Render empty state
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="book-open" size={50} color={theme.colors.secondaryText} />
        <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
          No food logged for this day
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Camera')}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Food</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render header with date and navigation
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dateNavButton}
          onPress={goToPreviousDate}
          disabled={availableDates.indexOf(selectedDate) === 0}
        >
          <Icon 
            name="chevron-left" 
            size={24} 
            color={availableDates.indexOf(selectedDate) === 0 
              ? theme.colors.disabled 
              : theme.colors.text} 
          />
        </TouchableOpacity>
        
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {formatDate(selectedDate)}
          </Text>
          {isToday(selectedDate) && (
            <View style={[styles.todayBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.todayText}>TODAY</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.dateNavButton}
          onPress={goToNextDate}
          disabled={availableDates.indexOf(selectedDate) === availableDates.length - 1}
        >
          <Icon 
            name="chevron-right" 
            size={24} 
            color={availableDates.indexOf(selectedDate) === availableDates.length - 1 
              ? theme.colors.disabled 
              : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render total calories for the day
  const renderTotalCalories = () => {
    if (foods.length === 0) return null;
    
    return (
      <View style={[styles.totalContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.totalLabel, { color: theme.colors.secondaryText }]}>
          Total Calories
        </Text>
        <Text style={[styles.totalCalories, { color: theme.colors.text }]}>
          {calculateTotalCalories()} kcal
        </Text>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Date selector header */}
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.surface }]}>
        {renderHeader()}
      </View>
      
      {/* Food log list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          {renderTotalCalories()}
          
          <FlatList
            data={foods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FoodItem 
                food={item} 
                theme={theme}
                onPress={() => {/* Navigate to food details */}}
                onDelete={() => {/* Delete food */}}
              />
            )}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContent}
          />
          
          {foods.length > 0 && (
            <TouchableOpacity
              style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Camera')}
            >
              <Icon name="plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dateNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  totalContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
  },
  totalCalories: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default FoodLogScreen;