import React, { useContext, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Switch, TouchableOpacity } from 'react-native';
import { Text, List, Divider, Button, Dialog, Portal, TextInput, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';
import DarkModeToggle from '../components/DarkModeToggle';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { userProfile, updateUserProfile } = useContext(UserContext);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stepTrackingEnabled, setStepTrackingEnabled] = useState(true);
  const [showCalorieDialogVisible, setShowCalorieDialogVisible] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(
    userProfile?.calorieGoal ? userProfile.calorieGoal.toString() : '2000'
  );
  const [stepGoal, setStepGoal] = useState(
    userProfile?.stepGoal ? userProfile.stepGoal.toString() : '10000'
  );
  const [stepGoalDialogVisible, setStepGoalDialogVisible] = useState(false);
  const [apiKeyDialogVisible, setApiKeyDialogVisible] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, you would save this preference to storage
  };
  
  const toggleStepTracking = () => {
    setStepTrackingEnabled(!stepTrackingEnabled);
    // In a real app, you would handle enabling/disabling step tracking
  };
  
  const handleUpdateCalorieGoal = () => {
    const newGoal = parseInt(calorieGoal, 10);
    
    if (isNaN(newGoal) || newGoal <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid calorie goal.');
      return;
    }
    
    updateUserProfile({
      ...userProfile,
      calorieGoal: newGoal
    });
    
    setShowCalorieDialogVisible(false);
  };
  
  const handleUpdateStepGoal = () => {
    const newGoal = parseInt(stepGoal, 10);
    
    if (isNaN(newGoal) || newGoal <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid step goal.');
      return;
    }
    
    updateUserProfile({
      ...userProfile,
      stepGoal: newGoal
    });
    
    setStepGoalDialogVisible(false);
  };
  
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid API key.');
      return;
    }
    
    try {
      await AsyncStorage.setItem('openai_api_key', apiKey.trim());
      Alert.alert('Success', 'API Key saved successfully!');
      setApiKeyDialogVisible(false);
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    }
  };
  
  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'Are you sure you want to reset the app? This will delete all your data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'App data has been reset. The app will now restart.', [
                { 
                  text: 'OK',
                  onPress: () => {
                    // In a real app, you would restart the app or navigate to onboarding
                    // For this demo, we'll just reload the page
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'HomeTab' }],
                    });
                  }
                }
              ]);
            } catch (error) {
              console.error('Error resetting app:', error);
              Alert.alert('Error', 'Failed to reset app data. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
        
        <List.Item
          title="Dark Mode"
          description="Enable dark theme"
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.text, opacity: 0.7 }}
          left={props => <List.Icon {...props} icon={props => <Feather name="moon" size={24} color={theme.colors.primary} />} />}
          right={props => <DarkModeToggle />}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Notifications"
          description="Receive reminders and updates"
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.text, opacity: 0.7 }}
          left={props => <List.Icon {...props} icon={props => <Feather name="bell" size={24} color={theme.colors.primary} />} />}
          right={props => (
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              color={theme.colors.primary}
            />
          )}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Step Tracking"
          description="Allow background step tracking"
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.text, opacity: 0.7 }}
          left={props => <List.Icon {...props} icon={props => <Feather name="activity" size={24} color={theme.colors.primary} />} />}
          right={props => (
            <Switch
              value={stepTrackingEnabled}
              onValueChange={toggleStepTracking}
              color={theme.colors.primary}
            />
          )}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Goals</Text>
        
        <TouchableOpacity onPress={() => setShowCalorieDialogVisible(true)}>
          <List.Item
            title="Daily Calorie Goal"
            description={`${userProfile?.calorieGoal || 2000} calories`}
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={{ color: theme.colors.text, opacity: 0.7 }}
            left={props => <List.Icon {...props} icon={props => <Feather name="pie-chart" size={24} color={theme.colors.primary} />} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>
        
        <Divider style={styles.divider} />
        
        <TouchableOpacity onPress={() => setStepGoalDialogVisible(true)}>
          <List.Item
            title="Daily Step Goal"
            description={`${userProfile?.stepGoal || 10000} steps`}
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={{ color: theme.colors.text, opacity: 0.7 }}
            left={props => <List.Icon {...props} icon={props => <Feather name="trending-up" size={24} color={theme.colors.primary} />} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>API Settings</Text>
        
        <TouchableOpacity onPress={() => setApiKeyDialogVisible(true)}>
          <List.Item
            title="OpenAI API Key"
            description="Set your API key for food analysis"
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={{ color: theme.colors.text, opacity: 0.7 }}
            left={props => <List.Icon {...props} icon={props => <Feather name="key" size={24} color={theme.colors.primary} />} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
        
        <List.Item
          title="App Version"
          description="1.0.0"
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.text, opacity: 0.7 }}
          left={props => <List.Icon {...props} icon={props => <Feather name="info" size={24} color={theme.colors.primary} />} />}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Terms of Service"
          titleStyle={{ color: theme.colors.text }}
          left={props => <List.Icon {...props} icon={props => <Feather name="file-text" size={24} color={theme.colors.primary} />} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Privacy Policy"
          titleStyle={{ color: theme.colors.text }}
          left={props => <List.Icon {...props} icon={props => <Feather name="shield" size={24} color={theme.colors.primary} />} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </View>
      
      <View style={styles.dangerSection}>
        <Button 
          mode="outlined" 
          onPress={handleResetApp}
          style={styles.resetButton}
          color="#FF5252"
        >
          Reset App Data
        </Button>
      </View>
      
      {/* Calorie Goal Dialog */}
      <Portal>
        <Dialog
          visible={showCalorieDialogVisible}
          onDismiss={() => setShowCalorieDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>Set Daily Calorie Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Calories"
              value={calorieGoal}
              onChangeText={setCalorieGoal}
              keyboardType="numeric"
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCalorieDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateCalorieGoal}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Step Goal Dialog */}
      <Portal>
        <Dialog
          visible={stepGoalDialogVisible}
          onDismiss={() => setStepGoalDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>Set Daily Step Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Steps"
              value={stepGoal}
              onChangeText={setStepGoal}
              keyboardType="numeric"
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStepGoalDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateStepGoal}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* API Key Dialog */}
      <Portal>
        <Dialog
          visible={apiKeyDialogVisible}
          onDismiss={() => setApiKeyDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>Set OpenAI API Key</Dialog.Title>
          <Dialog.Content>
            <Text style={[styles.apiKeyInfo, { color: theme.colors.text }]}>
              Enter your OpenAI API key to enable food analysis features.
              You can get an API key from the OpenAI website.
            </Text>
            <TextInput
              label="API Key"
              value={apiKey}
              onChangeText={setApiKey}
              mode="outlined"
              style={styles.dialogInput}
              secureTextEntry
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setApiKeyDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveApiKey}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dangerSection: {
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButton: {
    borderColor: '#FF5252',
    width: '80%',
  },
  dialogInput: {
    marginVertical: 10,
  },
  apiKeyInfo: {
    marginBottom: 15,
    fontSize: 14,
    opacity: 0.8,
  },
  bottomPadding: {
    height: 80,
  },
});

export default SettingsScreen;
