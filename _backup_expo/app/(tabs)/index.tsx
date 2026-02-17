import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, TextInput } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

type Item = {
  id: string;
  title: string;
  category: string;
  location: string;
  photoUri?: string;
  value?: number;
  createdAt: number;
};

const DEFAULT_CATEGORIES = [
  { name: 'Documents', icon: '📄', color: '#3B82F6' },
  { name: 'Jewelry', icon: '💎', color: '#EC4899' },
];

const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function HomeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editValue, setEditValue] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadItems();
      loadCategories();
    }, [])
  );

  const loadItems = async () => {
    try {
      const stored = await AsyncStorage.getItem('stashsnap_items');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

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

  const createCategory = () => {
    const name = prompt('Enter category name:');
    if (!name || !name.trim()) return;

    const emojis = ['📱', '💍', '🔑', '🚗', '🏛️', '🎨', '📚', '🎵', '🎮', '👗', '👟', '⚽', '🎸', '📷', '🎂', '🍺', '☕', '🌿', '🐶', '🐱'];
    const emojiList = emojis.map((e, i) => `${i + 1}. ${e}`).join('  ');
    const choice = prompt(`Choose emoji (enter number 1-${emojis.length}):\n\n${emojiList}\n\nOr type your own emoji:`);
    
    let icon = '📊';
    if (choice) {
      const num = parseInt(choice);
      if (num >= 1 && num <= emojis.length) {
        icon = emojis[num - 1];
      } else {
        icon = choice.trim();
      }
    }
    
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newCategory = { name: name.trim(), icon, color };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    AsyncStorage.setItem('stashsnap_categories', JSON.stringify(updatedCategories));
  };

  const deleteCategory = async (categoryName: string) => {
    const hasItems = items.some(item => item.category === categoryName);
    if (hasItems) {
      alert('Cannot delete category with items. Delete all items in this category first.');
      return;
    }

    const isDefault = DEFAULT_CATEGORIES.some(cat => cat.name === categoryName);
    if (isDefault) {
      alert('Cannot delete default categories.');
      return;
    }

    const confirmed = confirm(`Delete category "${categoryName}"?`);
    if (confirmed) {
      const updatedCategories = categories.filter(cat => cat.name !== categoryName);
      setCategories(updatedCategories);
      await AsyncStorage.setItem('stashsnap_categories', JSON.stringify(updatedCategories));
    }
  };

  const deleteItem = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this item?');
    if (confirmed) {
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      await AsyncStorage.setItem('stashsnap_items', JSON.stringify(newItems));
    }
  };

  const updateItem = async () => {
    if (!selectedItem || !editTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    const updatedItems = items.map(item => 
      item.id === selectedItem.id
        ? {
            ...item,
            title: editTitle.trim(),
            location: editLocation.trim(),
            category: editCategory,
            value: parseFloat(editValue) || 0,
          }
        : item
    );

    setItems(updatedItems);
    await AsyncStorage.setItem('stashsnap_items', JSON.stringify(updatedItems));
    setIsEditMode(false);
    setSelectedItem(null);
    alert('Item updated successfully!');
  };

  const startEdit = (item: Item) => {
    setEditTitle(item.title);
    setEditLocation(item.location);
    setEditCategory(item.category);
    setEditValue(item.value?.toString() || '');
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setSelectedItem(null);
  };

  const clearAllData = async () => {
    const confirmed = confirm('This will delete ALL items and custom categories. Are you sure?');
    if (confirmed) {
      await AsyncStorage.removeItem('stashsnap_items');
      await AsyncStorage.removeItem('stashsnap_categories');
      setItems([]);
      setCategories(DEFAULT_CATEGORIES);
      alert('All data cleared!');
    }
  };

  const filteredItems = selectedCategory
    ? items.filter(item => item.category === selectedCategory)
    : items;

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    items.forEach(item => {
      stats[item.category] = (stats[item.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();
  const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);

  if (showLanding) {
    return (
      <ScrollView style={styles.landingContainer}>
        <View style={styles.landingHero}>
          <View style={styles.landingContent}>
            <View style={styles.landingBadge}>
              <Text style={styles.landingBadgeText}>Trusted by Caregivers Nationwide</Text>
            </View>
            <Text style={styles.landingTitle}>Finally, Remember Where You Put Everything</Text>
            <Text style={styles.landingSubtitle}>
              Stop the frantic searches. Find important items instantly. Get peace of mind for just $0.99.
            </Text>
            <TouchableOpacity 
              style={styles.landingButton}
              onPress={() => setShowLanding(false)}
            >
              <Text style={styles.landingButtonText}>Try the App Now</Text>
            </TouchableOpacity>
            <View style={styles.landingTrust}>
              <Text style={styles.landingTrustText}>✓ One-time payment</Text>
              <Text style={styles.landingTrustText}>✓ No subscription</Text>
              <Text style={styles.landingTrustText}>✓ Private & secure</Text>
            </View>
          </View>
        </View>

        <View style={styles.landingProblem}>
          <Text style={styles.landingSectionTitle}>You're Not Alone in This</Text>
          <View style={styles.landingProblemCard}>
            <Text style={styles.landingIcon}>😰</Text>
            <Text style={styles.landingCardTitle}>The 2 AM Anxiety</Text>
            <Text style={styles.landingCardText}>"Where did I put my passport? I'll have to spend all weekend searching again."</Text>
          </View>
          <View style={styles.landingProblemCard}>
            <Text style={styles.landingIcon}>⏰</Text>
            <Text style={styles.landingCardTitle}>Hours of Searching</Text>
            <Text style={styles.landingCardText}>Checking the freezer, the shoebox. Every "safe place" becomes a mystery.</Text>
          </View>
          <View style={styles.landingProblemCard}>
            <Text style={styles.landingIcon}>😔</Text>
            <Text style={styles.landingCardTitle}>The Guilt & Frustration</Text>
            <Text style={styles.landingCardText}>Feeling frustrated, then guilty. The emotional toll is exhausting.</Text>
          </View>
        </View>

        <View style={styles.landingFeatures}>
          <Text style={styles.landingSectionTitle}>Everything You Need</Text>
          <View style={styles.landingFeatureCard}>
            <Text style={styles.landingIcon}>📸</Text>
            <Text style={styles.landingCardTitle}>Photo Documentation</Text>
            <Text style={styles.landingCardText}>Take clear photos of items and their hiding spots.</Text>
          </View>
          <View style={styles.landingFeatureCard}>
            <Text style={styles.landingIcon}>🔍</Text>
            <Text style={styles.landingCardTitle}>Instant Search</Text>
            <Text style={styles.landingCardText}>Find what you need in seconds.</Text>
          </View>
          <View style={styles.landingFeatureCard}>
            <Text style={styles.landingIcon}>🔒</Text>
            <Text style={styles.landingCardTitle}>Private & Secure</Text>
            <Text style={styles.landingCardText}>Your information stays on your device.</Text>
          </View>
        </View>

        <View style={styles.landingCTA}>
          <Text style={styles.landingCTATitle}>Give Yourself Peace of Mind</Text>
          <Text style={styles.landingPrice}>$0.99</Text>
          <Text style={styles.landingPriceText}>One-time payment • No subscription</Text>
          <TouchableOpacity 
            style={styles.landingButtonLarge}
            onPress={() => setShowLanding(false)}
          >
            <Text style={styles.landingButtonText}>Start Using StashSnap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.subtitle}>Your secure vault</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={loadItems}>
            <Ionicons name="refresh" size={24} color="#7C3AED" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, items.length === 0 && styles.iconButtonDisabled]} 
            onPress={clearAllData}
            disabled={items.length === 0}
          >
            <Ionicons name="trash" size={24} color={items.length === 0 ? '#9CA3AF' : '#EF4444'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{items.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${totalValue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={styles.scrollIndicator} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          <TouchableOpacity
            style={[styles.categoryCard, !selectedCategory && styles.categoryCardActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={styles.categoryIcon}>📊</Text>
            <Text style={styles.categoryName}>All</Text>
            <Text style={styles.categoryCount}>{items.length}</Text>
          </TouchableOpacity>
          {categories.map((cat) => {
            const itemCount = categoryStats[cat.name] || 0;
            const isDefault = DEFAULT_CATEGORIES.some(defCat => defCat.name === cat.name);
            const canDelete = itemCount === 0 && !isDefault;
            
            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryCard,
                  { backgroundColor: cat.color + '20' },
                  selectedCategory === cat.name && styles.categoryCardActive,
                ]}
                onPress={() => setSelectedCategory(cat.name)}
                onLongPress={() => canDelete && deleteCategory(cat.name)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryCount}>{itemCount}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.addCategoryCard}
            onPress={createCategory}
          >
            <Ionicons name="add-circle" size={32} color="#7C3AED" />
            <Text style={styles.addCategoryText}>New Category</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>
          {selectedCategory ? `${selectedCategory} Items` : 'All Items'}
        </Text>
        
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No items yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first item</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.itemCard}
              onPress={() => setSelectedItem(item)}
            >
              <View style={styles.itemImage}>
                {item.photoUri ? (
                  <Image source={{ uri: item.photoUri }} style={styles.itemPhoto} />
                ) : (
                  <Text style={styles.placeholderIcon}>
                    {categories.find(c => c.name === item.category)?.icon || '📦'}
                  </Text>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemLocation}>📍 {item.location}</Text>
                {item.value && item.value > 0 && (
                  <Text style={styles.itemValue}>💵 ${item.value.toFixed(2)}</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  deleteItem(item.id);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {selectedItem && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeModal}
              onPress={() => {
                setSelectedItem(null);
                setIsEditMode(false);
              }}
            >
              <Ionicons name="close" size={32} color="#1F2937" />
            </TouchableOpacity>
            
            {selectedItem.photoUri && (
              <Image source={{ uri: selectedItem.photoUri }} style={styles.modalImage} />
            )}
            
            {isEditMode ? (
              <ScrollView style={styles.editForm}>
                <Text style={styles.editLabel}>Title *</Text>
                <TextInput
                  style={styles.editInput}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Item title"
                />

                <Text style={styles.editLabel}>Category *</Text>
                <View style={styles.categoryButtonsModal}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      style={[
                        styles.categoryButtonModal,
                        { backgroundColor: cat.color + '20' },
                        editCategory === cat.name && styles.categoryButtonModalActive,
                      ]}
                      onPress={() => setEditCategory(cat.name)}
                    >
                      <Text style={styles.categoryButtonIconModal}>{cat.icon}</Text>
                      <Text style={[
                        styles.categoryButtonTextModal,
                        editCategory === cat.name && styles.categoryButtonTextModalActive,
                      ]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.editLabel}>Location</Text>
                <TextInput
                  style={styles.editInput}
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="Where is it stored?"
                />

                <Text style={styles.editLabel}>Value ($)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />

                <View style={styles.editButtons}>
                  <TouchableOpacity style={styles.saveEditButton} onPress={updateItem}>
                    <Text style={styles.saveEditButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelEditButton} onPress={cancelEdit}>
                    <Text style={styles.cancelEditButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <>
                <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                <View style={styles.modalDetail}>
                  <Ionicons name="pricetag" size={20} color="#7C3AED" />
                  <Text style={styles.modalDetailText}>{selectedItem.category}</Text>
                </View>
                {selectedItem.location && (
                  <View style={styles.modalDetail}>
                    <Ionicons name="location" size={20} color="#7C3AED" />
                    <Text style={styles.modalDetailText}>{selectedItem.location}</Text>
                  </View>
                )}
                {selectedItem.value && selectedItem.value > 0 && (
                  <View style={styles.modalDetail}>
                    <Ionicons name="cash" size={20} color="#10B981" />
                    <Text style={styles.modalDetailText}>${selectedItem.value.toFixed(2)}</Text>
                  </View>
                )}
                <Text style={styles.modalDate}>
                  Added {new Date(selectedItem.createdAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => startEdit(selectedItem)}
                >
                  <Ionicons name="pencil" size={20} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Edit Item</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/explore')}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  iconButtonDisabled: { opacity: 0.4 },
  statsCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', margin: 20, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#7C3AED' },
  statLabel: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 20 },
  scrollView: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  sectionTitleStandalone: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginLeft: 20, marginBottom: 15 },
  scrollIndicator: { marginLeft: 8 },
  itemCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 12, padding: 15, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  itemImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  placeholderIcon: { fontSize: 30 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  itemCategory: { fontSize: 14, color: '#7C3AED', marginBottom: 2 },
  itemLocation: { fontSize: 12, color: '#6B7280' },
  itemValue: { fontSize: 14, fontWeight: '600', color: '#10B981', marginTop: 4 },
  itemPhoto: { width: 60, height: 60, borderRadius: 12 },
  categoriesSection: { marginBottom: 10 },
  categoriesScroll: { paddingLeft: 20 },
  categoryCard: { width: 100, padding: 15, borderRadius: 12, backgroundColor: '#F3F4F6', marginRight: 12, alignItems: 'center', position: 'relative' },
  categoryCardActive: { borderWidth: 2, borderColor: '#7C3AED' },
  categoryIcon: { fontSize: 32, marginBottom: 8 },
  categoryName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  categoryCount: { fontSize: 12, color: '#6B7280' },
  addCategoryCard: { width: 100, padding: 15, borderRadius: 12, backgroundColor: '#F3F4F6', marginRight: 12, alignItems: 'center', borderWidth: 2, borderColor: '#7C3AED', borderStyle: 'dashed' },
  addCategoryText: { fontSize: 12, fontWeight: '600', color: '#7C3AED', marginTop: 8 },
  deleteCategoryButton: { position: 'absolute', top: 5, right: 5 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  emptySubtext: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  addButton: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  deleteButton: { padding: 8, marginLeft: 8 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, width: '100%', maxWidth: 500 },
  closeModal: { position: 'absolute', top: 15, right: 15, zIndex: 10 },
  modalImage: { width: '100%', height: 300, borderRadius: 12, marginBottom: 20 },
  modalTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  modalDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  modalDetailText: { fontSize: 18, color: '#1F2937', marginLeft: 10 },
  modalDate: { fontSize: 14, color: '#6B7280', marginTop: 20, textAlign: 'center' },
  
  // Landing page styles
  landingContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  landingHero: { backgroundColor: '#7C3AED', padding: 40, minHeight: 500 },
  landingContent: { maxWidth: 600 },
  landingBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 50, alignSelf: 'flex-start', marginBottom: 16 },
  landingBadgeText: { color: '#FFFFFF', fontSize: 14 },
  landingTitle: { fontSize: 36, fontWeight: '700', color: '#FFFFFF', marginBottom: 16, lineHeight: 44 },
  landingSubtitle: { fontSize: 18, color: '#FFFFFF', marginBottom: 24, opacity: 0.95 },
  landingButton: { backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 20 },
  landingButtonText: { color: '#7C3AED', fontSize: 18, fontWeight: '600' },
  landingTrust: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  landingTrustText: { color: '#FFFFFF', fontSize: 14 },
  
  landingProblem: { padding: 40, backgroundColor: '#F9FAFB' },
  landingSectionTitle: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 32, color: '#1F2937' },
  landingProblemCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  landingIcon: { fontSize: 40, marginBottom: 12, textAlign: 'center' },
  landingCardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#1F2937', textAlign: 'center' },
  landingCardText: { color: '#6B7280', textAlign: 'center', fontStyle: 'italic' },
  
  landingFeatures: { padding: 40 },
  landingFeatureCard: { backgroundColor: '#F9FAFB', padding: 24, borderRadius: 16, marginBottom: 16 },
  
  landingCTA: { padding: 40, backgroundColor: '#7C3AED', alignItems: 'center' },
  landingCTATitle: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', marginBottom: 24, textAlign: 'center' },
  landingPrice: { fontSize: 56, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  landingPriceText: { color: '#FFFFFF', fontSize: 16, marginBottom: 24 },
  landingButtonLarge: { backgroundColor: '#FFFFFF', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 12 },
});