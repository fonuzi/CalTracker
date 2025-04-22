import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../assets/icons';

/**
 * A component to toggle between dark and light mode
 * @param {boolean} isDarkMode - Whether dark mode is currently enabled
 * @param {Function} onToggle - Function to call when the toggle is pressed
 */
const DarkModeToggle = ({ theme }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.isDark
            ? 'rgba(255, 255, 255, 0.2)'
            : 'rgba(0, 0, 0, 0.1)',
        },
      ]}
      onPress={theme.toggleTheme}
    >
      <Icon
        name={theme.isDark ? 'sun' : 'moon'}
        size={18}
        color={theme.isDark ? '#FFFFFF' : '#000000'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
});

export default DarkModeToggle;