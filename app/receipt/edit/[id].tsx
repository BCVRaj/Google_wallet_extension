import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useReceiptStore } from '../../../store/receiptStore';
import { Colors, CategoryColors } from '../../../constants/Colors';
import { Receipt, ReceiptItem, ReceiptCategory } from '../../../types/receipt';

const categories: ReceiptCategory[] = [
  'Groceries',
  'Dining',
  'Shopping',
  'Entertainment',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Other',
];

export default function EditReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getReceiptById, updateReceipt } = useReceiptStore();
  const originalReceipt = getReceiptById(id!);

  if (!originalReceipt) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Receipt not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const [receipt, setReceipt] = useState<Receipt>({ ...originalReceipt });
  const [isLoading, setIsLoading] = useState(false);

  const updateReceiptField = (field: keyof Receipt, value: any) => {
    setReceipt(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...receipt.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setReceipt(prev => ({ ...prev, items: newItems }));
    recalculateTotals(newItems);
  };

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0,
    };
    const newItems = [...receipt.items, newItem];
    setReceipt(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    const newItems = receipt.items.filter((_, i) => i !== index);
    setReceipt(prev => ({ ...prev, items: newItems }));
    recalculateTotals(newItems);
  };

  const recalculateTotals = (items: ReceiptItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + tax;
    
    setReceipt(prev => ({
      ...prev,
      totalAmount: parseFloat(total.toFixed(2)),
      taxAmount: parseFloat(tax.toFixed(2)),
    }));
  };

  const handleSave = async () => {
    if (!(receipt.merchantName || receipt.store || '').trim()) {
      Alert.alert('Error', 'Please enter a store name');
      return;
    }

    // Filter out empty items before validation and saving
    const validItems = receipt.items.filter(item => 
      item.name && item.name.trim() && item.price > 0
    );

    // Update receipt with only valid items
    const updatedReceipt = {
      ...receipt,
      items: validItems
    };

    if (validItems.length === 0) {
      Alert.alert('Error', 'Please add at least one valid item');
      return;
    }

    setIsLoading(true);
    try {
      await updateReceipt(updatedReceipt.id, updatedReceipt);
      Alert.alert('Success', 'Receipt updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.highlight]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCancel}
            >
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Receipt</Text>
            <TouchableOpacity
              style={[styles.headerButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={[styles.headerButtonText, styles.saveButtonText]}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Edit Form */}
          <View style={styles.formCard}>
            <LinearGradient
              colors={[Colors.card, Colors.highlight]}
              style={styles.cardGradient}
            >
              {/* Store Name */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Store Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={receipt.merchantName || receipt.store || ''}
                  onChangeText={(text) => updateReceiptField('merchantName', text)}
                  placeholder="Enter store name"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              {/* Date */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={receipt.date}
                  onChangeText={(text) => updateReceiptField('date', text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              {/* Category */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          receipt.category === category && styles.categoryButtonActive,
                          { backgroundColor: receipt.category === category ? CategoryColors[category] : Colors.border }
                        ]}
                        onPress={() => updateReceiptField('category', category)}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            receipt.category === category && styles.categoryButtonTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Items */}
              <View style={styles.formSection}>
                <View style={styles.itemsHeader}>
                  <Text style={styles.formLabel}>Items</Text>
                  <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={addItem}
                  >
                    <Text style={styles.addItemText}>+ Add Item</Text>
                  </TouchableOpacity>
                </View>

                {receipt.items.map((item, index) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemNumber}>Item {index + 1}</Text>
                      <TouchableOpacity
                        style={styles.removeItemButton}
                        onPress={() => removeItem(index)}
                      >
                        <Text style={styles.removeItemText}>Remove</Text>
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      style={styles.textInput}
                      value={item.name}
                      onChangeText={(text) => updateItem(index, 'name', text)}
                      placeholder="Item name"
                      placeholderTextColor={Colors.textSecondary}
                    />

                    <View style={styles.itemRow}>
                      <View style={styles.itemField}>
                        <Text style={styles.fieldLabel}>Quantity</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={item.quantity.toString()}
                          onChangeText={(text) => {
                            const qty = parseFloat(text) || 0;
                            updateItem(index, 'quantity', qty);
                          }}
                          placeholder="0"
                          keyboardType="numeric"
                          placeholderTextColor={Colors.textSecondary}
                        />
                      </View>

                      <View style={styles.itemField}>
                        <Text style={styles.fieldLabel}>Price</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={item.price.toString()}
                          onChangeText={(text) => {
                            const price = parseFloat(text) || 0;
                            updateItem(index, 'price', price);
                          }}
                          placeholder="0.00"
                          keyboardType="numeric"
                          placeholderTextColor={Colors.textSecondary}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Totals */}
              <View style={styles.totalsSection}>
                <Text style={styles.formLabel}>Totals</Text>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>${((receipt.totalAmount || receipt.total || 0) - (receipt.taxAmount || receipt.tax || 0)).toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax</Text>
                  <Text style={styles.totalValue}>${(receipt.taxAmount || receipt.tax || 0).toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.finalTotalRow]}>
                  <Text style={styles.finalTotalLabel}>Total</Text>
                  <Text style={styles.finalTotalValue}>${(receipt.totalAmount || receipt.total || 0).toFixed(2)}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 16,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  headerButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    color: Colors.card,
  },
  formCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardGradient: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonActive: {
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  categoryButtonTextActive: {
    color: Colors.card,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addItemButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addItemText: {
    color: Colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  itemContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  removeItemButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeItemText: {
    color: Colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemField: {
    flex: 1,
    marginHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  numberInput: {
    backgroundColor: Colors.card,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
  },
  totalsSection: {
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  finalTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});
