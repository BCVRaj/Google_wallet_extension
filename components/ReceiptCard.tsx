import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Receipt } from '../types/receipt';
import { Colors, CategoryColors } from '../constants/Colors';
import { router } from 'expo-router';

interface ReceiptCardProps {
  receipt: Receipt;
  onPress?: () => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onPress }) => {
  const categoryColor = CategoryColors[receipt.category || 'Other'];
  const formattedDate = new Date(receipt.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/receipt/${receipt.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[Colors.card, Colors.highlight]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName} numberOfLines={1}>
              {receipt.merchantName || receipt.store}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.total}>${(receipt.totalAmount || receipt.total || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{receipt.category || 'Other'}</Text>
          </View>
          <Text style={styles.itemCount}>
            {receipt.items.length} item{receipt.items.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: categoryColor }]} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
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
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeInfo: {
    flex: 1,
    marginRight: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.card,
  },
  itemCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressContainer: {
    flex: 1,
    height: '100%',
  },
  progressBar: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
  },
});
