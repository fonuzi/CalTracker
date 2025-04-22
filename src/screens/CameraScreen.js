import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

// Import custom components and services
import FoodAnalysisResult from '../components/FoodAnalysisResult';
import { analyzeFoodImage, analyzeFoodText } from '../services/OpenAIService';
import { saveFoodLog } from '../services/StorageService';
import { suggestMealTypeByTime, formatFoodData } from '../utils/foodAnalysis';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation }) => {
  const theme = useTheme();
  const cameraRef = useRef(null);
  
  // State for camera
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  
  // State for analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // State for manual entry
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualText, setManualText] = useState('');
  
  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Function to optimize image for API request
  const optimizeImage = async (uri) => {
    try {
      // Get file info to check size
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log(`Original image size: ${Math.round(fileInfo.size / 1024)} KB`);
      
      // If image is already small enough, return the original URI
      if (fileInfo.size < 1000000) { // Less than 1MB
        return uri;
      }
      
      // Calculate target size based on original size to maintain reasonable quality
      let targetQuality = 0.7;
      if (fileInfo.size > 5000000) { // > 5MB
        targetQuality = 0.4;
      } else if (fileInfo.size > 2000000) { // > 2MB
        targetQuality = 0.5;
      }
      
      // Create a new filename for the compressed image
      const newUri = FileSystem.documentDirectory + 
        `compressed_${Date.now()}.jpg`;
      
      // Compress/resize the image using FileSystem API
      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
        copyOptions: {
          quality: targetQuality
        }
      });
      
      // Verify the new file size
      const newFileInfo = await FileSystem.getInfoAsync(newUri);
      console.log(`Optimized image size: ${Math.round(newFileInfo.size / 1024)} KB`);
      
      return newUri;
    } catch (error) {
      console.error('Error optimizing image:', error);
      // Return original URI if optimization fails
      return uri;
    }
  };

  // Function to handle taking a picture
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ 
          quality: 0.8, 
          exif: false // Don't include EXIF data to reduce size
        });
        setCapturedImage(photo.uri);
        
        // Optimize the image before sending for analysis
        const optimizedUri = await optimizeImage(photo.uri);
        analyzeImage(optimizedUri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };
  
  // Function to pick an image from the gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setCapturedImage(selectedImage.uri);
        
        // Optimize the image before sending for analysis
        const optimizedUri = await optimizeImage(selectedImage.uri);
        analyzeImage(optimizedUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  // Function to analyze the captured image
  const analyzeImage = async (imageUri) => {
    setIsAnalyzing(true);
    
    try {
      // Check if image URI exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found.');
      }
      
      const result = await analyzeFoodImage(imageUri);
      
      // Format the result
      const formattedResult = formatFoodData({
        ...result,
        mealType: suggestMealTypeByTime(),
        timestamp: new Date().toISOString(),
      });
      
      setAnalysisResult(formattedResult);
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      // Detailed error handling
      if (error.message && error.message.includes('OpenAI')) {
        Alert.alert(
          'API Error',
          'There was an error connecting to our AI service. Please check your internet connection and try again.',
          [
            { text: 'Try Again', onPress: () => analyzeImage(imageUri) },
            { text: 'Enter Manually', onPress: () => setShowManualEntry(true) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else if (error.message && error.message.includes('network')) {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [
            { text: 'Try Again', onPress: () => analyzeImage(imageUri) },
            { text: 'Enter Manually', onPress: () => setShowManualEntry(true) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'Analysis Failed',
          'There was an error analyzing your food. Please try again or enter details manually.',
          [
            { text: 'Try Again', onPress: () => analyzeImage(imageUri) },
            { text: 'Enter Manually', onPress: () => setShowManualEntry(true) },
            { text: 'Cancel', style: 'cancel', onPress: () => setCapturedImage(null) }
          ]
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to analyze manually entered text
  const analyzeText = async () => {
    if (!manualText.trim()) {
      Alert.alert('Error', 'Please enter a food description.');
      return;
    }
    
    setIsAnalyzing(true);
    setShowManualEntry(false); // Hide the modal while analyzing
    
    try {
      const result = await analyzeFoodText(manualText);
      
      // Format the result
      const formattedResult = formatFoodData({
        ...result,
        mealType: suggestMealTypeByTime(),
        timestamp: new Date().toISOString(),
      });
      
      setAnalysisResult(formattedResult);
    } catch (error) {
      console.error('Error analyzing text:', error);
      
      // Detailed error handling
      if (error.message && error.message.includes('OpenAI')) {
        Alert.alert(
          'API Error',
          'There was an error connecting to our AI service. Please check your internet connection and try again.',
          [
            { text: 'Try Again', onPress: () => {
              setShowManualEntry(true);
              setIsAnalyzing(false);
            }},
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else if (error.message && error.message.includes('network')) {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [
            { text: 'Try Again', onPress: () => {
              setShowManualEntry(true);
              setIsAnalyzing(false);
            }},
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'Analysis Failed',
          'There was an error analyzing your food description. Please try again with more details or different wording.',
          [
            { text: 'Try Again', onPress: () => {
              setShowManualEntry(true);
              setIsAnalyzing(false);
            }},
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } finally {
      // Only set isAnalyzing to false if we're not showing the manual entry again
      // (it will be set to false in the alert handlers if trying again)
      if (!showManualEntry) {
        setIsAnalyzing(false);
      }
    }
  };
  
  // Function to save the analyzed food to storage
  const saveFood = async () => {
    if (!analysisResult) return;
    
    try {
      await saveFoodLog(analysisResult);
      
      // Show success message and navigate back
      Alert.alert(
        'Food Logged',
        'Your food has been successfully logged.',
        [{ text: 'OK', onPress: () => navigation.navigate('Food Log') }]
      );
    } catch (error) {
      console.error('Error saving food:', error);
      Alert.alert('Error', 'Failed to save food log. Please try again.');
    }
  };
  
  // Function to cancel the analysis
  const cancelAnalysis = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };
  
  // Function to toggle camera type (front/back)
  const toggleCameraType = () => {
    setType(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };
  
  // Function to toggle flash
  const toggleFlash = () => {
    setFlash(
      flash === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };
  
  // If permission not granted
  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.permissionText, { color: theme.colors.text }]}>
          No access to camera
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }
  
  // If analyzing or showing results, show the appropriate screen
  if (isAnalyzing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {capturedImage && (
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        )}
        <View style={styles.analysisOverlay}>
          <Animatable.View 
            animation="pulse" 
            easing="ease-out" 
            iterationCount="infinite"
            style={styles.loadingIcon}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </Animatable.View>
          <Text style={[styles.analysingText, { color: theme.colors.text }]}>
            Analyzing your food...
          </Text>
          <Text style={[styles.analysingSubtext, { color: theme.colors.secondaryText }]}>
            Our AI is identifying nutritional information
          </Text>
        </View>
      </View>
    );
  }
  
  // If analysis result is available, show the result screen
  if (analysisResult) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.resultContainer}>
          <FoodAnalysisResult 
            foodData={analysisResult}
            onSave={saveFood}
            onAdjust={() => {/* TODO: Implement food adjustment */}}
            onCancel={cancelAnalysis}
          />
        </View>
      </View>
    );
  }
  
  // Render the camera screen
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={flash}
      >
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlash}
          >
            <Feather
              name={flash === Camera.Constants.FlashMode.on ? "zap" : "zap-off"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cameraOverlay}>
          <View style={styles.targetBox} />
        </View>
        
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickImage}
          >
            <Feather name="image" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => setShowManualEntry(true)}
          >
            <Feather name="edit" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
      
      {/* Modal for manual entry */}
      <Modal
        visible={showManualEntry}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowManualEntry(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: `${theme.colors.background}E6` }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Enter Food Details
            </Text>
            
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              placeholder="Describe your food here..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={4}
              value={manualText}
              onChangeText={setManualText}
            />
            
            <Text style={[styles.modalSubtext, { color: theme.colors.secondaryText }]}>
              Example: "A plate with grilled chicken breast, brown rice, and steamed broccoli"
            </Text>
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowManualEntry(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={analyzeText}
                style={styles.modalButton}
                disabled={!manualText.trim()}
              >
                Analyze
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetBox: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  manualButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  analysisOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingIcon: {
    marginBottom: 20,
  },
  analysingText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  analysingSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  textInput: {
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  modalSubtext: {
    fontSize: 14,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    borderColor: 'rgba(255,0,0,0.3)',
  },
});

export default CameraScreen;