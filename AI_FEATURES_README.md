# Receipt Management App - AI-Powered Features

This Receipt Management App now includes **AI-powered features** using **Gemini Vision for OCR** and **Gemini 2.5 Flash for the AI assistant**, with **SQLite database** for persistent storage.

## 🆕 New Features Implemented

### 1. **Gemini Vision OCR Integration**
- Automatically extracts receipt data from images
- Identifies merchant name, date, total amount, tax, and individual items
- Categorizes items intelligently (food, entertainment, shopping, etc.)
- Fallback to manual entry if OCR fails

### 2. **SQLite Database Storage**
- Persistent storage in `app.db`
- Stores receipts, items, and categories
- Real-time analytics and insights
- Data persists across app restarts

### 3. **Gemini 2.5 Flash AI Assistant**
- Contextual chat responses based on your actual spending data
- Personalized financial advice and insights
- Spending pattern analysis
- Budget recommendations

### 4. **Enhanced Analytics**
- Real-time spending insights from database
- Category breakdowns and trends
- Monthly spending analysis
- Smart recommendations

## 🔧 Setup Instructions

### 1. **Get Gemini API Key**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. **Configure Environment**
1. Open `.env` file in the project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. **Install Dependencies**
All required dependencies are already installed:
- `@google/generative-ai` - Gemini AI integration
- `expo-sqlite` - Database functionality
- `expo-file-system` - File operations

## 📱 How to Use

### **Scanning Receipts with OCR**
1. Go to the **Scan** tab
2. Take a photo of your receipt or select from gallery
3. AI will automatically extract:
   - Store name
   - Date
   - Total amount
   - Tax amount
   - Individual items with prices
   - Item categories
4. Review and edit the extracted data if needed

### **AI Assistant Chat**
1. Go to the **Assistant** tab
2. Ask questions about your spending:
   - "How much did I spend this month?"
   - "What's my top spending category?"
   - "Give me budget advice"
   - "How can I save money on groceries?"
3. Get personalized responses based on your actual data

### **Analytics & Insights**
1. Go to the **Insights** tab
2. View real-time analytics:
   - Total spending from database
   - Category breakdowns
   - Monthly trends
   - AI-powered recommendations

## 🔄 Data Flow

```
Receipt Image → Gemini Vision → Extract Data → SQLite Database → Zustand Store → UI
                     ↓
                Real-time Analytics ← Database Queries ← AI Assistant
```

## 🗃️ Database Schema

### Receipts Table
- `id` - Primary key
- `merchant_name` - Store name
- `date` - Receipt date
- `total_amount` - Final total
- `tax_amount` - Tax amount
- `image_uri` - Photo path
- `created_at` - Timestamp

### Receipt Items Table
- `id` - Primary key
- `receipt_id` - Foreign key
- `name` - Item name
- `price` - Item price
- `quantity` - Quantity
- `category` - Item category

## 🎯 Key Benefits

### **No More Manual Entry**
- OCR extracts all data automatically
- Smart categorization
- Reduce data entry time by 90%

### **Real Insights**
- AI understands your spending patterns
- Personalized advice based on actual data
- Actionable recommendations

### **Persistent Data**
- All data stored in SQLite database
- Fast queries and analytics
- Data survives app restarts

## 🚨 Troubleshooting

### **OCR Not Working**
- Check internet connection
- Verify Gemini API key is correct
- Ensure clear, well-lit receipt photos
- Falls back to manual entry if OCR fails

### **AI Assistant Not Responding**
- Check Gemini API key configuration
- Verify internet connection
- Check API quota/billing
- Falls back to basic responses

### **Database Issues**
- Database auto-initializes on first run
- Data persists in device storage
- Clear app data to reset database

## 🔒 Privacy & Security

- All data stored locally on device
- Gemini API calls are encrypted
- Images processed temporarily
- No personal data shared beyond what you input

## 📈 Future Enhancements

- Receipt sharing and export
- Advanced budget tracking
- Spending goal setting
- Receipt categorization improvements
- Offline OCR capabilities

## 🛠️ Development

The implementation includes:
- `services/database.ts` - SQLite operations
- `services/geminiVision.ts` - OCR integration
- `services/geminiAssistant.ts` - AI chat
- Updated Zustand store with database sync
- Enhanced UI components for new features

Start scanning receipts and chatting with your AI financial assistant! 🎉
