# Receipt Management App

A production-ready React Native receipt management app with AI-powered insights, built using Expo and TypeScript. The app features real AI-powered receipt OCR, robust database management, spending analytics, and an intelligent financial assistant.

## 🎯 Features

### Core Functionality
- **AI Receipt Scanning**: Real OCR using Google Gemini Vision API for accurate receipt data extraction
- **Receipt Management**: Full CRUD operations with validation and error handling
- **Dual Database System**: SQLite for mobile (offline-first) and AsyncStorage for web
- **Spending Analytics**: Category-based charts and comprehensive financial insights
- **AI Assistant**: Intelligent chat with contextual financial advice using Gemini API
- **Cross-Platform**: Native mobile apps and web deployment ready

### Key Screens
- **Home**: Receipt list with search, filtering, and category-based organization
- **Scan**: Live camera interface with real-time AI processing (gallery fallback for web)
- **Analytics**: Interactive spending charts, trends, and AI-generated insights
- **Assistant**: Context-aware AI chat for financial advice and spending analysis
- **Receipt Details**: View, edit, and delete individual receipts with category management

## 🛠 Tech Stack

### Frontend
- **React Native** 0.79.1 - Cross-platform mobile framework
- **TypeScript** - Type safety and better development experience
- **Expo** SDK 53 - Development platform and tooling
- **Expo Router** - File-based navigation system

### AI & Machine Learning
- **Google Gemini Vision API** - Real OCR for receipt scanning
- **Google Gemini API** - Intelligent chat assistant
- **Context-Aware AI** - Personalized financial insights

### Database & Storage
- **SQLite** (Mobile) - Robust offline database with migrations
- **AsyncStorage** (Web) - Browser-based local storage
- **Zustand** - State management with persistence
- **Database Validation** - Comprehensive error handling and data integrity

### UI & Visualization
- **Expo Linear Gradient** - Beautiful gradient effects
- **React Native Chart Kit** - Interactive data visualization
- **Lucide React Native** - Modern icon library
- **Platform-Specific Design** - iOS and Android optimizations

### Camera & Media
- **Expo Camera** - Live camera functionality with AI processing
- **Expo Image Picker** - Gallery access and image selection
- **Expo Haptics** - Tactile feedback for better UX

### Infrastructure
- **EAS Build** - Production-ready app builds
- **Cross-Platform Deployment** - Web hosting and mobile distribution
- **Environment Configuration** - Secure API key management

## 📱 Architecture

### File Structure
```
app/
├── (tabs)/                 # Tab-based navigation
│   ├── _layout.tsx        # Tab navigator configuration
│   ├── index.tsx          # Home screen (receipt list)
│   ├── scan.tsx           # Camera/scanning screen with AI
│   ├── two.tsx            # Analytics and spending insights
│   └── assistant.tsx      # AI chat interface
├── receipt/
│   ├── [id].tsx          # Receipt detail view
│   └── edit/[id].tsx     # Receipt editing with validation
└── _layout.tsx           # Root navigation layout

components/
├── ReceiptCard.tsx       # Receipt list item component
├── EmptyState.tsx        # Empty state with call-to-action
├── SpendingChart.tsx     # Category spending visualization
├── ChatMessage.tsx       # Chat bubble component
└── ChatInput.tsx         # Message input with send button

services/
├── database.ts           # Dual database implementation
├── geminiVision.ts       # AI receipt OCR service
└── geminiAssistant.ts    # AI chat assistant service

store/
└── receiptStore.ts       # Zustand store with persistence

types/
└── receipt.ts            # TypeScript interfaces

constants/
└── Colors.ts             # App color scheme

mocks/
└── receipts.ts           # Sample data for development
```

