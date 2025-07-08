import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors, CategoryColors } from '../constants/Colors';
import { SpendingData } from '../types/receipt';

interface SpendingChartProps {
  data: SpendingData[];
}

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 32;

export const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  const chartData = data.map((item, index) => ({
    name: item.category,
    population: item.amount,
    color: CategoryColors[item.category] || Colors.other,
    legendFontColor: Colors.text,
    legendFontSize: 14,
  }));

  const totalSpending = data.reduce((sum, item) => sum + item.amount, 0);

  const chartConfig = {
    backgroundGradientFrom: Colors.background,
    backgroundGradientTo: Colors.background,
    color: (opacity = 1) => `rgba(74, 111, 165, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No spending data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spending by Category</Text>
        <Text style={styles.total}>Total: ${totalSpending.toFixed(2)}</Text>
      </View>

      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute
        />
      </View>

      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: CategoryColors[item.category] || Colors.other },
              ]}
            />
            <Text style={styles.legendText}>{item.category}</Text>
            <Text style={styles.legendAmount}>${item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    margin: 16,
    padding: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legendContainer: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptyContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    margin: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
