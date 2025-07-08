import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReceiptStore } from '../../store/receiptStore';
import { SpendingChart } from '../../components/SpendingChart';
import { Colors, CategoryColors } from '../../constants/Colors';
import { SpendingData } from '../../types/receipt';

const timeRanges = ['Week', 'Month', 'Year'];

export default function InsightsScreen() {
  const { 
    receipts, 
    getTotalSpending, 
    getCategorySpending, 
    getSpendingInsights,
    initializeDatabase,
    loadReceipts
  } = useReceiptStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState('Month');
  const [insights, setInsights] = useState<any>(null);

  React.useEffect(() => {
    // Initialize database and load insights
    const initializeAndLoadData = async () => {
      try {
        await initializeDatabase();
        await loadReceipts();
        const dbInsights = await getSpendingInsights();
        setInsights(dbInsights);
      } catch (error) {
        console.error('Failed to initialize and load data:', error);
      }
    };

    initializeAndLoadData();
  }, []);

  React.useEffect(() => {
    // Load insights when receipts change
    const loadInsights = async () => {
      try {
        const dbInsights = await getSpendingInsights();
        setInsights(dbInsights);
      } catch (error) {
        console.error('Failed to load insights:', error);
      }
    };

    if (receipts.length > 0) {
      loadInsights();
    }
  }, [receipts]);

  const totalSpending = getTotalSpending();
  const categorySpending = getCategorySpending();

  // Convert category spending to chart data
  const chartData: SpendingData[] = Object.entries(categorySpending).map(([category, amount]) => ({
    category,
    amount,
    color: CategoryColors[category] || Colors.other,
  }));

  // Calculate insights
  const averagePerReceipt = receipts.length > 0 ? totalSpending / receipts.length : 0;
  const topCategory = chartData.reduce((max, current) => 
    current.amount > max.amount ? current : max, 
    { category: 'None', amount: 0, color: '' }
  );

  const recentReceipts = receipts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const insightCards = [
    {
      title: 'Total Spending',
      value: `$${(insights?.totalSpending || totalSpending).toFixed(2)}`,
      detail: `${insights?.totalReceipts || receipts.length} receipts`,
      color: Colors.primary,
    },
    {
      title: 'Average per Receipt',
      value: `$${(insights?.averageSpending || averagePerReceipt).toFixed(2)}`,
      detail: 'Per transaction',
      color: Colors.secondary,
    },
    {
      title: 'Top Category',
      value: topCategory.category,
      detail: `$${topCategory.amount.toFixed(2)}`,
      color: topCategory.color || Colors.primary,
    },
    {
      title: 'Average per Receipt',
      value: `$${averagePerReceipt.toFixed(2)}`,
      detail: `Across ${receipts.length} receipts`,
      color: Colors.secondary,
    },
    {
      title: 'Total Receipts',
      value: receipts.length.toString(),
      detail: 'This month',
      color: Colors.success,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.highlight]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Spending Insights</Text>
            <Text style={styles.subtitle}>Track your financial patterns</Text>
          </View>

          {/* Time Range Selector */}
          <View style={styles.timeRangeContainer}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  selectedTimeRange === range && styles.timeRangeButtonActive,
                ]}
                onPress={() => setSelectedTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    selectedTimeRange === range && styles.timeRangeTextActive,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Insights Cards */}
          <View style={styles.insightsContainer}>
            {insightCards.map((insight: any, index: number) => (
              <View key={index} style={styles.insightCard}>
                <LinearGradient
                  colors={[Colors.card, Colors.highlight]}
                  style={styles.insightGradient}
                >
                  <View style={[styles.insightColorBar, { backgroundColor: insight.color }]} />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.insightValue}>{insight.value}</Text>
                    <Text style={styles.insightDetail}>{insight.detail}</Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Spending Chart */}
          {chartData.length > 0 && <SpendingChart data={chartData} />}

          {/* Recent Activity */}
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentReceipts.map((receipt) => (
              <View key={receipt.id} style={styles.recentItem}>
                <LinearGradient
                  colors={[Colors.card, Colors.background]}
                  style={styles.recentGradient}
                >
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentStore}>{receipt.store}</Text>
                    <Text style={styles.recentDate}>
                      {new Date(receipt.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.recentAmount}>
                    <Text style={styles.recentTotal}>${(receipt.totalAmount || receipt.total || 0).toFixed(2)}</Text>
                    <View
                      style={[
                        styles.recentCategory,
                        { backgroundColor: CategoryColors[receipt.category || 'Other'] },
                      ]}
                    >
                      <Text style={styles.recentCategoryText}>
                        {receipt.category || 'Other'}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Recommendations */}
          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>Smart Recommendations</Text>
            <View style={styles.recommendationCard}>
              <LinearGradient
                colors={[Colors.success, Colors.secondary]}
                style={styles.recommendationGradient}
              >
                <Text style={styles.recommendationTitle}>💡 Budget Tip</Text>
                <Text style={styles.recommendationText}>
                  You're spending {((topCategory.amount / totalSpending) * 100).toFixed(0)}% 
                  of your budget on {topCategory.category}. Consider setting a monthly limit 
                  of ${(topCategory.amount * 0.9).toFixed(2)} to save more.
                </Text>
              </LinearGradient>
            </View>
            
            <View style={styles.recommendationCard}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.recommendationGradient}
              >
                <Text style={styles.recommendationTitle}>📊 Trend Alert</Text>
                <Text style={styles.recommendationText}>
                  Your average receipt amount is ${averagePerReceipt.toFixed(2)}. 
                  Try to keep receipts under ${(averagePerReceipt * 0.8).toFixed(2)} 
                  to improve your saving rate.
                </Text>
              </LinearGradient>
            </View>
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
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  timeRangeTextActive: {
    color: Colors.card,
  },
  insightsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  insightCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  insightGradient: {
    padding: 12,
    position: 'relative',
  },
  insightColorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  insightContent: {
    marginTop: 4,
  },
  insightTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  insightDetail: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recentContainer: {
    marginBottom: 24,
  },
  recentItem: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  recentGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentStore: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  recentAmount: {
    alignItems: 'flex-end',
  },
  recentTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  recentCategory: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recentCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.card,
  },
  recommendationsContainer: {
    paddingBottom: 32,
  },
  recommendationCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
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
  recommendationGradient: {
    padding: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.card,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.card,
    lineHeight: 20,
  },
});
