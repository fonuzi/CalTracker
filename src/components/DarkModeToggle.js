import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';

/**
 * A component to toggle between dark and light mode
 * @param {boolean} isDarkMode - Whether dark mode is currently enabled
 * @param {Function} onToggle - Function to call when the toggle is pressed
 */
const DarkModeToggle = ({ isDarkMode, onToggle, theme }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Animatable.View
        animation={isDarkMode ? 'fadeIn' : 'fadeOut'}
        duration={300}
        style={[styles.iconContainer, styles.darkIcon, { opacity: isDarkMode ? 1 : 0 }]}
      >
        <Icon name="moon" size={18} color="#FFFFFF" />
      </Animatable.View>
      
      <Animatable.View
        animation={!isDarkMode ? 'fadeIn' : 'fadeOut'}
        duration={300}
        style={[styles.iconContainer, styles.lightIcon, { opacity: !isDarkMode ? 1 : 0 }]}
      >
        <Icon name="sun" size={18} color="#FFFFFF" />
      </Animatable.View>
      
      <Animatable.View
        animation={isDarkMode ? 'slideInRight' : 'slideInLeft'}
        duration={300}
        style={[
          styles.toggle,
          {
            transform: [{ translateX: isDarkMode ? 28 : 0 }],
            backgroundColor: isDarkMode ? '#2C2C2E' : '#FFDE59',
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 32,
    borderRadius: 16,
    padding: 2,
    flexDirection: 'row',
    position: 'relative',
    borderWidth: 1,
  },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    top: 1,
    left: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 1,
    zIndex: 1,
  },
  darkIcon: {
    right: 1,
  },
  lightIcon: {
    left: 1,
  },
});

export default DarkModeToggle;