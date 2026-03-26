import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Plus } from 'lucide-react-native';

interface ImagePickerButtonProps {
  /** Callback with selected image URIs */
  onImagesSelected: (uris: string[]) => void;
  /** Allow multiple image selection */
  multiple?: boolean;
  /** Max number of images (only for multiple) */
  maxCount?: number;
  /** Aspect ratio [width, height] for cropping */
  aspectRatio?: [number, number];
  /** Compact mode — single small circle (for avatars) */
  compact?: boolean;
  /** Label text */
  label?: string;
  /** Currently selected images (controlled) */
  selectedImages?: string[];
}

export default function ImagePickerButton({
  onImagesSelected,
  multiple = false,
  maxCount = 10,
  aspectRatio,
  compact = false,
  label = 'Upload Images',
  selectedImages = [],
}: ImagePickerButtonProps) {
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload images.',
      );
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    if (multiple && selectedImages.length >= maxCount) {
      Alert.alert('Limit Reached', `You can upload a maximum of ${maxCount} images.`);
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: multiple,
        selectionLimit: multiple ? maxCount - selectedImages.length : 1,
        quality: 0.8,
        aspect: aspectRatio,
        allowsEditing: !multiple,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);

        if (multiple) {
          const combined = [...selectedImages, ...newUris].slice(0, maxCount);
          onImagesSelected(combined);
        } else {
          onImagesSelected(newUris);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take photos.');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        aspect: aspectRatio,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        if (multiple) {
          const combined = [...selectedImages, newUri].slice(0, maxCount);
          onImagesSelected(combined);
        } else {
          onImagesSelected([newUri]);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = selectedImages.filter((_, i) => i !== index);
    onImagesSelected(updated);
  };

  const showOptions = () => {
    Alert.alert('Upload Image', 'Choose a source', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImages },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ─── Compact Mode (Avatar) ───────────────────────────
  if (compact) {
    return (
      <TouchableOpacity onPress={showOptions} activeOpacity={0.7} style={styles.compactWrap}>
        {selectedImages.length > 0 ? (
          <View style={styles.compactImageWrap}>
            <Image source={{ uri: selectedImages[0] }} style={styles.compactImage} />
            <View style={styles.compactEditBadge}>
              <Camera color="#fff" size={12} />
            </View>
          </View>
        ) : (
          <View style={styles.compactPlaceholder}>
            {loading ? (
              <ActivityIndicator color="#d946ef" size="small" />
            ) : (
              <>
                <Camera color="#94a3b8" size={28} />
                <Text style={styles.compactText}>Add Photo</Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ─── Full Mode (Multi-image grid) ────────────────────
  return (
    <View style={styles.container}>
      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.previewRow}
        >
          {selectedImages.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.previewItem}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeImage(index)}
                activeOpacity={0.7}
              >
                <X color="#fff" size={12} />
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>COVER</Text>
                </View>
              )}
            </View>
          ))}

          {/* Add More Button (Inline) */}
          {multiple && selectedImages.length < maxCount && (
            <TouchableOpacity
              style={styles.addMoreBtn}
              onPress={showOptions}
              activeOpacity={0.7}
            >
              <Plus color="#64748b" size={24} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Upload Area (when no images selected or single mode) */}
      {selectedImages.length === 0 && (
        <TouchableOpacity
          style={styles.uploadArea}
          onPress={showOptions}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#d946ef" size="large" />
          ) : (
            <>
              <View style={styles.uploadIconWrap}>
                <Camera color="#d946ef" size={28} />
              </View>
              <Text style={styles.uploadLabel}>{label}</Text>
              <Text style={styles.uploadHint}>
                {multiple ? `Tap to select up to ${maxCount} images` : 'Tap to select an image'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Count Indicator */}
      {multiple && selectedImages.length > 0 && (
        <Text style={styles.countText}>
          {selectedImages.length}/{maxCount} images
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },

  // ─── Full Mode Styles ─────────────────────────────
  uploadArea: {
    height: 180,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(217, 70, 239, 0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.2)',
  },
  uploadLabel: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#cbd5e1',
  },
  uploadHint: {
    fontFamily: 'Sora_400Regular',
    fontSize: 12,
    color: '#64748b',
  },

  // Preview row
  previewRow: { gap: 10, paddingVertical: 4 },
  previewItem: { position: 'relative', width: 100, height: 100, borderRadius: 14, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', borderRadius: 14 },
  removeBtn: {
    position: 'absolute', top: 6, right: 6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  coverBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: 'rgba(217, 70, 239, 0.85)',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  coverBadgeText: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 8,
    color: '#fff',
    letterSpacing: 1,
  },
  addMoreBtn: {
    width: 100, height: 100, borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1, borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  countText: {
    fontFamily: 'Sora_400Regular',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },

  // ─── Compact Mode Styles ──────────────────────────
  compactWrap: { alignItems: 'center' },
  compactPlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center', alignItems: 'center',
    gap: 6,
  },
  compactText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 12,
    color: '#94a3b8',
  },
  compactImageWrap: { position: 'relative' },
  compactImage: {
    width: 120, height: 120, borderRadius: 60,
  },
  compactEditBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#d946ef',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#0f172a',
  },
});
