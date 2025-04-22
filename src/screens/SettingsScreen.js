import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Icon } from '../assets/icons';
import { saveAppSettings, getAppSettings, clearAllData } from '../services/StorageService';
import * as Animatable from 'react-native-animatable';

const SettingsScreen = ({ navigation, theme }) => {
  const { userProfile, updateUserProfile } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    stepTracking: true,
    dataSync: false,
  });

  // Toggle a setting
  const toggleSetting = async (key) => {
    try {
      const newSettings = {
        ...settings,
        [key]: !settings[key],
      };
      
      setSettings(newSettings);
      await saveAppSettings(newSettings);
    } catch (error) {
      console.error(`Error toggling ${key} setting:`, error);
    }
  };

  // Handle logout or clear all data
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your data and reset the app. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await clearAllData();
              // Reset user profile in context
              updateUserProfile(null);
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Go to profile screen
  const handleEditProfile = () => {
    navigation.navigate('Profile');
  };

  // Setting item component
  const SettingItem = ({ icon, title, description, value, onToggle, iconColor }) => (
    <View style={[styles.settingItem, { borderBottomColor: theme.colors.divider }]}>
      <View style={styles.settingContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: (iconColor || theme.colors.primary) + '20' },
          ]}
        >
          <Icon
            name={icon}
            size={20}
            color={iconColor || theme.colors.primary}
          />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {description && (
            <Text
              style={[
                styles.settingDescription,
                { color: theme.colors.secondaryText },
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
      {typeof value === 'boolean' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary,
          }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Icon
          name="chevron-right"
          size={20}
          color={theme.colors.secondaryText}
        />
      )}
    </View>
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      {/* Profile Section */}
      <Animatable.View animation="fadeIn" duration={600}>
        <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
          PROFILE
        </Text>
        
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}
          onPress={handleEditProfile}
        >
          <View style={styles.profileContent}>
            <View
              style={[
                styles.profileIconContainer,
                { backgroundColor: theme.colors.primary + '20' },
              ]}
            >
              <Icon name="user" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {userProfile?.name || 'User'}
              </Text>
              <Text
                style={[
                  styles.profileDetails,
                  { color: theme.colors.secondaryText },
                ]}
              >
                {userProfile?.email || 'Tap to edit profile'}
              </Text>
            </View>
          </View>
          <Icon
            name="chevron-right"
            size={20}
            color={theme.colors.secondaryText}
          />
        </TouchableOpacity>
      </Animatable.View>

      {/* App Settings */}
      <Animatable.View animation="fadeIn" duration={600} delay={100}>
        <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
          APP SETTINGS
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <SettingItem
            icon="bell"
            title="Notifications"
            description="Enable push notifications"
            value={settings.notifications}
            onToggle={() => toggleSetting('notifications')}
          />

          <SettingItem
            icon="activity"
            title="Step Tracking"
            description="Track your daily steps"
            value={settings.stepTracking}
            onToggle={() => toggleSetting('stepTracking')}
          />

          <SettingItem
            icon="smartphone"
            title="Appearance"
            description={theme.isDark ? 'Dark Mode' : 'Light Mode'}
            onToggle={theme.toggleTheme}
            value={theme.isDark}
          />
        </View>
      </Animatable.View>

      {/* Support */}
      <Animatable.View animation="fadeIn" duration={600} delay={200}>
        <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
          SUPPORT
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <SettingItem
            icon="help-circle"
            title="Help Center"
            iconColor={theme.colors.secondary}
          />

          <SettingItem
            icon="message-square"
            title="Contact Us"
            iconColor={theme.colors.secondary}
          />

          <SettingItem
            icon="star"
            title="Rate the App"
            iconColor={theme.colors.warning}
          />
        </View>
      </Animatable.View>

      {/* Danger Zone */}
      <Animatable.View animation="fadeIn" duration={600} delay={300}>
        <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
          DATA
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearData}
          >
            <Icon name="trash-2" size={20} color={theme.colors.error} />
            <Text style={[styles.dangerButtonText, { color: theme.colors.error }]}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {/* App Version */}
      <Animatable.View animation="fadeIn" duration={600} delay={400}>
        <Text
          style={[styles.versionText, { color: theme.colors.tertiaryText }]}
        >
          Version 1.0.0
        </Text>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default SettingsScreen;