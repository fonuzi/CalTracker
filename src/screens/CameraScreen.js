import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';
import { analyzeFoodImage, analyzeFoodText } from '../services/OpenAIService';
import { saveFoodLog } from '../services/StorageService';
import FoodAnalysisResult from '../components/FoodAnalysisResult';
import { suggestMealTypeByTime } from '../utils/foodAnalysis';

const CameraScreen = ({ navigation, theme }) => {
  // Camera/permission state
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);
  
  // UI state
  const [mode, setMode] = useState('camera'); // 'camera', 'text', 'result'
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  // Result state
  const [foodData, setFoodData] = useState(null);
  
  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        setHasPermission(true);
        // On web, default to text input mode since camera access might be limited
        setMode('text');
        return;
      }
      
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Take picture handler
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        
        // Analyze food image
        await analyzeFood('image', photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to capture image. Please try again.');
        setLoading(false);
      }
    }
  };
  
  // Select image from gallery
  const pickImage = async () => {
    try {
      setLoading(true);
      
      // Request permissions if needed
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
          setLoading(false);
          return;
        }
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Analyze food image
        await analyzeFood('image', result.assets[0].uri);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      setLoading(false);
    }
  };
  
  // Submit text description
  const analyzeTextInput = async () => {
    if (!textInput.trim()) {
      Alert.alert('Error', 'Please enter a food description.');
      return;
    }
    
    try {
      setLoading(true);
      await analyzeFood('text', textInput);
    } catch (error) {
      console.error('Error analyzing text:', error);
      Alert.alert('Error', 'Failed to analyze text. Please try again.');
      setLoading(false);
    }
  };
  
  // Analyze food (image or text)
  const analyzeFood = async (method, input) => {
    try {
      // Call appropriate analysis method
      const result = method === 'image'
        ? await analyzeFoodImage(input)
        : await analyzeFoodText(input);
      
      // Set food data and show result
      setFoodData(result);
      setMode('result');
    } catch (error) {
      console.error(`Error analyzing food ${method}:`, error);
      Alert.alert('Error', `Failed to analyze food ${method}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Save food data to log
  const handleSaveFood = async (adjustedData) => {
    try {
      setLoading(true);
      
      // Use adjusted data if provided, otherwise use the original
      const dataToSave = adjustedData || foodData;
      
      // Make sure we have a timestamp and meal type
      if (!dataToSave.timestamp) {
        dataToSave.timestamp = new Date().toISOString();
      }
      
      if (!dataToSave.mealType) {
        dataToSave.mealType = suggestMealTypeByTime();
      }
      
      // Save to storage
      await saveFoodLog(dataToSave);
      
      // Navigate to food log
      navigation.navigate('Food Log');
    } catch (error) {
      console.error('Error saving food data:', error);
      Alert.alert('Error', 'Failed to save food data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel and go back to camera/text input
  const handleCancel = () => {
    setFoodData(null);
    setMode(Platform.OS === 'web' ? 'text' : 'camera');
  };
  
  // Toggle between camera and text input
  const toggleMode = () => {
    setMode(mode === 'camera' ? 'text' : 'camera');
  };
  
  // Flip camera
  const flipCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };
  
  // Loading indicator
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: theme.colors.text, marginTop: 20 },
          ]}
        >
          {mode === 'result' ? 'Saving...' : 'Analyzing...'}
        </Text>
      </View>
    );
  }
  
  // Camera permission not granted
  if (hasPermission === false && mode === 'camera') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.permissionText, { color: theme.colors.text }]}>
          No access to camera
        </Text>
        <TouchableOpacity
          style={[
            styles.permissionButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setMode('text')}
        >
          <Text style={styles.permissionButtonText}>
            Use Text Input Instead
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Results screen
  if (mode === 'result' && foodData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <FoodAnalysisResult
          foodData={foodData}
          onSave={handleSaveFood}
          onCancel={handleCancel}
          theme={theme}
        />
      </View>
    );
  }
  
  // Text input mode
  if (mode === 'text') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Describe Your Food
          </Text>
          {Platform.OS !== 'web' && (
            <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
              <Icon name="camera" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView
          style={styles.textContainer}
          contentContainerStyle={styles.textContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animatable.View animation="fadeIn" duration={500}>
            <Text style={[styles.textTitle, { color: theme.colors.text }]}>
              What did you eat?
            </Text>
            <Text
              style={[
                styles.textDescription,
                { color: theme.colors.secondaryText },
              ]}
            >
              Describe your meal in detail for the most accurate analysis
            </Text>
            
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="e.g. A bowl of oatmeal with banana, blueberries, and a tablespoon of almond butter"
              placeholderTextColor={theme.colors.placeholder}
              value={textInput}
              onChangeText={setTextInput}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: textInput.trim() ? 1 : 0.7,
                },
              ]}
              onPress={analyzeTextInput}
              disabled={!textInput.trim()}
            >
              <Icon name="search" size={20} color="#FFFFFF" style={styles.analyzeButtonIcon} />
              <Text style={styles.analyzeButtonText}>Analyze Food</Text>
            </TouchableOpacity>
            
            <View style={styles.textTipsContainer}>
              <Text
                style={[styles.textTipsTitle, { color: theme.colors.text }]}
              >
                Tips for better results:
              </Text>
              <View style={styles.textTip}>
                <Icon name="check" size={16} color={theme.colors.success} style={styles.textTipIcon} />
                <Text
                  style={[
                    styles.textTipText,
                    { color: theme.colors.secondaryText },
                  ]}
                >
                  Include portion sizes (e.g., 1 cup, 3 oz)
                </Text>
              </View>
              <View style={styles.textTip}>
                <Icon name="check" size={16} color={theme.colors.success} style={styles.textTipIcon} />
                <Text
                  style={[
                    styles.textTipText,
                    { color: theme.colors.secondaryText },
                  ]}
                >
                  Specify cooking methods (e.g., grilled, baked)
                </Text>
              </View>
              <View style={styles.textTip}>
                <Icon name="check" size={16} color={theme.colors.success} style={styles.textTipIcon} />
                <Text
                  style={[
                    styles.textTipText,
                    { color: theme.colors.secondaryText },
                  ]}
                >
                  Mention brands for packaged foods
                </Text>
              </View>
            </View>
          </Animatable.View>
        </ScrollView>
      </View>
    );
  }
  
  // Camera mode
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        // Web doesn't support Camera, so we show a message
        <View style={[styles.cameraContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.webCameraText, { color: theme.colors.text }]}>
            Camera not available on web
          </Text>
          <TouchableOpacity
            style={[styles.webUploadButton, { backgroundColor: theme.colors.primary }]}
            onPress={pickImage}
          >
            <Icon name="upload" size={24} color="#FFFFFF" style={styles.webUploadIcon} />
            <Text style={styles.webUploadText}>Upload Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Native camera view
        <Camera
          style={styles.cameraContainer}
          type={cameraType}
          ref={cameraRef}
          ratio="4:3"
        >
          <View style={styles.cameraContent}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
                <Icon name="refresh-cw" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cameraFooter}>
              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                <Icon name="image" size={30} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.textModeButton}
                onPress={toggleMode}
              >
                <Icon name="type" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  toggleButton: {
    padding: 8,
  },
  // Camera mode styles
  cameraContainer: {
    flex: 1,
  },
  cameraContent: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  flipButton: {
    padding: 8,
  },
  cameraFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 30,
  },
  galleryButton: {
    padding: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
  },
  textModeButton: {
    padding: 10,
  },
  // Text mode styles
  textContainer: {
    flex: 1,
  },
  textContentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  textTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  analyzeButtonIcon: {
    marginRight: 10,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textTipsContainer: {
    marginTop: 30,
  },
  textTipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  textTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  textTipIcon: {
    marginRight: 10,
  },
  textTipText: {
    fontSize: 14,
  },
  // Web camera placeholder
  webCameraText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  webUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    marginHorizontal: 50,
  },
  webUploadIcon: {
    marginRight: 10,
  },
  webUploadText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Permission styles
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  permissionButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 50,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading styles
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CameraScreen;