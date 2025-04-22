import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Icon } from '../assets/icons';
import * as Animatable from 'react-native-animatable';
import { analyzeFoodImage, analyzeFoodText } from '../services/OpenAIService';
import { saveFoodLog } from '../services/StorageService';
import FoodAnalysisResult from '../components/FoodAnalysisResult';

const CameraScreen = ({ navigation, theme }) => {
  // State
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraMode, setCameraMode] = useState(true);
  const [textMode, setTextMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textProcessing, setTextProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  
  // Refs
  const cameraRef = useRef(null);
  
  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Handle mode switching
  const switchToCamera = () => {
    setTextMode(false);
    setCameraMode(true);
    setImagePreview(null);
    setAnalysisResult(null);
  };
  
  const switchToText = () => {
    setCameraMode(false);
    setTextMode(true);
    setImagePreview(null);
    setAnalysisResult(null);
    setTimeout(() => {
      textInputRef?.current?.focus?.();
    }, 100);
  };
  
  // Handle taking picture
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        setImagePreview(photo.uri);
        setCameraMode(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take a picture. Please try again.');
      }
    }
  };
  
  // Handle picking image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagePreview(result.assets[0].uri);
        setCameraMode(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };
  
  // Handle analyzing image
  const analyzeImage = async () => {
    if (!imagePreview) return;
    
    setImageProcessing(true);
    
    try {
      const result = await analyzeFoodImage(imagePreview);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze the image. Please try again.');
    } finally {
      setImageProcessing(false);
    }
  };
  
  // Handle analyzing text
  const analyzeText = async () => {
    if (!textInput.trim()) {
      Alert.alert('Error', 'Please enter a food description.');
      return;
    }
    
    setTextProcessing(true);
    Keyboard.dismiss();
    
    try {
      const result = await analyzeFoodText(textInput);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing text:', error);
      Alert.alert('Error', 'Failed to analyze the text. Please try again.');
    } finally {
      setTextProcessing(false);
    }
  };
  
  // Handle saving food log
  const saveFoodEntry = async (foodData) => {
    try {
      await saveFoodLog(foodData);
      
      // Navigate back to food log
      navigation.navigate('Food Log');
    } catch (error) {
      console.error('Error saving food log:', error);
      Alert.alert('Error', 'Failed to save food entry. Please try again.');
    }
  };
  
  // Handle adjusting food data
  const adjustFoodData = (updatedData) => {
    setAnalysisResult(updatedData);
  };
  
  // Handle canceling analysis
  const cancelAnalysis = () => {
    setAnalysisResult(null);
    
    if (textMode) {
      setTextInput('');
    } else {
      setImagePreview(null);
      setCameraMode(true);
    }
  };
  
  // Text input ref
  const textInputRef = useRef(null);
  
  // Check for camera permission
  if (hasPermission === null) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: theme.colors.background }]}>
        <Icon name="camera-off" size={50} color={theme.colors.error} style={styles.permissionIcon} />
        <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
          Camera Access Required
        </Text>
        <Text style={[styles.permissionText, { color: theme.colors.secondaryText }]}>
          Please grant permission to access your camera in order to take food pictures.
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Render analysis result if available
  if (analysisResult) {
    return (
      <FoodAnalysisResult
        foodData={analysisResult}
        onSave={saveFoodEntry}
        onAdjust={adjustFoodData}
        onCancel={cancelAnalysis}
        theme={theme}
      />
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardVerticalOffset={100}
    >
      {/* Mode switcher */}
      <View style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[
            styles.modeTab,
            cameraMode && styles.activeTab,
            {
              backgroundColor: cameraMode 
                ? theme.colors.primary
                : theme.colors.surfaceHighlight,
            }
          ]}
          onPress={switchToCamera}
        >
          <Icon
            name="camera"
            size={16}
            color={cameraMode ? "#FFFFFF" : theme.colors.text}
          />
          <Text
            style={[
              styles.modeText,
              { color: cameraMode ? "#FFFFFF" : theme.colors.text }
            ]}
          >
            Camera
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeTab,
            textMode && styles.activeTab,
            {
              backgroundColor: textMode 
                ? theme.colors.primary
                : theme.colors.surfaceHighlight,
            }
          ]}
          onPress={switchToText}
        >
          <Icon
            name="edit-2"
            size={16}
            color={textMode ? "#FFFFFF" : theme.colors.text}
          />
          <Text
            style={[
              styles.modeText,
              { color: textMode ? "#FFFFFF" : theme.colors.text }
            ]}
          >
            Text
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Camera mode */}
      {cameraMode && (
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            type={cameraType}
            ref={cameraRef}
            ratio="4:3"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setCameraType(
                    cameraType === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  )}
                >
                  <Icon name="refresh-cw" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={pickImage}
                >
                  <Icon name="image" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </Camera>
        </View>
      )}
      
      {/* Image preview */}
      {imagePreview && (
        <View style={styles.previewContainer}>
          <Animatable.Image
            source={{ uri: imagePreview }}
            style={styles.previewImage}
            animation="fadeIn"
            duration={500}
          />
          
          <View style={styles.previewControls}>
            {imageProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.processingText, { color: theme.colors.text }]}>
                  Analyzing image...
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.previewButton, { backgroundColor: theme.colors.surfaceHighlight }]}
                  onPress={() => {
                    setImagePreview(null);
                    setCameraMode(true);
                  }}
                >
                  <Icon name="x" size={18} color={theme.colors.text} />
                  <Text style={[styles.previewButtonText, { color: theme.colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.previewButton, { backgroundColor: theme.colors.primary }]}
                  onPress={analyzeImage}
                >
                  <Icon name="check" size={18} color="#FFFFFF" />
                  <Text style={[styles.previewButtonText, { color: "#FFFFFF" }]}>
                    Analyze
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
      
      {/* Text mode */}
      {textMode && (
        <ScrollView 
          style={styles.textContainer}
          contentContainerStyle={styles.textContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.textTitle, { color: theme.colors.text }]}>
            Describe the food
          </Text>
          <Text style={[styles.textSubtitle, { color: theme.colors.secondaryText }]}>
            Include portion sizes and preparation methods for more accurate results.
          </Text>
          
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput,
              { 
                backgroundColor: theme.colors.surfaceHighlight,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }
            ]}
            placeholder="E.g. Grilled chicken breast, 6oz, with steamed broccoli and 1/2 cup of brown rice"
            placeholderTextColor={theme.colors.placeholder}
            value={textInput}
            onChangeText={setTextInput}
            multiline
            autoFocus
          />
          
          <View style={styles.textControls}>
            {textProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.processingText, { color: theme.colors.text }]}>
                  Analyzing...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.analyzeTextButton,
                  { 
                    backgroundColor: theme.colors.primary,
                    opacity: textInput.trim() ? 1 : 0.7
                  }
                ]}
                onPress={analyzeText}
                disabled={!textInput.trim()}
              >
                <Text style={styles.analyzeTextButtonText}>
                  Analyze Food
                </Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.textExamples}>
              <Text style={[styles.examplesTitle, { color: theme.colors.secondaryText }]}>
                Examples:
              </Text>
              {[
                "Two eggs with whole wheat toast and avocado",
                "Protein smoothie with banana, 1 scoop protein powder, and almond milk",
                "Large Chicken Caesar salad with light dressing"
              ].map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.exampleItem, { backgroundColor: theme.colors.surfaceHighlight }]}
                  onPress={() => setTextInput(example)}
                >
                  <Text 
                    style={[styles.exampleText, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {example}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modeSwitcher: {
    flexDirection: 'row',
    padding: 16,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    // Styles for active tab
  },
  modeText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    marginTop: 10,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  cameraButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: 'white',
  },
  previewContainer: {
    flex: 1,
    marginTop: 10,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flex: 0.48,
    justifyContent: 'center',
  },
  previewButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
  },
  processingText: {
    marginLeft: 8,
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
    marginTop: 10,
  },
  textContentContainer: {
    padding: 16,
  },
  textTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  textControls: {
    marginTop: 20,
  },
  analyzeTextButton: {
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzeTextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  textExamples: {
    marginTop: 10,
  },
  examplesTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  exampleItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
  },
});

export default CameraScreen;