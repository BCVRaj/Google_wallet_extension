import { Platform } from 'react-native';
import { Receipt, ReceiptItem } from '../types/receipt';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global database instance for mobile
let mobileDb: any = null;

// Initialize mobile database connection
const initMobileDatabase = async (): Promise<any> => {
  if (Platform.OS !== 'web' && !mobileDb) {
    try {
      // Dynamic import to avoid bundling on web
      const { openDatabaseSync } = await import('expo-sqlite');
      mobileDb = openDatabaseSync('app.db');
      
      // Create tables immediately after opening
      mobileDb.execSync(`
        CREATE TABLE IF NOT EXISTS receipts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          merchant_name TEXT NOT NULL,
          date TEXT NOT NULL,
          total_amount REAL NOT NULL,
          tax_amount REAL DEFAULT 0,
          image_uri TEXT,
          category TEXT DEFAULT 'Other',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      mobileDb.execSync(`
        CREATE TABLE IF NOT EXISTS receipt_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          receipt_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          quantity INTEGER DEFAULT 1,
          price REAL NOT NULL,
          category TEXT,
          FOREIGN KEY (receipt_id) REFERENCES receipts (id) ON DELETE CASCADE
        );
      `);
      
      // Add category column to existing receipts table if it doesn't exist
      try {
        mobileDb.execSync(`ALTER TABLE receipts ADD COLUMN category TEXT DEFAULT 'Other';`);
        console.log('Added category column to receipts table');
      } catch (error) {
        // Column might already exist, which is fine
        console.log('Category column already exists or migration not needed');
      }
      
      // Enable foreign key constraints for SQLite
      mobileDb.execSync('PRAGMA foreign_keys = ON;');
      
      console.log('SQLite database connection established and tables created');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      mobileDb = null;
    }
  }
  return mobileDb;
};

// Helper function to ensure database connection
const ensureDatabaseConnection = async (): Promise<any> => {
  if (Platform.OS === 'web') {
    return null; // Web uses AsyncStorage
  }
  
  // Always try to get a fresh connection
  if (!mobileDb) {
    mobileDb = await initMobileDatabase();
  }
  
  // If still null, try one more time
  if (!mobileDb) {
    console.log('Retrying database connection...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    mobileDb = await initMobileDatabase();
  }
  
  if (!mobileDb) {
    throw new Error('Failed to establish database connection after retries');
  }
  
  return mobileDb;
};

// Initialize database
export const initDatabase = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Web initialization using AsyncStorage
      await AsyncStorage.getItem('receipts');
      console.log('AsyncStorage database initialized successfully');
    } else {
      // Mobile initialization using SQLite
      const db = await initMobileDatabase();
      if (db) {
        console.log('SQLite database initialized successfully');
      } else {
        throw new Error('Failed to initialize SQLite database');
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Get all receipts
export const getAllReceiptsFromDatabase = async (): Promise<Receipt[]> => {
  try {
    if (Platform.OS === 'web') {
      // Web version using AsyncStorage
      const receiptsJson = await AsyncStorage.getItem('receipts');
      return receiptsJson ? JSON.parse(receiptsJson) : [];
    } else {
      // Mobile version using SQLite
      const db = await ensureDatabaseConnection();
      
      const receipts = db.getAllSync(`
        SELECT * FROM receipts ORDER BY created_at DESC
      `);

      return receipts.map((receipt: any) => {
        // Get items for this receipt
        const items = db.getAllSync(`
          SELECT * FROM receipt_items WHERE receipt_id = ?
        `, [receipt.id]).map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category
        }));

        return {
          id: receipt.id.toString(),
          merchantName: receipt.merchant_name,
          date: receipt.date,
          totalAmount: receipt.total_amount,
          taxAmount: receipt.tax_amount,
          imageUri: receipt.image_uri,
          category: receipt.category,
          items: items,
          createdAt: receipt.created_at,
          updatedAt: receipt.updated_at
        };
      });
    }
  } catch (error) {
    console.error('Error getting receipts from database:', error);
    return [];
  }
};

// Save receipt to database
export const saveReceiptToDatabase = async (receiptData: any): Promise<void> => {
  try {
    // Ensure all required fields have valid values
    const merchantName = receiptData.merchantName || 'Unknown Store';
    const date = receiptData.date || new Date().toISOString().split('T')[0];
    const totalAmount = Number(receiptData.totalAmount || receiptData.total || 0);
    const taxAmount = Number(receiptData.taxAmount || 0);
    const imageUri = receiptData.imageUri || null;
    const category = receiptData.category || 'Other';
    const items = receiptData.items || [];

    if (Platform.OS === 'web') {
      // Web version using AsyncStorage
      const receiptsJson = await AsyncStorage.getItem('receipts');
      const receipts = receiptsJson ? JSON.parse(receiptsJson) : [];
      
      const newReceipt: Receipt = {
        id: (Date.now() + Math.random()).toString(),
        merchantName,
        date,
        totalAmount,
        taxAmount,
        imageUri,
        category,
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      receipts.push(newReceipt);
      await AsyncStorage.setItem('receipts', JSON.stringify(receipts));
      console.log('Receipt saved to AsyncStorage');
    } else {
      // Mobile version using SQLite
      const db = await ensureDatabaseConnection();

      // Insert receipt with validated data
      const result = db.runSync(`
        INSERT INTO receipts (merchant_name, date, total_amount, tax_amount, image_uri, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [merchantName, date, totalAmount, taxAmount, imageUri, category]);

      const receiptId = result.lastInsertRowId;

      // Insert receipt items
      if (items && Array.isArray(items)) {
        items.forEach((item: any) => {
          db.runSync(`
            INSERT INTO receipt_items (receipt_id, name, quantity, price, category)
            VALUES (?, ?, ?, ?, ?)
          `, [receiptId, item.name || 'Unknown Item', item.quantity || 1, Number(item.price || 0), item.category || 'Other']);
        });
      }

      console.log('Receipt saved to SQLite database');
    }
  } catch (error) {
    console.error('Error saving receipt to database:', error);
    throw error;
  }
};

