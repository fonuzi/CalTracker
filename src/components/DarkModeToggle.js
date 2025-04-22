import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
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
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Dark Mode
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
            {isDarkMode ? 'On' : 'Off'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            { 
              backgroundColor: isDarkMode 
                ? theme.colors.primary 
                : theme.colors.disabled 
            }
          ]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View 
            style={[
              styles.toggleCircle, 
              { 
                transform: [{ translateX: isDarkMode ? 22 : 0 }] 
              }
            ]}
          >
            <Feather 
              name={isDarkMode ? 'moon' : 'sun'} 
              size={16} 
              color={isDarkMode ? '#5E60CE' : '#FCBF49'} 
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
    overflow: 'hidden',
    elevation: 2,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    padding: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DarkModeToggle;