import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt, ReceiptCategory, ChatMessage } from '../types/receipt';
import { 
  getAllReceiptsFromDatabase, 
  saveReceiptToDatabase, 
  updateReceiptInDatabase, 
  deleteReceiptFromDatabase,
  getReceiptById as getReceiptByIdFromDB,
  initDatabase,
  getReceiptInsights
} from '../services/database';

interface ReceiptState {
  receipts: Receipt[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Database operations
  loadReceipts: () => Promise<void>;
  initializeDatabase: () => Promise<void>;
  
  // Receipt CRUD operations
  addReceipt: (receipt: Receipt) => Promise<void>;
  updateReceipt: (id: string, receipt: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  
  // Query methods
  getReceiptById: (id: string) => Receipt | undefined;
  getReceiptsByCategory: (category: ReceiptCategory) => Receipt[];
  getTotalSpending: () => number;
  getCategorySpending: () => Record<string, number>;
  getSpendingInsights: () => Promise<any>;
  
  // Chat methods
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  
  // Utility methods
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeWithMockData: () => void;
}

export const useReceiptStore = create<ReceiptState>()(
  persist(
    (set, get) => ({
      receipts: [],
      chatMessages: [],
      isLoading: false,
      error: null,
      
      // Initialize database
      initializeDatabase: async () => {
        try {
          set({ isLoading: true, error: null });
          await initDatabase();
          await get().loadReceipts();
        } catch (error) {
          console.error('Failed to initialize database:', error);
          set({ error: 'Failed to initialize database' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Load receipts from database
      loadReceipts: async () => {
        try {
          set({ isLoading: true, error: null });
          const receipts = await getAllReceiptsFromDatabase();
          set({ receipts });
        } catch (error) {
          console.error('Failed to load receipts:', error);
          set({ error: 'Failed to load receipts' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Add receipt to database and store
      addReceipt: async (receipt: Receipt) => {
        try {
          set({ isLoading: true, error: null });
          
          // Calculate totalAmount if not provided
          let totalAmount = receipt.totalAmount || receipt.total;
          if (!totalAmount && receipt.items && receipt.items.length > 0) {
            totalAmount = receipt.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          }
          
          await saveReceiptToDatabase({
            merchantName: receipt.merchantName || receipt.store || 'Unknown Store',
            date: receipt.date,
            totalAmount: totalAmount || 0,
            taxAmount: receipt.taxAmount || receipt.tax || 0,
            imageUri: receipt.imageUri,
            items: receipt.items.map(item => ({
              ...item,
              category: item.category || 'Other'
            })),
          });
          
          // Reload receipts from database to get the latest state
          await get().loadReceipts();
          
        } catch (error) {
          console.error('Failed to add receipt:', error);
          set({ error: 'Failed to save receipt' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Update receipt in database and store
      updateReceipt: async (id: string, updatedReceipt: Partial<Receipt>) => {
        try {
          set({ isLoading: true, error: null });
          
          await updateReceiptInDatabase(id, updatedReceipt);
          
          // Reload receipts from database to ensure consistency
          await get().loadReceipts();
          
        } catch (error) {
          console.error('Failed to update receipt:', error);
          set({ error: 'Failed to update receipt' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Delete receipt from database and store
      deleteReceipt: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          await deleteReceiptFromDatabase(id);
          
          // Reload receipts from database to ensure consistency
          await get().loadReceipts();
          
        } catch (error) {
          console.error('Failed to delete receipt:', error);
          set({ error: 'Failed to delete receipt' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      getReceiptById: (id: string) => {
        const state = get();
        return state.receipts.find(receipt => receipt.id === id);
      },
      
      getReceiptsByCategory: (category: ReceiptCategory) => {
        const state = get();
        return state.receipts.filter(receipt => receipt.category === category);
      },
      
      getTotalSpending: () => {
        const state = get();
        return state.receipts.reduce((total, receipt) => {
          return total + (receipt.totalAmount || receipt.total || 0);
        }, 0);
      },
      
      getCategorySpending: () => {
        const state = get();
        return state.receipts.reduce((acc, receipt) => {
          const category = receipt.category || 'Other';
          const amount = receipt.totalAmount || receipt.total || 0;
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        }, {} as Record<string, number>);
      },
      
      getSpendingInsights: async () => {
        try {
          return getReceiptInsights();
        } catch (error) {
          console.error('Failed to get spending insights:', error);
          return {
            totalSpending: 0,
            totalReceipts: 0,
            averageSpending: 0,
            topCategories: [],
            monthlySpending: [],
          };
        }
      },
      
      addChatMessage: (message: ChatMessage) => set((state) => ({
        chatMessages: [...state.chatMessages, message],
      })),
      
      clearChatHistory: () => set({ chatMessages: [] }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setError: (error: string | null) => set({ error }),
      
      initializeWithMockData: () => set({
        receipts: [],
        chatMessages: [
          {
            id: '1',
            text: 'Hello! I\'m your AI financial assistant powered by Gemini AI. I can analyze your spending patterns, provide budget insights, and answer questions about your receipts. Start by scanning a receipt to get personalized advice!',
            isUser: false,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    }),
    {
      name: 'receipt-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
