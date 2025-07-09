import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useReceiptStore } from '../../store/receiptStore';
import { Colors, CategoryColors } from '../../constants/Colors';

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getReceiptById, deleteReceipt } = useReceiptStore();
  const receipt = getReceiptById(id!);

  if (!receipt) {
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

  const handleDelete = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteReceipt(receipt.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/receipt/edit/${receipt.id}`);
  };

  const categoryColor = CategoryColors[receipt.category || 'Other'];
  const formattedDate = new Date(receipt.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
              onPress={() => router.back()}
            >
              <Text style={styles.headerButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Receipt Card */}
          <View style={styles.receiptCard}>
            <LinearGradient
              colors={[Colors.card, Colors.highlight]}
              style={styles.cardGradient}
            >
              {/* Store Info */}
              <View style={styles.storeSection}>
                <Text style={styles.storeName}>{receipt.store}</Text>
                <Text style={styles.date}>{formattedDate}</Text>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                  <Text style={styles.categoryText}>{receipt.category || 'Other'}</Text>
                </View>
              </View>

              {/* Receipt Image */}
              {receipt.imageUri && (
                <View style={styles.imageSection}>
                  <Text style={styles.sectionTitle}>Receipt Image</Text>
                  <Image source={{ uri: receipt.imageUri }} style={styles.receiptImage} />
                </View>
              )}

              {/* Items List */}
              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Items ({receipt.items.length})</Text>
                {receipt.items.map((item, index) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              {/* Totals */}
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>${((receipt.totalAmount || 0) - (receipt.taxAmount || 0)).toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax</Text>
                  <Text style={styles.totalValue}>${(receipt.taxAmount || 0).toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.finalTotalRow]}>
                  <Text style={styles.finalTotalLabel}>Total</Text>
                  <Text style={styles.finalTotalValue}>${(receipt.totalAmount || receipt.total || 0).toFixed(2)}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(tabs)/assistant')}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.quickActionGradient}
              >
                <Text style={styles.quickActionText}>Ask AI about this receipt</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  },
  headerButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.card,
  },
  receiptCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardGradient: {
    padding: 20,
  },
  storeSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  storeName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.card,
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  finalTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  quickActions: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  quickActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  quickActionText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
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
