export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

export interface Receipt {
  id: string;
  merchantName: string; // Updated from 'store'
  date: string;
  items: ReceiptItem[];
  totalAmount: number; // Updated from 'total'
  taxAmount?: number; // Updated from 'tax'
  imageUri?: string;
  createdAt?: string;
  updatedAt?: string;
  // Keep legacy properties for backward compatibility
  store?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  category?: ReceiptCategory;
}

export type ReceiptCategory = 
  | 'Groceries'
  | 'Dining'
  | 'Shopping'
  | 'Entertainment'
  | 'Transportation'
  | 'Utilities'
  | 'Healthcare'
  | 'Other';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export interface SpendingData {
  category: string;
  amount: number;
  color: string;
}
