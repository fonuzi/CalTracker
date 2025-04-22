import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../assets/icons';

/**
 * A component to toggle between dark and light mode
 * @param {boolean} isDarkMode - Whether dark mode is currently enabled
 * @param {Function} onToggle - Function to call when the toggle is pressed
 */
const DarkModeToggle = ({ isDarkMode, onToggle, theme }) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconTextContainer}>
          <Icon
            name={isDarkMode ? 'moon' : 'sun'}
            size={20}
            color={isDarkMode ? '#8E7CFF' : '#FF9F43'}
          />
          <Text style={[styles.modeText, { color: theme.colors.text }]}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
        
        <View
          style={[
            styles.toggleContainer,
            {
              backgroundColor: isDarkMode ? '#333333' : '#E0E0E0',
            },
          ]}
        >
          <View
            style={[
              styles.toggleCircle,
              {
                backgroundColor: isDarkMode ? '#8E7CFF' : '#FF9F43',
                transform: [
                  { translateX: isDarkMode ? 22 : 0 },
                ],
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  toggleContainer: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 3,
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});

export default DarkModeToggle;