### Design System
- **Primary Color**: #4A6FA5 (Blue)
- **Secondary Color**: #9BC1BC (Teal)
- **iOS/Linear Inspired**: Clean, minimal interface
- **Cross-Platform**: Responsive design with platform-specific optimizations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd receipt-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in root directory
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on platforms**
   ```bash
   # iOS (requires macOS)
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📊 Features Deep Dive

### AI-Powered Receipt Scanning
- **Real OCR Processing**: Google Gemini Vision API extracts text from receipt images
- **Smart Data Parsing**: Intelligent extraction of merchant name, date, items, and totals
- **Error Handling**: Robust fallback mechanisms for parsing failures
- **Live Camera Preview**: Real-time camera feed with overlay frame
- **Cross-Platform**: Native camera on mobile, gallery picker on web

### Robust Database Management
- **Dual Database System**: SQLite for mobile (offline-first), AsyncStorage for web
- **Data Validation**: Comprehensive input validation and error handling
- **Database Migrations**: Automatic schema updates and column additions
- **CRUD Operations**: Full create, read, update, delete with proper constraints
- **Category Management**: Persistent category assignments and filtering

### Analytics & Insights
- **Interactive Charts**: Pie chart visualization of spending by category
- **AI-Generated Insights**: Context-aware recommendations based on spending patterns
- **Category Breakdown**: Detailed spending analysis by category
- **Trend Analysis**: Historical spending patterns and insights
- **Smart Recommendations**: Personalized budget tips and savings advice

### Intelligent AI Assistant
- **Context-Aware Responses**: AI understands your spending patterns and history
- **Financial Advice**: Personalized budget recommendations and savings tips
- **Spending Analysis**: Real-time analysis of your financial data
- **Natural Conversations**: Conversational interface for financial queries
- **Error Handling**: Graceful handling of API failures and rate limits

### Data Management
- **SQLite Database**: Robust offline-first database for mobile platforms
- **AsyncStorage**: Browser-compatible storage for web deployment
- **State Persistence**: App state maintained across sessions with automatic recovery
- **Data Validation**: Comprehensive input validation and error handling
- **Database Migrations**: Automatic schema updates and data integrity
- **Category System**: Persistent category assignments with filtering capabilities

## 🎨 UI Components

### ReceiptCard
- Gradient backgrounds with category color coding
- Store name, date, total amount, and item count
- Platform-specific shadows and styling
- Tap to view details

### SpendingChart
- Interactive pie chart using react-native-chart-kit
- Color-coded categories with legend
- Empty state handling
- Total spending display

### ChatMessage
- User and AI message bubbles
- Timestamp display
- Platform-specific styling
- Gradient backgrounds for user messages

## 🔧 Development

### State Management
```typescript
// Zustand store with TypeScript and persistence
interface ReceiptState {
  receipts: Receipt[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  
  // CRUD operations with validation
  addReceipt: (receipt: Receipt) => Promise<void>;
  updateReceipt: (id: string, receipt: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  
  // Query methods
  getTotalSpending: () => number;
  getCategorySpending: () => Record<string, number>;
  
  // AI Integration
  addChatMessage: (message: ChatMessage) => void;
  sendMessageToAI: (message: string) => Promise<void>;
}
```

### Database Schema
```sql
-- SQLite schema for mobile
CREATE TABLE receipts (
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

CREATE TABLE receipt_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price REAL NOT NULL,
  category TEXT,
  FOREIGN KEY (receipt_id) REFERENCES receipts (id) ON DELETE CASCADE
);
```

### AI Integration
```typescript
// Gemini Vision API for receipt OCR
const extractReceiptData = async (imageUri: string): Promise<ReceiptData> => {
  const response = await fetch(GEMINI_VISION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: RECEIPT_EXTRACTION_PROMPT },
          { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
        ]
      }]
    })
  });
  
  return parseReceiptResponse(response);
};

