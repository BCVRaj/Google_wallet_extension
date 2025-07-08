import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useReceiptStore } from '../../store/receiptStore';
import { Colors } from '../../constants/Colors';
import { Receipt, ReceiptItem } from '../../types/receipt';
import { extractReceiptData } from '../../services/geminiVision';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { addReceipt } = useReceiptStore();

  // Process receipt image using Gemini Vision OCR
  const processReceiptImage = async (imageUri: string): Promise<Receipt> => {
    try {
      // Use Gemini Vision to extract receipt data
      const extractedData = await extractReceiptData(imageUri);
      
      // Convert extracted data to Receipt format
      const receiptData: Receipt = {
        id: Date.now().toString(),
        merchantName: extractedData.merchantName,
        date: extractedData.date,
        totalAmount: extractedData.totalAmount,
        taxAmount: extractedData.taxAmount,
        imageUri,
        items: extractedData.items.map((item, index) => ({
          id: `${Date.now()}-${index}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
        })),
        // Legacy compatibility
        store: extractedData.merchantName,
        total: extractedData.totalAmount,
        tax: extractedData.taxAmount || 0,
        subtotal: Math.max(0, extractedData.totalAmount - (extractedData.taxAmount || 0)),
        category: 'Other',
      };
      
      return receiptData;
    } catch (error) {
      console.error('Error processing receipt with Gemini:', error);
      
      // Fallback: return basic template if OCR fails
      const basicReceiptData: Receipt = {
        id: Date.now().toString(),
        merchantName: 'Unknown Store',
        date: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        taxAmount: 0,
        imageUri,
        items: [{
          id: `${Date.now()}-0`,
          name: 'Item (please edit)',
          price: 0,
          quantity: 1,
          category: 'other',
        }],
        // Legacy compatibility
        store: 'Unknown Store',
        total: 0,
        tax: 0,
        subtotal: 0,
        category: 'Other',
      };
      
      return basicReceiptData;
    }
  };

  const handleImageProcessing = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      const receiptData = await processReceiptImage(imageUri);
      await addReceipt(receiptData);
      
      // Show success message with different options based on OCR success
      const hasExtractedData = receiptData.merchantName !== 'Unknown Store';
      
      Alert.alert(
        hasExtractedData ? 'Receipt Processed!' : 'Receipt Captured!',
        hasExtractedData 
          ? 'AI has extracted your receipt data! Review and edit if needed.'
          : 'Receipt saved. Please add the details manually.',
        [
          {
            text: 'Edit Receipt',
            onPress: () => router.push(`/receipt/edit/${receiptData.id}`),
          },
          {
            text: 'View Receipt',
            onPress: () => router.push(`/receipt/${receiptData.id}`),
          },
          {
            text: 'Scan Another',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error processing receipt:', error);
      Alert.alert(
        'Processing Error', 
        'Failed to process the receipt. The image has been saved and you can add details manually.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/'),
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo?.uri) {
          await handleImageProcessing(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const pickFromGallery = async () => {
    if (isProcessing) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleImageProcessing(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan your receipts
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Colors.background, Colors.highlight]}
          style={styles.gradient}
        >
          <View style={styles.webContainer}>
            <Text style={styles.webTitle}>Receipt Scanner</Text>
            <Text style={styles.webSubtitle}>
              Camera not available on web. Please select an image from your gallery.
            </Text>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickFromGallery}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isProcessing ? 'Processing...' : 'Select from Gallery'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.3)']}
          style={styles.overlay}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Text style={styles.headerButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Receipt</Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.headerButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Scanning Frame */}
          <View style={styles.scanFrame}>
            <View style={styles.scanOverlay}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanText}>
              {isProcessing ? 'Saving receipt...' : 'Position receipt within frame'}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickFromGallery}
              disabled={isProcessing}
            >
              <Text style={styles.controlButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={
                  isProcessing
                    ? [Colors.border, Colors.border]
                    : [Colors.primary, Colors.secondary]
                }
                style={styles.captureButtonInner}
              >
                <View style={styles.captureButtonCenter} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.controlButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  camera: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: Colors.card,
    fontSize: 20,
    fontWeight: '600',
  },
  scanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scanOverlay: {
    width: width * 0.8,
    height: height * 0.4,
    borderWidth: 2,
    borderColor: Colors.card,
    borderRadius: 12,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanText: {
    color: Colors.card,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
  },
  galleryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  controlButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 4,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  webTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  webSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});
