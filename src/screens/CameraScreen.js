import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '../assets/icons';
import { analyzeFoodImage, analyzeFoodText } from '../services/OpenAIService';
import FoodAnalysisResult from '../components/FoodAnalysisResult';
import { saveFoodLog } from '../services/StorageService';
import { suggestMealTypeByTime } from '../utils/foodAnalysis';

const CameraScreen = ({ navigation, theme }) => {
  // State for camera and permissions
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [capturedImage, setCapturedImage] = useState(null);
  
  // State for food analysis
  const [foodDescription, setFoodDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'text'
  
  // Camera reference
  const cameraRef = useRef(null);
  
  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Handle image capture
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
        await analyzeFood(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };
  
  // Handle gallery image selection
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
        await analyzeFood(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  // Analyze food from image
  const analyzeFood = async (imageUri) => {
    try {
      setIsAnalyzing(true);
      
      // Call OpenAI API to analyze food from image
      const result = await analyzeFoodImage(imageUri);
      
      // Set result and clear loading state
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing food:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Analyze food from text description
  const analyzeFoodFromText = async () => {
    if (!foodDescription) return;
    
    try {
      setIsAnalyzing(true);
      
      // Call OpenAI API to analyze food from text
      const result = await analyzeFoodText(foodDescription);
      
      // Set result and clear loading state
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing food from text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Save food to log
  const saveFood = async (food) => {
    try {
      // Make sure food has a date
      if (!food.date) {
        food.date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      }
      
      // Set meal type if not present
      if (!food.mealType) {
        food.mealType = suggestMealTypeByTime();
      }
      
      // Save to storage
      await saveFoodLog(food);
      
      // Clear states
      setAnalysisResult(null);
      setCapturedImage(null);
      setFoodDescription('');
      
      // Navigate to food log
      navigation.navigate('Food Log');
    } catch (error) {
      console.error('Error saving food:', error);
    }
  };
  
  // Handle adjustment of analysis
  const adjustAnalysis = () => {
    // Navigate to adjustment screen or show modal (for now, just clear result)
    setAnalysisResult(null);
  };
  
  // Reset states
  const resetAnalysis = () => {
    setAnalysisResult(null);
    setCapturedImage(null);
    setFoodDescription('');
  };
  
  // Toggle camera type
  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };
  
  // Switch between camera and text input
  const switchToTab = (tab) => {
    setActiveTab(tab);
    resetAnalysis();
  };
  
  // Render camera view
  const renderCamera = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.cameraContainer}>
          <Text style={[styles.permissionText, { color: theme.colors.text }]}>
            Requesting camera permission...
          </Text>
        </View>
      );
    }
    
    if (hasPermission === false) {
      return (
        <View style={styles.cameraContainer}>
          <Text style={[styles.permissionText, { color: theme.colors.text }]}>
            Camera access denied. Please enable camera permissions to use this feature.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={pickImage}
          >
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (capturedImage) {
      return (
        <View style={styles.cameraContainer}>
          <Image 
            source={{ uri: capturedImage }} 
            style={styles.capturedImage}
          />
        </View>
      );
    }
    
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          ratio="4:3"
        >
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.cameraControl}
              onPress={toggleCameraType}
            >
              <Icon name="refresh-cw" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureCircle} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cameraControl}
              onPress={pickImage}
            >
              <Icon name="image" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  };
  
  // Render text input view
  const renderTextInput = () => {
    return (
      <View style={styles.textInputContainer}>
        <Text style={[styles.textInputLabel, { color: theme.colors.text }]}>
          Describe the food you ate
        </Text>
        <TextInput
          style={[
            styles.textInput,
            { 
              color: theme.colors.text,
              backgroundColor: theme.colors.surfaceHighlight,
              borderColor: theme.colors.border
            }
          ]}
          placeholder="E.g., Grilled chicken salad with olive oil dressing and avocado"
          placeholderTextColor={theme.colors.placeholder}
          value={foodDescription}
          onChangeText={setFoodDescription}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            { 
              backgroundColor: theme.colors.primary,
              opacity: foodDescription ? 1 : 0.5 
            }
          ]}
          onPress={analyzeFoodFromText}
          disabled={!foodDescription || isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="search" size={20} color="#FFFFFF" style={styles.analyzeIcon} />
              <Text style={styles.analyzeButtonText}>
                Analyze Food
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'camera' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => switchToTab('camera')}
        >
          <Icon
            name="camera"
            size={20}
            color={activeTab === 'camera' ? theme.colors.primary : theme.colors.secondaryText}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'camera' ? theme.colors.primary : theme.colors.secondaryText }
            ]}
          >
            Camera
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'text' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => switchToTab('text')}
        >
          <Icon
            name="edit-3"
            size={20}
            color={activeTab === 'text' ? theme.colors.primary : theme.colors.secondaryText}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'text' ? theme.colors.primary : theme.colors.secondaryText }
            ]}
          >
            Text
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Content based on active tab and analysis state */}
        {analysisResult ? (
          <FoodAnalysisResult
            foodData={analysisResult}
            onSave={saveFood}
            onAdjust={adjustAnalysis}
            onCancel={resetAnalysis}
            theme={theme}
          />
        ) : (
          <>
            {activeTab === 'camera' ? renderCamera() : renderTextInput()}
            
            {isAnalyzing && (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.analyzingText, { color: theme.colors.text }]}>
                  Analyzing your food...
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  camera: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  cameraControl: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  textInputContainer: {
    padding: 20,
  },
  textInputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  textInput: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  analyzeIcon: {
    marginRight: 8,
  },
  analyzingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CameraScreen;