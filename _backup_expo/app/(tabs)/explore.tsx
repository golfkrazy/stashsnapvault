import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const DEFAULT_CATEGORIES = [
  { name: 'Documents', icon: '📄', color: '#3B82F6' },
  { name: 'Jewelry', icon: '💎', color: '#EC4899' },
];

export default function AddItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialCategory = (params.category as string) || 'Documents';
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState('');
  const [value, setValue] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem('stashsnap_categories');
      if (stored) {
        setCategories(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const savePhotoToFileSystem = async (uri: string): Promise<string> => {
    try {
      const filename = `${Date.now()}.jpg`;
      const directory = `${FileSystem.documentDirectory}stashsnap_photos/`;
      
      // Create directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }
      
      const newPath = directory + filename;
      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });
      
      return newPath;
    } catch (error) {
      console.error('Error saving photo:', error);
      return uri; // Fallback to original URI if save fails
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const permanentUri = await savePhotoToFileSystem(result.assets[0].uri);
      setPhotoUri(permanentUri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const permanentUri = await savePhotoToFileSystem(result.assets[0].uri);
      setPhotoUri(permanentUri);
    }
  };

  const saveItem = async () => {
    if (isSaving) {
      console.log('Already saving, ignoring click');
      return;
    }

    console.log('Save button clicked!');
    console.log('Title:', title);
    
    if (!title.trim()) {
      console.log('No title - showing alert');
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      const newItem = {
        id: Date.now().toString(),
        title: title.trim(),
        category,
        location: location.trim(),
        value: parseFloat(value) || 0,
        photoUri: photoUri || undefined,
        createdAt: Date.now(),
      };

      console.log('New item:', newItem);

      const stored = await AsyncStorage.getItem('stashsnap_items');
      console.log('Stored items:', stored);
      const items = stored ? JSON.parse(stored) : [];
      items.unshift(newItem);
      await AsyncStorage.setItem('stashsnap_items', JSON.stringify(items));

      console.log('Item saved! Total items:', items.length);
      alert('Item added successfully!');
      
      setTitle('');
      setLocation('');
      setValue('');
      setPhotoUri(null);
      setIsSaving(false);
      router.push('/');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save item: ' + error);
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Item</Text>
          <Text style={styles.headerSubtitle}>Snap a photo and add details</Text>
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Photo</Text>
          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => setPhotoUri(null)}
              >
                <Ionicons name="close-circle" size={32} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color="#7C3AED" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Ionicons name="images" size={32} color="#7C3AED" />
                <Text style={styles.photoButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., House Deed, Wedding Ring"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryButtons}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryButton,
                  { backgroundColor: cat.color + '20' },
                  category === cat.name && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <Text style={styles.categoryButtonIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat.name && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Top drawer, Safe, Closet"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Value */}
        <View style={styles.section}>
          <Text style={styles.label}>Estimated Value ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={saveItem}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Item'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  photoPreview: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: '#7C3AED',
  },
  categoryButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryButtonTextActive: {
    color: '#7C3AED',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
});