// Get receipt by ID
export const getReceiptById = async (id: string): Promise<Receipt | null> => {
  try {
    if (Platform.OS === 'web') {
      // Web version using AsyncStorage
      const receiptsJson = await AsyncStorage.getItem('receipts');
      const receipts = receiptsJson ? JSON.parse(receiptsJson) : [];
      return receipts.find((receipt: Receipt) => receipt.id === id) || null;
    } else {
      // Mobile version using SQLite
      const db = await ensureDatabaseConnection();
      
      const receipt = db.getFirstSync(`
        SELECT * FROM receipts WHERE id = ?
      `, [parseInt(id)]);

      if (!receipt) return null;

      // Get items for this receipt
      const items = db.getAllSync(`
        SELECT * FROM receipt_items WHERE receipt_id = ?
      `, [receipt.id]).map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category
      }));

      return {
        id: receipt.id.toString(),
        merchantName: receipt.merchant_name,
        date: receipt.date,
        totalAmount: receipt.total_amount,
        taxAmount: receipt.tax_amount,
        imageUri: receipt.image_uri,
        category: receipt.category,
        items: items,
        createdAt: receipt.created_at,
        updatedAt: receipt.updated_at
      };
    }
  } catch (error) {
    console.error('Error getting receipt by ID from database:', error);
    return null;
  }
};

