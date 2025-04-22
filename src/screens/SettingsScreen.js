import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, useTheme, List, Switch, Button, Divider } from 'react-native-paper';

// Import custom components
import DarkModeToggle from '../components/DarkModeToggle';

// Import context and services
import { UserContext } from '../context/UserContext';
import { saveAppSettings, getAppSettings, clearAllData } from '../services/StorageService';

const SettingsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { userProfile, resetUserProfile } = useContext(UserContext);
  
  // Get the toggleTheme function from route params
  const { isDarkMode, toggleTheme } = route.params || {};
  
  // State for settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stepTrackingEnabled, setStepTrackingEnabled] = useState(true);
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' or 'imperial'
  
  // Function to handle toggling notifications
  const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    
    try {
      await saveAppSettings({ notificationsEnabled: value });
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };
  
  // Function to handle toggling step tracking
  const handleToggleStepTracking = async (value) => {
    setStepTrackingEnabled(value);
    
    try {
      await saveAppSettings({ stepTrackingEnabled: value });
    } catch (error) {
      console.error('Error saving step tracking settings:', error);
    }
  };
  
  // Function to handle changing unit system
  const handleChangeUnitSystem = async (value) => {
    setUnitSystem(value);
    
    try {
      await saveAppSettings({ unitSystem: value });
    } catch (error) {
      console.error('Error saving unit system settings:', error);
    }
  };
  
  // Function to handle logging out
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? Your data will remain on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await resetUserProfile();
              navigation.replace('Onboarding');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };
  
  // Function to handle clearing all data
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await resetUserProfile();
              navigation.replace('Onboarding');
            } catch (error) {
              console.error('Error clearing data:', error);
            }
          }
        }
      ]
    );
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Appearance
        </Text>
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
      </View>
      
      <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>
        <List.Item
          title="Enable Notifications"
          description="Receive reminders and updates"
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.secondaryText }}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              color={theme.colors.primary}
            />
          )}
        />
      </View>
      
      <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Tracking
        </Text>
        <List.Item
          title="Step Tracking"
          description="Track daily steps and activity"
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.secondaryText }}
          right={() => (
            <Switch
              value={stepTrackingEnabled}
              onValueChange={handleToggleStepTracking}
              color={theme.colors.primary}
            />
          )}
        />
      </View>
      
      <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Units
        </Text>
        <List.Item
          title="Metric System"
          description="Use kilograms, centimeters"
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.secondaryText }}
          onPress={() => handleChangeUnitSystem('metric')}
          right={() => (
            <List.Icon 
              icon={unitSystem === 'metric' ? 'check' : 'blank'} 
              color={theme.colors.primary} 
            />
          )}
        />
        <List.Item
          title="Imperial System"
          description="Use pounds, inches"
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.secondaryText }}
          onPress={() => handleChangeUnitSystem('imperial')}
          right={() => (
            <List.Icon 
              icon={unitSystem === 'imperial' ? 'check' : 'blank'} 
              color={theme.colors.primary} 
            />
          )}
        />
      </View>
      
      <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Account
        </Text>
        <List.Item
          title="Edit Profile"
          titleStyle={{ color: theme.colors.text }}
          left={() => <List.Icon icon="account-edit" color={theme.colors.primary} />}
          onPress={() => navigation.navigate('Profile')}
        />
        <List.Item
          title="Log Out"
          titleStyle={{ color: theme.colors.text }}
          left={() => <List.Icon icon="logout" color={theme.colors.warning} />}
          onPress={handleLogout}
        />
      </View>
      
      <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          About
        </Text>
        <List.Item
          title="Version"
          description="1.0.0"
          titleStyle={{ color: theme.colors.text }}
          descriptionStyle={{ color: theme.colors.secondaryText }}
        />
        <List.Item
          title="Terms of Service"
          titleStyle={{ color: theme.colors.text }}
          left={() => <List.Icon icon="file-document" color={theme.colors.primary} />}
        />
        <List.Item
          title="Privacy Policy"
          titleStyle={{ color: theme.colors.text }}
          left={() => <List.Icon icon="shield-account" color={theme.colors.primary} />}
        />
      </View>
      
      <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      
      <View style={styles.dangerSection}>
        <Button
          mode="outlined"
          color={theme.colors.error}
          icon="delete"
          style={[styles.dangerButton, { borderColor: theme.colors.error }]}
          labelStyle={{ color: theme.colors.error }}
          onPress={handleClearData}
        >
          Clear All Data
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  dangerSection: {
    padding: 16,
    alignItems: 'center',
  },
  dangerButton: {
    width: '100%',
    marginVertical: 8,
  },
});

export default SettingsScreen;