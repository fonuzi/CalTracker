import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { analyzeFoodImage, analyzeFoodText } from '../services/OpenAIService';
import { formatFoodData } from '../utils/foodAnalysis';
import { saveFoodLog } from '../services/StorageService';
import { suggestMealTypeByTime } from '../utils/foodAnalysis';
import { Icon } from '../assets/icons';
import FoodAnalysisResult from '../components/FoodAnalysisResult';
import * as Animatable from 'react-native-animatable';

const CameraScreen = ({ navigation, theme }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foodData, setFoodData] = useState(null);
  const cameraRef = useRef(null);
  
  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Handle camera ready status
  const onCameraReady = () => {
    setIsCameraReady(true);
  };
  
  // Toggle camera type (front/back)
  const toggleCameraType = () => {
    setType(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };
  
  // Toggle flash mode
  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };
  
  // Take a picture
  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        setIsLoading(true);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        
        // Analyze the image with OpenAI
        const result = await analyzeFoodImage(photo.uri);
        
        // Format results
        setFoodData(result);
      } catch (error) {
        console.error('Error taking picture:', error);
        alert('Error analyzing food. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Pick an image from the gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsLoading(true);
        
        // Analyze the image with OpenAI
        const analysis = await analyzeFoodImage(result.assets[0].uri);
        
        // Format results
        setFoodData(analysis);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error analyzing food. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Analyze text input
  const analyzeText = async () => {
    if (!textInput.trim()) {
      alert('Please enter a food description.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Analyze text with OpenAI
      const result = await analyzeFoodText(textInput);
      
      // Format results
      setFoodData(result);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Error analyzing food. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save food log entry and navigate back
  const handleSaveFood = async (food) => {
    try {
      // Add meal type and timestamp if not already present
      const completeFood = {
        ...food,
        mealType: food.mealType || suggestMealTypeByTime(),
        timestamp: food.timestamp || new Date().toISOString(),
      };
      
      // Format the food data to ensure proper structure
      const formattedFood = formatFoodData(completeFood);
      
      // Save to storage
      await saveFoodLog(formattedFood);
      
      // Navigate back or to the food log
      navigation.navigate('Food Log');
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Error saving food. Please try again.');
    }
  };
  
  // Cancel analysis and reset
  const handleCancel = () => {
    setFoodData(null);
    setTextInput('');
  };
  
  // Toggle between camera and text input
  const toggleInputMode = () => {
    setIsTextMode(!isTextMode);
    setFoodData(null);
  };
  
  // If the user hasn't granted permission yet
  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.permissionText, { color: theme.colors.text }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }
  
  // If the user denied permission
  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Icon name="camera-off" size={48} color={theme.colors.error} />
        <Text style={[styles.permissionText, { color: theme.colors.text }]}>
          No access to camera. Please enable camera access in your device settings.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={pickImage}
        >
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={toggleInputMode}
        >
          <Text style={styles.buttonText}>Enter Food Description</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Food analysis result modal */}
      {foodData && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!foodData}
          onRequestClose={handleCancel}
        >
          <FoodAnalysisResult
            foodData={foodData}
            onSave={handleSaveFood}
            onCancel={handleCancel}
            theme={theme}
          />
        </Modal>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Analyzing your food...
          </Text>
        </View>
      )}
      
      {isTextMode ? (
        /* Text input mode */
        <KeyboardAvoidingView
          style={{ flex: 1, width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.textInputContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <Text style={[styles.textInputTitle, { color: theme.colors.text }]}>
              Describe Your Food
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
              placeholder="Ex: A grilled chicken salad with mixed greens, cherry tomatoes, and balsamic vinaigrette"
              placeholderTextColor={theme.colors.placeholder}
              value={textInput}
              onChangeText={setTextInput}
              multiline
              autoFocus
            />
            
            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: theme.colors.primary }]}
              onPress={analyzeText}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Analyze Food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { borderColor: theme.colors.primary, marginTop: 10 },
              ]}
              onPress={toggleInputMode}
            >
              <Icon name="camera" size={16} color={theme.colors.primary} style={styles.toggleIcon} />
              <Text style={[styles.toggleButtonText, { color: theme.colors.primary }]}>
                Switch to Camera
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* Camera mode */
        <>
          <Camera
            style={styles.camera}
            type={type}
            flashMode={flashMode}
            onCameraReady={onCameraReady}
            ref={cameraRef}
          >
            <View style={styles.cameraButtonsContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleFlashMode}
              >
                <Icon
                  name={flashMode === Camera.Constants.FlashMode.on ? 'zap' : 'zap-off'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.iconButton} onPress={toggleCameraType}>
                <Icon name="refresh-cw" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Camera>
          
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Icon name="image" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={!isCameraReady || isLoading}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.textButton} onPress={toggleInputMode}>
              <Icon name="type" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraButtonsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  textInputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  textInput: {
    width: '100%',
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    marginTop: 20,
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleIcon: {
    marginRight: 8,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '80%',
  },
});

export default CameraScreen;