// Update receipt in database
export const updateReceiptInDatabase = async (id: string, receiptData: any): Promise<void> => {
  try {
    // Get existing receipt for fallback values
    const existingReceipt = await getReceiptById(id);
    if (!existingReceipt) {
      throw new Error('Receipt not found');
    }

    // Ensure all required fields have valid values with fallbacks to existing data
    const merchantName = receiptData.merchantName || existingReceipt.merchantName || 'Unknown Store';
    const date = receiptData.date || existingReceipt.date || new Date().toISOString().split('T')[0];
    const totalAmount = Number(receiptData.totalAmount || receiptData.total || existingReceipt.totalAmount || 0);
    const taxAmount = Number(receiptData.taxAmount || receiptData.tax || existingReceipt.taxAmount || 0);
    const imageUri = receiptData.imageUri !== undefined ? receiptData.imageUri : existingReceipt.imageUri;
    const category = receiptData.category || existingReceipt.category || 'Other';
    const items = receiptData.items || existingReceipt.items || [];

    if (Platform.OS === 'web') {
      // Web version using AsyncStorage
      const receiptsJson = await AsyncStorage.getItem('receipts');
      const receipts = receiptsJson ? JSON.parse(receiptsJson) : [];
      const index = receipts.findIndex((receipt: Receipt) => receipt.id === id);
      
      if (index !== -1) {
        receipts[index] = {
          ...receipts[index],
          merchantName,
          date,
          totalAmount,
          taxAmount,
          imageUri,
          category,
          items,
          updatedAt: new Date().toISOString()
        };
        await AsyncStorage.setItem('receipts', JSON.stringify(receipts));
        console.log('Receipt updated in AsyncStorage');
      }
    } else {
      // Mobile version using SQLite
      const db = await ensureDatabaseConnection();

      // Update receipt with validated data
      db.runSync(`
        UPDATE receipts 
        SET merchant_name = ?, date = ?, total_amount = ?, tax_amount = ?, image_uri = ?, category = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [merchantName, date, totalAmount, taxAmount, imageUri, category, parseInt(id)]);

      // Delete existing items
      db.runSync(`DELETE FROM receipt_items WHERE receipt_id = ?`, [parseInt(id)]);

      // Insert new items with validation
      if (items && Array.isArray(items)) {
        items.forEach((item: any) => {
          db.runSync(`
            INSERT INTO receipt_items (receipt_id, name, quantity, price, category)
            VALUES (?, ?, ?, ?, ?)
          `, [parseInt(id), item.name || 'Unknown Item', item.quantity || 1, Number(item.price || 0), item.category || 'Other']);
        });
      }

      console.log('Receipt updated in SQLite database');
    }
  } catch (error) {
    console.error('Error updating receipt in database:', error);
    throw error;
  }
};

// Delete receipt from database
export const deleteReceiptFromDatabase = async (id: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Web version using AsyncStorage
      const receiptsJson = await AsyncStorage.getItem('receipts');
      const receipts = receiptsJson ? JSON.parse(receiptsJson) : [];
      const filteredReceipts = receipts.filter((receipt: Receipt) => receipt.id !== id);
      await AsyncStorage.setItem('receipts', JSON.stringify(filteredReceipts));
      console.log('Receipt deleted from AsyncStorage');
    } else {
      // Mobile version using SQLite
      const db = await ensureDatabaseConnection();
      
      db.runSync(`DELETE FROM receipts WHERE id = ?`, [parseInt(id)]);
      console.log('Receipt deleted from SQLite database');
    }
  } catch (error) {
    console.error('Error deleting receipt from database:', error);
    throw error;
  }
};

// Get receipt insights
export const getReceiptInsights = async (): Promise<any> => {
  try {
    const receipts = await getAllReceiptsFromDatabase();
    const totalSpending = receipts.reduce((sum, receipt) => sum + (receipt.totalAmount || 0), 0);
    
    // Calculate category breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const category = item.category || 'Other';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + item.price;
      });
    });

    return {
      totalSpending,
      categoryBreakdown,
      recentTransactions: receipts.slice(0, 5),
      totalReceipts: receipts.length,
      averageSpending: receipts.length > 0 ? totalSpending / receipts.length : 0,
      topCategories: Object.entries(categoryBreakdown).map(([category, total]) => ({
        category,
        total,
        count: receipts.reduce((count, receipt) => 
          count + receipt.items.filter(item => (item.category || 'Other') === category).length, 0
        )
      })).sort((a, b) => b.total - a.total),
      monthlySpending: [] // Can be expanded later
    };
  } catch (error) {
    console.error('Error getting insights from database:', error);
    return { 
      totalSpending: 0, 
      categoryBreakdown: {}, 
      recentTransactions: [],
      totalReceipts: 0,
      averageSpending: 0,
      topCategories: [],
      monthlySpending: []
    };
  }
};

// Get receipt items
export const getReceiptItems = async (receiptId: number): Promise<ReceiptItem[]> => {
  try {
    const receipt = await getReceiptById(receiptId.toString());
    return receipt?.items || [];
  } catch (error) {
    console.error('Error getting receipt items from database:', error);
    return [];
  }
};
