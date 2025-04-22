import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

/**
 * A component to toggle between dark and light mode
 * @param {boolean} isDarkMode - Whether dark mode is currently enabled
 * @param {Function} onToggle - Function to call when the toggle is pressed
 */
const DarkModeToggle = ({ isDarkMode, onToggle }) => {
  const theme = useTheme();
  
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Dark Mode
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.toggle, 
            isDarkMode ? styles.toggleActive : styles.toggleInactive,
            { backgroundColor: isDarkMode ? theme.colors.primary + '30' : '#E5E7EB' }
          ]}
          onPress={onToggle}
          activeOpacity={0.8}
        >
          <View 
            style={[
              styles.toggleCircle, 
              isDarkMode ? styles.toggleCircleRight : styles.toggleCircleLeft,
              { backgroundColor: isDarkMode ? theme.colors.primary : '#9CA3AF' }
            ]}
          >
            <Feather 
              name={isDarkMode ? 'moon' : 'sun'} 
              size={12} 
              color="white" 
            />
          </View>
        </TouchableOpacity>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleActive: {},
  toggleInactive: {},
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCircleLeft: {
    alignSelf: 'flex-start',
  },
  toggleCircleRight: {
    alignSelf: 'flex-end',
  },
});

export default DarkModeToggle;