import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '');

export interface ExtractedReceiptData {
  merchantName: string;
  date: string;
  totalAmount: number;
  taxAmount?: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    category: string;
  }>;
}

export const extractReceiptData = async (imageUri: string): Promise<ExtractedReceiptData> => {
  try {
    if (!process.env.EXPO_PUBLIC_GOOGLE_API_KEY) {
      throw new Error('Google API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyze this receipt image and extract the following information in JSON format.
      Be as accurate as possible and use common sense for categorization.
      
      Return ONLY valid JSON in this exact format:
      {
        "merchantName": "store name",
        "date": "YYYY-MM-DD",
        "totalAmount": 0.00,
        "taxAmount": 0.00,
        "items": [
          {
            "name": "item name",
            "price": 0.00,
            "quantity": 1,
            "category": "food|entertainment|shopping|transportation|utilities|healthcare|other"
          }
        ]
      }
      
      Rules:
      - Extract merchant/store name exactly as shown
      - Convert date to YYYY-MM-DD format
      - Total amount should be the final total paid
      - Tax amount should be extracted if shown separately
      - For each item, extract name, individual price, and quantity
      - Categorize items logically:
        * food: groceries, restaurants, beverages, snacks
        * entertainment: movies, games, books, streaming
        * shopping: clothing, electronics, general merchandise
        * transportation: gas, parking, transit, ride-sharing
        * utilities: phone, internet, electricity, water
        * healthcare: pharmacy, medical, dental
        * other: anything that doesn't fit above categories
      - If you can't determine exact values, make reasonable estimates
      - Ensure all numbers are valid floats/integers
      
      Return ONLY the JSON, no other text or explanation.
    `;

    // Read the image file
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const responseText = result.response.text();
    console.log('Gemini raw response:', responseText);
    
    // Clean up the response to ensure it's valid JSON
    const cleanedResponse = responseText.trim().replace(/```json\n?|\n?```/g, '');
    console.log('Cleaned response:', cleanedResponse);
    
    try {
      const extractedData = JSON.parse(cleanedResponse);
      
      // More flexible validation - provide fallbacks for missing/null data
      extractedData.merchantName = extractedData.merchantName || 'Unknown Store';
      extractedData.date = extractedData.date || new Date().toISOString().split('T')[0];
      extractedData.totalAmount = Number(extractedData.totalAmount) || 0;
      extractedData.taxAmount = Number(extractedData.taxAmount) || 0;

      // Ensure items array exists and has valid structure
      if (!Array.isArray(extractedData.items)) {
        extractedData.items = [];
      }

      // Validate and clean items with more flexible validation
      extractedData.items = extractedData.items.filter((item: any) => 
        item && item.name && item.name !== null && item.name.trim() !== ''
      ).map((item: any) => ({
        name: item.name.toString().trim(),
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        category: item.category || 'other',
      }));

      // If no items were extracted, create a generic item
      if (extractedData.items.length === 0) {
        extractedData.items = [{
          name: 'Purchase',
          price: extractedData.totalAmount,
          quantity: 1,
          category: 'other',
        }];
      }

      console.log('Processed extracted data:', extractedData);
      
      return {
        merchantName: extractedData.merchantName.toString(),
        date: extractedData.date.toString(),
        totalAmount: Number(extractedData.totalAmount) || 0,
        taxAmount: Number(extractedData.taxAmount) || 0,
        items: extractedData.items,
      };

    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', responseText);
      console.error('Cleaned response:', cleanedResponse);
      
      // Try to extract basic info even if JSON parsing fails
      const fallbackData = createFallbackReceiptData();
      
      // Try to extract some basic info from the text if possible
      try {
        const lines = responseText.split('\n');
        const merchantMatch = lines.find(line => line.toLowerCase().includes('merchant'));
        const totalMatch = lines.find(line => line.toLowerCase().includes('total'));
        
        if (merchantMatch) {
          const merchant = merchantMatch.replace(/[^a-zA-Z0-9\s]/g, '').trim();
          if (merchant) fallbackData.merchantName = merchant;
        }
        
        if (totalMatch) {
          const amounts = totalMatch.match(/\d+\.?\d*/g);
          if (amounts && amounts.length > 0) {
            fallbackData.totalAmount = parseFloat(amounts[amounts.length - 1]);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback parsing also failed:', fallbackError);
      }
      
      return fallbackData;
    }

  } catch (error) {
    console.error('Error extracting receipt data:', error);
    
    // Return fallback data if API call fails
    return createFallbackReceiptData();
  }
};

// Create fallback receipt data when OCR fails
const createFallbackReceiptData = (): ExtractedReceiptData => {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    merchantName: 'Unknown Store',
    date: today,
    totalAmount: 0,
    taxAmount: 0,
    items: [{
      name: 'Item (please edit)',
      price: 0,
      quantity: 1,
      category: 'other',
    }],
  };
};

// Test function to validate Gemini API connection
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    if (!process.env.EXPO_PUBLIC_GOOGLE_API_KEY) {
      return false;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say 'Hello' in JSON format: {\"message\": \"Hello\"}");
    const response = result.response.text();
    
    return response.includes('Hello');
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
};
