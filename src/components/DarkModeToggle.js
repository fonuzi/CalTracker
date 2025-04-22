import React from 'react';
import { TouchableOpacity, StyleSheet, View, Animated } from 'react-native';
import { Icon } from '../assets/icons';

/**
 * A component to toggle between dark and light mode
 * @param {boolean} isDarkMode - Whether dark mode is currently enabled
 * @param {Function} onToggle - Function to call when the toggle is pressed
 */
const DarkModeToggle = ({ isDarkMode, onToggle, style }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isDarkMode ? styles.darkMode : styles.lightMode,
        style
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[
        styles.handle,
        isDarkMode ? styles.handleRight : styles.handleLeft
      ]}>
        <Icon 
          name={isDarkMode ? 'moon' : 'sun'} 
          size={16}
          color={isDarkMode ? '#FFFFFF' : '#FFC107'}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 30,
    borderRadius: 15,
    padding: 4,
  },
  darkMode: {
    backgroundColor: '#1E1E1E',
    borderColor: '#4A80F0',
    borderWidth: 1,
  },
  lightMode: {
    backgroundColor: '#F0F3F9',
    borderColor: '#E5E5E5',
    borderWidth: 1,
  },
  handle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleLeft: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  handleRight: {
    backgroundColor: '#121212',
    alignSelf: 'flex-end',
  },
});

export default DarkModeToggle;