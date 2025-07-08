const tintColorLight = '#4A6FA5';
const tintColorDark = '#9BC1BC';

export const Colors = {
  primary: '#4A6FA5',
  secondary: '#9BC1BC',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#333333',
  textSecondary: '#6C757D',
  success: '#47B881',
  error: '#EC5766',
  border: '#E9ECEF',
  highlight: '#E3F2FD',
  
  // Additional colors for categories
  groceries: '#4CAF50',
  dining: '#FF9800',
  shopping: '#E91E63',
  entertainment: '#9C27B0',
  transportation: '#2196F3',
  utilities: '#607D8B',
  healthcare: '#F44336',
  other: '#795548',
};

export const CategoryColors: Record<string, string> = {
  'Groceries': Colors.groceries,
  'Dining': Colors.dining,
  'Shopping': Colors.shopping,
  'Entertainment': Colors.entertainment,
  'Transportation': Colors.transportation,
  'Utilities': Colors.utilities,
  'Healthcare': Colors.healthcare,
  'Other': Colors.other,
};

export default {
  light: {
    text: Colors.text,
    background: Colors.background,
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