// Gemini API for chat assistant
const getChatResponse = async (message: string, context: string): Promise<string> => {
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${context}\n\nUser: ${message}` }]
      }]
    })
  });
  
  return parseChatResponse(response);
};
```

### TypeScript Types
```typescript
interface Receipt {
  id: string;
  merchantName: string;
  date: string;
  totalAmount: number;
  taxAmount: number;
  imageUri?: string;
  category: ReceiptCategory;
  items: ReceiptItem[];
  createdAt: string;
  updatedAt: string;
}

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

type ReceiptCategory = 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Health' | 'Other';
```

### Platform Handling
```typescript
// Database selection based on platform
const getDatabase = async () => {
  if (Platform.OS === 'web') {
    return AsyncStorage; // Web compatibility
  } else {
    const { openDatabaseSync } = await import('expo-sqlite');
    return openDatabaseSync('app.db'); // Native SQLite
  }
};

// Camera vs Gallery based on platform
{Platform.OS !== 'web' ? (
  <CameraView 
    facing="back"
    onBarcodeScanned={undefined}
    style={styles.camera}
  />
) : (
  <ImagePicker 
    onImageSelected={handleImageSelected}
    style={styles.imagePicker}
  />
)}
```

## 🧪 Testing & Development

### API Key Setup
- **Gemini API Key**: Required for AI features (OCR and chat)
- **Environment Variables**: Secure configuration management
- **Fallback Handling**: Graceful degradation when API is unavailable

### Sample Data
- **Realistic Receipts**: 5 sample receipts with proper data structure
- **Category Distribution**: Balanced categories for testing analytics
- **Database Initialization**: Automatic sample data population

### Error Handling
- **Network Failures**: Graceful handling of API timeouts
- **Database Errors**: Robust error recovery and logging
- **Input Validation**: Comprehensive data validation
- **User Feedback**: Clear error messages and loading states

## 📱 Cross-Platform Compatibility

### iOS
- Native camera integration
- Haptic feedback
- iOS-style navigation and animations
- Safe area handling

### Android
- Material Design elements
- Android-specific elevation shadows
- Proper back button handling

### Web
- Gallery picker fallback for camera
- Web-compatible styling
- Responsive design

## 🚀 Deployment

### Development Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure
```

### Mobile App Build (Standalone)
```bash
# Android APK (Direct installation)
eas build --platform android --profile preview

# iOS Build (Requires Apple Developer Account)
eas build --platform ios --profile preview

# Production builds
eas build --profile production --platform all
```

### Web Deployment
```bash
# Build for web
npx expo export --platform web

# Deploy to hosting services
# - Vercel (recommended)
# - Netlify  
# - Firebase Hosting
# - GitHub Pages
```

### Distribution Options
- **Mobile**: Direct APK installation, App Store/Play Store
- **Web**: Public hosting with global access
- **Development**: Expo Go with tunnel mode for cross-location testing

## � Configuration

### Environment Variables
```bash
# .env file
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### Database Configuration
- **SQLite**: Automatic initialization and migration
- **AsyncStorage**: Web-compatible fallback
- **Data Validation**: Comprehensive input validation
- **Error Recovery**: Robust error handling and logging

### AI Configuration
- **OCR Processing**: Gemini Vision API for receipt scanning
- **Chat Assistant**: Gemini API for conversational AI
- **Context Awareness**: Spending data integration
- **Rate Limiting**: Proper API usage management

## 📱 Cross-Platform Features

### Mobile (iOS/Android)
- **SQLite Database**: Robust offline-first storage
- **Native Camera**: Live camera preview with AI processing
- **Haptic Feedback**: Enhanced user experience
- **Platform-Specific UI**: iOS and Android design guidelines

### Web
- **AsyncStorage**: Browser-compatible local storage
- **Image Upload**: Gallery picker for receipt images
- **Responsive Design**: Mobile-first responsive layout
- **Progressive Web App**: Web app manifest and service worker ready

## � Security & Privacy

### Data Protection
- **Local Storage**: All data stored locally on user's device
- **No Cloud Sync**: Complete data privacy and ownership
- **Secure API**: Encrypted API communication
- **Input Validation**: Comprehensive data sanitization

### API Security
- **Environment Variables**: Secure API key management
- **Rate Limiting**: Proper API usage controls
- **Error Handling**: No sensitive data in error messages
- **Timeout Management**: Graceful handling of API failures

## 📈 Performance & Optimization

### Database Performance
- **Efficient Queries**: Optimized SQL queries with proper indexing
- **Connection Pooling**: Singleton database connections
- **Lazy Loading**: On-demand data loading
- **Caching**: Intelligent state caching with Zustand

### AI Performance
- **Image Optimization**: Compressed image uploads for faster processing
- **Response Caching**: Intelligent caching of AI responses
- **Error Recovery**: Graceful fallback mechanisms
- **Rate Limiting**: Proper API usage management

### UI Performance
- **React Native Optimization**: Efficient component rendering
- **Image Loading**: Optimized image handling and caching
- **Navigation**: Smooth transitions and proper state management
- **Memory Management**: Efficient resource usage

## 🛠 Development Tools

### Code Quality
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit validation

### Development Features
- **Hot Reload**: Instant code changes
- **Debug Tools**: Comprehensive debugging support
- **Error Boundaries**: Graceful error handling
- **Logging**: Comprehensive logging system

## 📱 Device Compatibility

### Mobile Requirements
- **iOS**: 13.0+ (iPhone 6s and newer)
- **Android**: API level 21+ (Android 5.0+)
- **Storage**: Minimum 100MB available space
- **Camera**: Rear camera required for scanning

### Web Requirements
- **Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Storage**: LocalStorage support required
- **Image Upload**: File API support for receipt images
- **Responsive**: Mobile-first responsive design

## 🔄 Migration & Updates

### Database Migration
- **Automatic Updates**: Schema updates handled automatically
- **Data Integrity**: Comprehensive data validation
- **Backup Strategy**: Local data persistence
- **Version Control**: Migration tracking and rollback

### App Updates
- **Over-the-Air Updates**: Expo OTA updates for quick fixes
- **Version Management**: Semantic versioning
- **Compatibility**: Backward compatibility maintenance
- **User Notification**: Update prompts and changelogs

## 📊 Analytics & Insights

### User Analytics
- **Spending Patterns**: Category-based spending analysis
- **Trend Analysis**: Historical spending trends
- **Budget Insights**: AI-generated budget recommendations
- **Goal Tracking**: Spending goals and progress

### Data Insights
- **Category Distribution**: Visual spending breakdown
- **Time-based Analysis**: Monthly and weekly trends
- **Merchant Analysis**: Top merchants and spending patterns
- **AI Recommendations**: Personalized financial advice

## 🔧 Troubleshooting

### Common Issues
- **Database Errors**: Connection and migration issues
- **API Failures**: Network and rate limiting issues
- **Camera Issues**: Permissions and hardware problems
- **Build Errors**: Platform-specific build issues

### Debug Steps
1. Check environment variables and API keys
2. Verify database initialization and migrations
3. Test camera permissions and functionality
4. Validate network connectivity for AI features
5. Check platform-specific requirements

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Set up environment variables
5. Run the development server: `npm start`

### Contribution Guidelines
- Follow TypeScript best practices
- Add proper type definitions
- Include comprehensive error handling
- Test on both mobile and web platforms
- Update documentation as needed

### Code Style
- Use TypeScript strict mode
- Follow React Native best practices
- Implement proper error boundaries
- Add meaningful comments and documentation
- Use consistent naming conventions

## 📞 Support

### Documentation
- **README**: Comprehensive setup and usage guide
- **Code Comments**: Inline documentation
- **Type Definitions**: Full TypeScript support
- **Error Messages**: Clear and actionable error messages

### Community Support
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community discussions and Q&A
- **Pull Requests**: Code contributions welcome
- **Documentation**: Contributions to improve documentation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

### Third-Party Licenses
- **Expo**: MIT License
- **React Native**: MIT License
- **Zustand**: MIT License
- **SQLite**: Public Domain
- **Google Gemini API**: Google Terms of Service

---

**Built with ❤️ using React Native, Expo, and TypeScript**

*A production-ready receipt management app with AI-powered insights and cross-platform compatibility.*
