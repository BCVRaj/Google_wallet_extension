import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useReceiptStore } from '../../store/receiptStore';
import { ReceiptCard } from '../../components/ReceiptCard';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/Colors';
import { Receipt, ReceiptCategory } from '../../types/receipt';

const categories: (ReceiptCategory | 'All')[] = [
  'All',
  'Groceries',
  'Dining',
  'Shopping',
  'Entertainment',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Other',
];

export default function HomeScreen() {
  const { receipts, getTotalSpending, initializeDatabase, loadReceipts } = useReceiptStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReceiptCategory | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initialize database and load receipts on app start
    const initializeApp = async () => {
      try {
        await initializeDatabase();
        await loadReceipts();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  const filteredReceipts = receipts.filter((receipt) => {
    const merchantName = receipt.merchantName || receipt.store || '';
    const matchesSearch = merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || receipt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpending = getTotalSpending();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadReceipts();
    } catch (error) {
      console.error('Failed to refresh receipts:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadReceipts]);

  const handleScanPress = () => {
    router.push('/(tabs)/scan');
  };

  const renderReceiptCard = ({ item }: { item: Receipt }) => (
    <ReceiptCard receipt={item} />
  );

  const renderCategoryFilter = ({ item }: { item: ReceiptCategory | 'All' }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.categoryButtonTextActive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (receipts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="No Receipts Yet"
          subtitle="Start by scanning your first receipt to track your spending and get insights"
          buttonText="Scan Receipt"
          onButtonPress={handleScanPress}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.highlight]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Your Receipts</Text>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Spending</Text>
              <Text style={styles.totalAmount}>${totalSpending.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search receipts or items..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryFilter}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Receipt List */}
        <FlatList
          data={filteredReceipts}
          renderItem={renderReceiptCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No receipts found for "{searchQuery}" in {selectedCategory} category
              </Text>
            </View>
          }
        />
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
  header: {
    backgroundColor: Colors.card,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
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
  listContainer: {
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
