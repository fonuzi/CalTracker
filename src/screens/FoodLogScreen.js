import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SectionList,
  Alert,
  RefreshControl,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { getFoodLogs, getFoodLogDates, deleteFoodLog } from '../services/StorageService';
import FoodItem from '../components/FoodItem';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

const FoodLogScreen = ({ navigation, theme }) => {
  // State
  const [foodLogs, setFoodLogs] = useState({});
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { calculateDailyProgress } = useContext(UserContext);
  
  // Load data on mount and focus
  useEffect(() => {
    loadData();
    
    // Refresh when navigating back to this screen
    const unsubscribe = navigation.addListener('focus', loadData);
    
    return () => {
      unsubscribe();
    };
  }, [navigation]);
  
  // Load food log data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get all dates with food logs
      const allDates = await getFoodLogDates();
      setDates(allDates);
      
      // Select today or the most recent date if no logs for today
      const today = new Date().toISOString().split('T')[0];
      const defaultDate = allDates.includes(today) ? today : allDates[0] || today;
      setSelectedDate(defaultDate);
      
      // Get logs for the selected date
      if (defaultDate) {
        const logs = await getFoodLogs(defaultDate);
        setFoodLogs({ [defaultDate]: logs });
      }
    } catch (error) {
      console.error('Error loading food logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Load logs for a specific date
  const loadLogsForDate = async (date) => {
    try {
      setSelectedDate(date);
      
      // Check if we already have logs for this date
      if (!foodLogs[date]) {
        const logs = await getFoodLogs(date);
        setFoodLogs(prev => ({
          ...prev,
          [date]: logs
        }));
      }
    } catch (error) {
      console.error(`Error loading logs for ${date}:`, error);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  // Handle adding food
  const handleAddFood = () => {
    navigation.navigate('Camera');
  };
  
  // Handle deleting food log
  const handleDeleteFoodLog = (id) => {
    Alert.alert(
      'Delete Food',
      'Are you sure you want to delete this food entry?',
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
              await deleteFoodLog(id);
              // Reload data
              loadData();
            } catch (error) {
              console.error('Error deleting food log:', error);
            }
          },
        },
      ]
    );
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      // Format as Month Day, e.g. "May 15"
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  // Group food by meal type
  const groupFoodByMealType = (foods) => {
    if (!foods || !foods.length) return [];
    
    const foodByMealType = {};
    
    // Define meal types and their order
    const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Initialize meal type groups
    mealTypeOrder.forEach(type => {
      foodByMealType[type] = [];
    });
    
    // Group foods by meal type
    foods.forEach(food => {
      const mealType = (food.mealType || 'snack').toLowerCase();
      if (!foodByMealType[mealType]) {
        foodByMealType[mealType] = [];
      }
      foodByMealType[mealType].push(food);
    });
    
    // Convert to sections array for SectionList
    const sections = Object.keys(foodByMealType)
      .filter(mealType => foodByMealType[mealType].length > 0)
      .sort((a, b) => {
        return mealTypeOrder.indexOf(a) - mealTypeOrder.indexOf(b);
      })
      .map(mealType => ({
        title: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        data: foodByMealType[mealType],
      }));
    
    return sections;
  };
  
  // Calculate total calories for the selected date
  const calculateTotalCalories = () => {
    const foods = foodLogs[selectedDate] || [];
    return foods.reduce((total, food) => total + (food.calories || 0), 0);
  };
  
  // Loading screen
  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  // Empty state
  if (!dates.length) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Icon name="book-open" size={50} color={theme.colors.secondaryText} style={styles.emptyIcon} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No Food Logged Yet
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
          Start tracking your nutrition by adding your first meal.
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddFood}
        >
          <Icon name="plus" size={18} color="#FFFFFF" style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>Add Food</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Prepare sections for the selected date
  const sections = groupFoodByMealType(foodLogs[selectedDate] || []);
  const totalCalories = calculateTotalCalories();
  const progress = calculateDailyProgress(foodLogs[selectedDate] || []);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Date selector */}
      <View style={styles.dateSelector}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={dates}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dateItem,
                selectedDate === item && { 
                  backgroundColor: theme.colors.primary,
                }
              ]}
              onPress={() => loadLogsForDate(item)}
            >
              <Text 
                style={[
                  styles.dateText,
                  { color: selectedDate === item ? '#FFFFFF' : theme.colors.text }
                ]}
              >
                {formatDate(item)}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.dateList}
        />
      </View>
      
      {/* Food log content */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodItem
            food={item}
            onPress={() => navigation.navigate('Edit Food', { food: item })}
            onDelete={handleDeleteFoodLog}
            theme={theme}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.logHeader}>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
                Daily Summary
              </Text>
              <View style={styles.macroSummary}>
                <View style={styles.calorieBox}>
                  <Text style={[styles.calorieCount, { color: theme.colors.text }]}>
                    {totalCalories}
                  </Text>
                  <Text style={[styles.calorieLabel, { color: theme.colors.secondaryText }]}>
                    kcal
                  </Text>
                </View>
                
                <View style={styles.macroContainer}>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: theme.colors.protein }]}>
                      {progress.macros.protein.consumed}g
                    </Text>
                    <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                      Protein
                    </Text>
                  </View>
                  
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: theme.colors.carbs }]}>
                      {progress.macros.carbs.consumed}g
                    </Text>
                    <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                      Carbs
                    </Text>
                  </View>
                  
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: theme.colors.fat }]}>
                      {progress.macros.fat.consumed}g
                    </Text>
                    <Text style={[styles.macroLabel, { color: theme.colors.secondaryText }]}>
                      Fat
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Icon name="coffee" size={40} color={theme.colors.secondaryText} style={styles.emptyListIcon} />
            <Text style={[styles.emptyListText, { color: theme.colors.secondaryText }]}>
              No meals logged for this day
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddFood}
            >
              <Icon name="plus" size={18} color="#FFFFFF" style={styles.addButtonIcon} />
              <Text style={styles.addButtonText}>Add Food</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        stickySectionHeadersEnabled
        contentContainerStyle={styles.sectionListContent}
      />
      
      {/* Add food FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelector: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateList: {
    paddingHorizontal: 16,
  },
  dateItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  macroSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieBox: {
    alignItems: 'center',
    marginRight: 24,
  },
  calorieCount: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 14,
  },
  macroContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionListContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyListContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListIcon: {
    marginBottom: 16,
  },
  emptyListText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 16,
    bottom: 16,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default FoodLogScreen;