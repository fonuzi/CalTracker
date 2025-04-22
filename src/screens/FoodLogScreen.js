import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Searchbar, Chip, FAB, Dialog, Portal, TextInput, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getFoodLogs, saveFoodLog, deleteFoodLog } from '../services/StorageService';
import { analyzeFoodText } from '../services/OpenAIService';
import FoodItem from '../components/FoodItem';
import CalorieProgress from '../components/CalorieProgress';

const FoodLogScreen = ({ navigation }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dailyTotal, setDailyTotal] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [calorieGoal, setCalorieGoal] = useState(2000); // Default, should come from user profile

  const mealTypes = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

  useFocusEffect(
    React.useCallback(() => {
      loadFoodLogs();
    }, [date])
  );

  const loadFoodLogs = async () => {
    try {
      const dateString = date.toISOString().split('T')[0];
      const logs = await getFoodLogs(dateString);
      setMeals(logs);
      
      // Calculate daily totals
      const totals = logs.reduce((acc, item) => {
        return {
          calories: acc.calories + (parseFloat(item.calories) || 0),
          protein: acc.protein + (parseFloat(item.protein) || 0),
          carbs: acc.carbs + (parseFloat(item.carbs) || 0),
          fat: acc.fat + (parseFloat(item.fat) || 0),
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      setDailyTotal(totals);
      
      // Apply filters
      filterMeals(logs, selectedMealType, searchQuery);
    } catch (error) {
      console.error('Error loading food logs:', error);
      Alert.alert('Error', 'Failed to load your food logs');
    }
  };

  const filterMeals = (meals, mealType, query) => {
    let filtered = meals;
    
    // Filter by meal type
    if (mealType !== 'All') {
      filtered = filtered.filter(meal => meal.mealType === mealType);
    }
    
    // Filter by search query
    if (query) {
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(query.toLowerCase()) ||
        (meal.description && meal.description.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    setFilteredMeals(filtered);
  };

  useEffect(() => {
    filterMeals(meals, selectedMealType, searchQuery);
  }, [selectedMealType, searchQuery]);

  const onChangeSearch = query => {
    setSearchQuery(query);
  };

  const changeDate = (direction) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + direction);
    setDate(newDate);
  };

  const showDialog = () => setIsDialogVisible(true);
  const hideDialog = () => setIsDialogVisible(false);

  const handleAnalyzeManualEntry = async () => {
    if (!manualEntry.name && !manualEntry.description) {
      Alert.alert('Missing Information', 'Please enter a food name or description.');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const textToAnalyze = manualEntry.name + ' ' + manualEntry.description;
      const analysis = await analyzeFoodText(textToAnalyze);
      
      setManualEntry({
        ...manualEntry,
        calories: analysis.calories.toString(),
        protein: analysis.protein.toString(),
        carbs: analysis.carbs.toString(),
        fat: analysis.fat.toString(),
      });
    } catch (error) {
      console.error('Error analyzing food:', error);
      Alert.alert('Analysis Error', 'Failed to analyze your food. Please try entering the nutritional values manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddManualEntry = async () => {
    if (!manualEntry.name) {
      Alert.alert('Missing Information', 'Please enter a food name.');
      return;
    }
    
    if (!manualEntry.calories) {
      Alert.alert('Missing Information', 'Please enter calories.');
      return;
    }
    
    try {
      const newFood = {
        id: Date.now().toString(),
        name: manualEntry.name,
        description: manualEntry.description,
        calories: parseFloat(manualEntry.calories),
        protein: parseFloat(manualEntry.protein) || 0,
        carbs: parseFloat(manualEntry.carbs) || 0,
        fat: parseFloat(manualEntry.fat) || 0,
        mealType: selectedMealType === 'All' ? 'Other' : selectedMealType,
        date: date.toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      
      await saveFoodLog(newFood);
      loadFoodLogs();
      setManualEntry({
        name: '',
        description: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
      });
      hideDialog();
    } catch (error) {
      console.error('Error adding food log:', error);
      Alert.alert('Error', 'Failed to add your food log');
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      await deleteFoodLog(id);
      loadFoodLogs();
    } catch (error) {
      console.error('Error deleting food log:', error);
      Alert.alert('Error', 'Failed to delete your food log');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="book" size={70} color={theme.colors.disabled} />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>No food logged for this day</Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('CameraTab')}
        style={styles.scanButton}
      >
        Scan Food
      </Button>
      <Button 
        mode="outlined" 
        onPress={showDialog}
        style={styles.manualButton}
      >
        Add Manually
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Date navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <Feather name="chevron-left" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.dateText, { color: theme.colors.text }]}>
          {formatDate(date)}
        </Text>
        <TouchableOpacity onPress={() => changeDate(1)}>
          <Feather name="chevron-right" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Daily summary */}
      <View style={styles.summaryContainer}>
        <CalorieProgress 
          consumed={dailyTotal.calories} 
          goal={calorieGoal} 
          theme={theme}
          compact
        />
        
        <View style={styles.macroSummary}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={[styles.macroValue, { color: theme.colors.primary }]}>
              {dailyTotal.protein.toFixed(1)}g
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={[styles.macroValue, { color: theme.colors.primary }]}>
              {dailyTotal.carbs.toFixed(1)}g
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={[styles.macroValue, { color: theme.colors.primary }]}>
              {dailyTotal.fat.toFixed(1)}g
            </Text>
          </View>
        </View>
      </View>
      
      {/* Search and filter */}
      <Searchbar
        placeholder="Search food entries"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.primary}
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={theme.colors.placeholder}
      />
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mealTypes.map((type) => (
            <Chip 
              key={type} 
              selected={selectedMealType === type}
              onPress={() => setSelectedMealType(type)} 
              style={[
                styles.filterChip,
                { 
                  backgroundColor: selectedMealType === type 
                    ? theme.colors.primary 
                    : theme.colors.surface 
                }
              ]}
              textStyle={{ 
                color: selectedMealType === type 
                  ? '#fff' 
                  : theme.colors.text 
              }}
            >
              {type}
            </Chip>
          ))}
        </ScrollView>
      </View>
      
      {/* Food list */}
      {meals.length > 0 ? (
        <FlatList
          data={filteredMeals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FoodItem 
              food={item} 
              onDelete={() => handleDeleteFood(item.id)}
              theme={theme}
            />
          )}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Text style={{ color: theme.colors.text, textAlign: 'center' }}>
                No food entries match your search or filter.
              </Text>
              <Button onPress={() => {
                setSearchQuery('');
                setSelectedMealType('All');
              }}>
                Clear Filters
              </Button>
            </View>
          }
        />
      ) : (
        renderEmptyState()
      )}
      
      {/* FAB for adding new entries */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={showDialog}
      />
      
      {/* Manual entry dialog */}
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={hideDialog}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>Add Food Manually</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Food Name"
              value={manualEntry.name}
              onChangeText={text => setManualEntry({ ...manualEntry, name: text })}
              style={styles.dialogInput}
              mode="outlined"
            />
            <TextInput
              label="Description (optional)"
              value={manualEntry.description}
              onChangeText={text => setManualEntry({ ...manualEntry, description: text })}
              style={styles.dialogInput}
              mode="outlined"
            />
            
            <Button 
              mode="contained" 
              onPress={handleAnalyzeManualEntry}
              loading={isAnalyzing}
              disabled={isAnalyzing}
              style={styles.analyzeButton}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
            
            <View style={styles.nutritionInputContainer}>
              <TextInput
                label="Calories"
                value={manualEntry.calories}
                onChangeText={text => setManualEntry({ ...manualEntry, calories: text })}
                keyboardType="numeric"
                style={styles.nutritionInput}
                mode="outlined"
              />
              <TextInput
                label="Protein (g)"
                value={manualEntry.protein}
                onChangeText={text => setManualEntry({ ...manualEntry, protein: text })}
                keyboardType="numeric"
                style={styles.nutritionInput}
                mode="outlined"
              />
            </View>
            
            <View style={styles.nutritionInputContainer}>
              <TextInput
                label="Carbs (g)"
                value={manualEntry.carbs}
                onChangeText={text => setManualEntry({ ...manualEntry, carbs: text })}
                keyboardType="numeric"
                style={styles.nutritionInput}
                mode="outlined"
              />
              <TextInput
                label="Fat (g)"
                value={manualEntry.fat}
                onChangeText={text => setManualEntry({ ...manualEntry, fat: text })}
                keyboardType="numeric"
                style={styles.nutritionInput}
                mode="outlined"
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleAddManualEntry} mode="contained">Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
  },
  macroSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 5,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchbar: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  scanButton: {
    marginTop: 20,
    width: '80%',
  },
  manualButton: {
    marginTop: 12,
    width: '80%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  dialogInput: {
    marginBottom: 12,
  },
  analyzeButton: {
    marginVertical: 16,
  },
  nutritionInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionInput: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 12,
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
});

export default FoodLogScreen;
