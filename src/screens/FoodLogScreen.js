import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { getFoodLogs, getFoodLogDates, deleteFoodLog } from '../services/StorageService';
import FoodItem from '../components/FoodItem';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

const FoodLogScreen = ({ navigation, theme }) => {
  const { userProfile } = useContext(UserContext);
  const [foodLogs, setFoodLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load food log dates and selected date's food logs on mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Reload data when the screen is focused (e.g., after adding new food)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Load all necessary data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get all dates with food logs
      const logDates = await getFoodLogDates();
      setDates(logDates);
      
      // If no dates available or the selected date isn't in the list,
      // but we have log dates, use the most recent date
      if ((logDates.length > 0 && !logDates.includes(selectedDate)) || !selectedDate) {
        setSelectedDate(logDates[0] || new Date().toISOString().split('T')[0]);
      }
      
      // Load food logs for the selected date
      await loadFoodLogs(selectedDate);
    } catch (error) {
      console.error('Error loading food log data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load food logs for a specific date
  const loadFoodLogs = async (date) => {
    try {
      const logs = await getFoodLogs(date);
      
      // Sort logs by timestamp, newest first
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setFoodLogs(logs);
    } catch (error) {
      console.error(`Error loading food logs for ${date}:`, error);
      setFoodLogs([]);
    }
  };
  
  // Change the selected date
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    await loadFoodLogs(date);
  };
  
  // Refresh the food logs
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  // View a food item's details
  const handleFoodItemPress = (food) => {
    // Navigate to food detail screen (to be implemented)
    // For now, just show some details in an alert
    Alert.alert(
      food.name,
      `Calories: ${food.calories} cal\nProtein: ${food.protein}g\nCarbs: ${food.carbs}g\nFat: ${food.fat}g`
    );
  };
  
  // Delete a food log entry
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
              await deleteFoodLog(food.id);
              await loadFoodLogs(selectedDate);
              await loadData(); // Reload dates in case we deleted the last log for a date
            } catch (error) {
              console.error('Error deleting food log:', error);
              Alert.alert('Error', 'Failed to delete food log. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  // Navigate to add food screen
  const handleAddFood = () => {
    navigation.navigate('Add Food');
  };
  
  // Format date for display (e.g., "Today", "Yesterday", or date string)
  const formatDateForDisplay = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  // Render a date tab
  const renderDateTab = ({ item }) => {
    const isSelected = item === selectedDate;
    
    return (
      <TouchableOpacity
        style={[
          styles.dateTab,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
          },
        ]}
        onPress={() => handleDateChange(item)}
      >
        <Text
          style={[
            styles.dateTabText,
            {
              color: isSelected ? '#FFFFFF' : theme.colors.text,
              fontWeight: isSelected ? 'bold' : 'normal',
            },
          ]}
        >
          {formatDateForDisplay(item)}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render a food log item
  const renderFoodItem = ({ item }) => {
    return (
      <Animatable.View animation="fadeIn" duration={500}>
        <FoodItem
          food={item}
          onPress={() => handleFoodItemPress(item)}
          onDelete={() => handleDeleteFood(item)}
          theme={theme}
        />
      </Animatable.View>
    );
  };
  
  // Empty list component
  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="coffee" size={48} color={theme.colors.secondaryText} />
      <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
        No food logged for {formatDateForDisplay(selectedDate)}
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddFood}
      >
        <Text style={styles.addButtonText}>Add Food</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Loading indicator
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Date tabs */}
      <View style={styles.dateTabsContainer}>
        {dates.length > 0 ? (
          <FlatList
            data={dates}
            renderItem={renderDateTab}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateTabsList}
          />
        ) : (
          <Text style={[styles.noDateText, { color: theme.colors.secondaryText }]}>
            No food logs yet
          </Text>
        )}
      </View>
      
      {/* Food log list */}
      <FlatList
        data={foodLogs}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.foodList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyList}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      
      {/* Add food button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddFood}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateTabsContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateTabsList: {
    paddingHorizontal: 15,
  },
  dateTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  dateTabText: {
    fontSize: 14,
  },
  noDateText: {
    padding: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  foodList: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  floatingButton: {
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
});

export default FoodLogScreen;