import React, { useState } from 'react';
import { 
  View, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Image, 
  Platform,
  Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileImageModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  onImageUpdate: (newImageUrl: string) => void;
}

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({
  isVisible,
  onClose,
  currentImageUrl,
  onImageUpdate
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to select a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', // Changed from MediaType.Images
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (!result.canceled) {
        // Verify the image dimensions before proceeding
        const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
          Image.getSize(result.assets[0].uri, (width, height) => {
            resolve({ width, height });
          });
        });

        if (width > 1200 || height > 1200) {
          Alert.alert(
            'Image Too Large',
            'Please select an image smaller than 1200x1200 pixels.'
          );
          return;
        }

        setSelectedImage(result.assets[0].uri);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const validateImageFile = (uri: string) => {
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const extension = uri.split('.').pop()?.toLowerCase();
    
    if (!extension || !validExtensions.includes(extension)) {
      throw new Error('Invalid file type. Please select a JPG or PNG image.');
    }

    return extension;
  };

  const createFormData = async (uri: string, fileType: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Reduced max size to 2MB
      if (blob.size > 2 * 1024 * 1024) {
        throw new Error('Image size too large. Please select an image under 2MB.');
      }

      const fileName = `profile_image_${Date.now()}.${fileType}`;
      
      console.log('Creating form data:', {
        fileName,
        fileType,
        fileSize: blob.size,
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      });

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: fileName,
        type: `image/${fileType}`,
      } as any);

      return formData;
    } catch (error:any) {
      throw new Error(`Error preparing image: ${error.message}`);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('Using token ending with:', token.slice(-4));

      const fileType = validateImageFile(selectedImage);
      const formData = await createFormData(selectedImage, fileType);

      // Actual upload request
      const uploadResponse = await axios.post(
        'https://affiliate-api.affworld.io/api/affiliates/update_profile_image',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          timeout: 30000,
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.loaded / (progressEvent.total ?? 1);
            setUploadProgress(Math.round(progress * 100));
          },
          validateStatus: (status) => {
            console.log('Response status:', status);
            return status >= 200 && status < 300;
          }
        }
      );

      console.log('Upload response:', {
        status: uploadResponse.status,
        data: uploadResponse.data,
        headers: uploadResponse.headers
      });

      if (uploadResponse.data?.image_url) {
        onImageUpdate(uploadResponse.data.image_url);
        onClose();
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        request: {
          method: error.config?.method,
          url: error.config?.url,
          headers: error.config?.headers,
        }
      };
      
      console.error('Detailed upload error:', JSON.stringify(errorDetails, null, 2));

      let errorMessage = 'Failed to upload image. ';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
            console.log("Error 500?",errorMessage);
            
          errorMessage += 'The server encountered an error. Please try again later or contact support if the problem persists.';
        } else if (error.code === 'ECONNABORTED') {
          errorMessage += 'Request timed out. Please check your internet connection.';
        } else if (error.response) {
          errorMessage += `Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`;
        } else if (error.request) {
          errorMessage += 'No response from server. Please check your internet connection.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += error.message;
      }

      Alert.alert(
        'Upload Failed', 
        errorMessage,
        [
          { 
            text: 'OK',
            onPress: () => setIsUploading(false)
          },
          {
            text: 'Try Again',
            onPress: () => {
              setIsUploading(false);
              uploadImage();
            }
          }
        ]
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>
            {currentImageUrl ? 'Update Profile Picture' : 'Add Profile Picture'}
          </Text>

          <View style={styles.imagePreviewContainer}>
            {(selectedImage || currentImageUrl) ? (
              <Image
                source={{ uri: selectedImage || currentImageUrl }}
                style={styles.imagePreview}
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <MaterialCommunityIcons name="camera" size={40} color="#666" />
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}
          </View>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
              <Text style={styles.progressText}>{uploadProgress}%</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.selectButton} 
            onPress={pickImage}
            disabled={isUploading}
          >
            <MaterialCommunityIcons name="image-plus" size={24} color="#fff" />
            <Text style={styles.buttonText}>
              {currentImageUrl ? 'Change Picture' : 'Select Picture'}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <TouchableOpacity 
              style={[
                styles.uploadButton, 
                isUploading && styles.uploadingButton
              ]} 
              onPress={uploadImage}
              disabled={isUploading}
            >
              <MaterialCommunityIcons 
                name={isUploading ? "loading" : "cloud-upload"} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.buttonText}>
                {isUploading ? 'Uploading...' : 'Upload Picture'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  imagePreviewContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    marginTop: 10,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  uploadingButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  progressContainer: {
    width: '80%',
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#000',
    fontSize: 12,
    lineHeight: 20,
  },
});

export default ProfileImageModal;