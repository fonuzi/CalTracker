import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Text, Button, IconButton, Chip, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Import custom components
import FoodItem from '../components/FoodItem';

// Import context and services
import { UserContext } from '../context/UserContext';
import { getFoodLogs, deleteFoodLog } from '../services/StorageService';

const FoodLogScreen = ({ navigation }) => {
  const theme = useTheme();
  const { userProfile, calculateDailyProgress } = useContext(UserContext);
  
  // State
  const [foodLogs, setFoodLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calorieStats, setCalorieStats] = useState({
    caloriesConsumed: 0,
    caloriesRemaining: 0,
    percentage: 0
  });
  
  // Load food logs when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadFoodLogs();
      return () => {};
    }, [selectedDate])
  );
  
  // Function to load food logs
  const loadFoodLogs = async () => {
    setIsLoading(true);
    
    try {
      // Get food logs for the selected date
      const logs = await getFoodLogs(selectedDate);
      
      // Sort logs by timestamp
      const sortedLogs = [...logs].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      setFoodLogs(sortedLogs);
      
      // Calculate calorie stats
      const stats = calculateDailyProgress(logs);
      setCalorieStats(stats);
    } catch (error) {
      console.error('Error loading food logs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Function to handle deleting a food log
  const handleDeleteFood = (id) => {
    Alert.alert(
      'Delete Food',
      'Are you sure you want to delete this food entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFoodLog(id);
              // Reload food logs
              loadFoodLogs();
            } catch (error) {
              console.error('Error deleting food log:', error);
              Alert.alert('Error', 'Failed to delete food log');
            }
          }
        }
      ]
    );
  };
  
  // Function to navigate to previous day
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };
  
  // Function to navigate to next day
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Don't allow selecting future dates
    const today = new Date();
    if (currentDate <= today) {
      setSelectedDate(currentDate.toISOString().split('T')[0]);
    }
  };
  
  // Function to format the selected date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Function to check if the selected date is today
  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  };
  
  // Function to navigate to camera screen
  const navigateToCamera = () => {
    navigation.navigate('Camera');
  };
  
  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFoodLogs();
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="book" size={60} color={theme.colors.disabled} style={styles.emptyIcon} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Food Logged
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
        {isToday() 
          ? "You haven't logged any food today."
          : "No food entries found for this day."}
      </Text>
      {isToday() && (
        <Button
          mode="contained"
          icon="camera"
          style={styles.addButton}
          onPress={navigateToCamera}
        >
          Add Food
        </Button>
      )}
    </View>
  );
  
  // Render list header
  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      {/* Date selector */}
      <View style={styles.dateSelector}>
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={goToPreviousDay}
          color={theme.colors.primary}
        />
        <Text style={[styles.dateText, { color: theme.colors.text }]}>
          {formatDate(selectedDate)}
        </Text>
        <IconButton
          icon="chevron-right"
          size={24}
          onPress={goToNextDay}
          color={isToday() ? theme.colors.disabled : theme.colors.primary}
          disabled={isToday()}
        />
      </View>
      
      {/* Calories summary */}
      <View style={[styles.caloriesSummary, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.caloriesContainer}>
          <Text style={[styles.caloriesTitle, { color: theme.colors.secondaryText }]}>
            Consumed
          </Text>
          <Text style={[styles.caloriesValue, { color: theme.colors.text }]}>
            {calorieStats.caloriesConsumed}
          </Text>
          <Text style={[styles.caloriesUnit, { color: theme.colors.secondaryText }]}>cal</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.caloriesContainer}>
          <Text style={[styles.caloriesTitle, { color: theme.colors.secondaryText }]}>
            Remaining
          </Text>
          <Text style={[styles.caloriesValue, { color: theme.colors.success }]}>
            {calorieStats.caloriesRemaining}
          </Text>
          <Text style={[styles.caloriesUnit, { color: theme.colors.secondaryText }]}>cal</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.caloriesContainer}>
          <Text style={[styles.caloriesTitle, { color: theme.colors.secondaryText }]}>
            Goal
          </Text>
          <Text style={[styles.caloriesValue, { color: theme.colors.text }]}>
            {userProfile?.calorieGoal || 2000}
          </Text>
          <Text style={[styles.caloriesUnit, { color: theme.colors.secondaryText }]}>cal</Text>
        </View>
      </View>
      
      {/* Meal filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mealsFilterContainer}
        contentContainerStyle={styles.mealsFilterContent}
      >
        <Chip
          mode="outlined"
          selected={true}
          style={styles.mealChip}
          textStyle={{ color: theme.colors.text }}
        >
          All Meals
        </Chip>
        <Chip
          mode="outlined"
          style={styles.mealChip}
          textStyle={{ color: theme.colors.text }}
        >
          Breakfast
        </Chip>
        <Chip
          mode="outlined"
          style={styles.mealChip}
          textStyle={{ color: theme.colors.text }}
        >
          Lunch
        </Chip>
        <Chip
          mode="outlined"
          style={styles.mealChip}
          textStyle={{ color: theme.colors.text }}
        >
          Dinner
        </Chip>
        <Chip
          mode="outlined"
          style={styles.mealChip}
          textStyle={{ color: theme.colors.text }}
        >
          Snacks
        </Chip>
      </ScrollView>
      
      {/* Divider */}
      <View
        style={[styles.listDivider, { backgroundColor: theme.colors.border }]}
      />
      
      {/* Food list title */}
      <View style={styles.listHeaderContainer}>
        <Text style={[styles.listTitle, { color: theme.colors.text }]}>
          Food Entries
        </Text>
        {isToday() && (
          <Button
            mode="text"
            icon="plus"
            onPress={navigateToCamera}
            labelStyle={{ color: theme.colors.primary }}
          >
            Add Food
          </Button>
        )}
      </View>
    </View>
  );
  
  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={foodLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodItem
            food={item}
            onPress={() => {}}
            onDelete={handleDeleteFood}
          />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  caloriesSummary: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  caloriesContainer: {
    flex: 1,
    alignItems: 'center',
  },
  caloriesTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  caloriesValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  caloriesUnit: {
    fontSize: 10,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  mealsFilterContainer: {
    marginBottom: 16,
  },
  mealsFilterContent: {
    paddingRight: 16,
  },
  mealChip: {
    marginRight: 8,
  },
  listDivider: {
    height: 1,
    marginBottom: 16,
  },
  listHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    paddingHorizontal: 16,
  },
});

export default FoodLogScreen;