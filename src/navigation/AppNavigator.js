import React, { useContext } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserContext } from '../context/UserContext';
import { Icon } from '../assets/icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FoodLogScreen from '../screens/FoodLogScreen';
import CameraScreen from '../screens/CameraScreen';
import StepTrackingScreen from '../screens/StepTrackingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DarkModeToggle from '../components/DarkModeToggle';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
const TabNavigator = ({ theme }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Food Log') {
            iconName = 'book';
          } else if (route.name === 'Camera') {
            iconName = 'camera';
          } else if (route.name === 'Activity') {
            iconName = 'activity';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: 'Dashboard',
          headerRight: () => <DarkModeToggle theme={theme} />,
        }}
      >
        {(props) => <HomeScreen {...props} theme={theme} />}
      </Tab.Screen>
      
      <Tab.Screen
        name="Food Log"
      >
        {(props) => <FoodLogScreen {...props} theme={theme} />}
      </Tab.Screen>
      
      <Tab.Screen
        name="Camera"
        options={{
          tabBarButton: (props) => (
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 4,
              }}
              {...props}
            >
              <Icon name="camera" size={30} color="#FFFFFF" />
            </View>
          ),
        }}
      >
        {(props) => <CameraScreen {...props} theme={theme} />}
      </Tab.Screen>
      
      <Tab.Screen
        name="Activity"
      >
        {(props) => <StepTrackingScreen {...props} theme={theme} />}
      </Tab.Screen>
      
      <Tab.Screen
        name="Settings"
      >
        {(props) => <SettingsScreen {...props} theme={theme} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = ({ theme }) => {
  const { userProfile } = useContext(UserContext);
  const isOnboarded = userProfile?.onboardingCompleted;
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      >
        {isOnboarded ? (
          <>
            <Stack.Screen
              name="Main"
              options={{ headerShown: false }}
            >
              {() => <TabNavigator theme={theme} />}
            </Stack.Screen>
            
            <Stack.Screen
              name="Profile"
            >
              {(props) => <ProfileScreen {...props} theme={theme} />}
            </Stack.Screen>
            
            <Stack.Screen
              name="Add Food"
              options={{
                presentation: 'modal',
              }}
            >
              {(props) => <CameraScreen {...props} theme={theme} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen
            name="Onboarding"
            options={{ headerShown: false }}
          >
            {() => <OnboardingScreen theme={theme} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;