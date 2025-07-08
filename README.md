# Receipt Management App

A production-ready React Native receipt management app with AI-powered insights, built using Expo and TypeScript. The app allows users to scan receipts, track spending, get financial insights, and interact with an AI assistant.

## 🎯 Features

### Core Functionality
- **Receipt Scanning**: Use camera to scan receipts with mock AI processing
- **Receipt Management**: Create, read, update, and delete receipts
- **Spending Analytics**: Category-based charts and financial insights
- **AI Assistant**: Chat interface for financial advice and insights
- **Cross-Platform**: Works on iOS, Android, and Web

### Key Screens
- **Home**: Receipt list with search, filtering, and category selection
- **Scan**: Camera interface for receipt scanning (gallery fallback for web)
- **Insights**: Spending charts, trends, and smart recommendations
- **Assistant**: AI chat for financial advice and recipe suggestions

## 🛠 Tech Stack

### Frontend
- **React Native** 0.79.1 - Cross-platform mobile framework
- **TypeScript** - Type safety and better development experience
- **Expo** SDK 53 - Development platform and tooling
- **Expo Router** - File-based navigation system

### State Management & Storage
- **Zustand** - Lightweight state management
- **AsyncStorage** - Local data persistence

### UI & Visualization
- **Expo Linear Gradient** - Beautiful gradient effects
- **React Native Chart Kit** - Data visualization
- **FontAwesome Icons** - Icon library

### Camera & Media
- **Expo Camera** - Camera functionality
- **Expo Image Picker** - Gallery access
- **Expo Haptics** - Tactile feedback

## 📱 Architecture

### File Structure
```
app/
├── (tabs)/                 # Tab-based navigation
│   ├── _layout.tsx        # Tab navigator configuration
│   ├── index.tsx          # Home screen (receipt list)
│   ├── scan.tsx           # Camera/scanning screen
│   ├── two.tsx            # Analytics and spending insights
│   └── assistant.tsx      # AI chat interface
├── receipt/
│   ├── [id].tsx          # Receipt detail view
│   └── edit/[id].tsx     # Receipt editing interface
└── _layout.tsx           # Root navigation layout

components/
├── ReceiptCard.tsx       # Receipt list item component
├── EmptyState.tsx        # Empty state with call-to-action
├── SpendingChart.tsx     # Category spending visualization
├── ChatMessage.tsx       # Chat bubble component
└── ChatInput.tsx         # Message input with send button

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

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on platforms**
   ```bash
   # iOS (requires macOS)
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📊 Features Deep Dive

### Receipt Scanning
- **Live Camera Preview**: Real-time camera feed with overlay frame
- **Photo Capture**: Take photos directly or select from gallery
- **Mock AI Processing**: Simulates receipt data extraction
- **Cross-Platform**: Camera on native, gallery picker on web

### Analytics & Insights
- **Category Breakdown**: Pie chart visualization of spending by category
- **Smart Recommendations**: AI-powered budget tips and savings advice
- **Recent Activity**: Timeline of recent purchases
- **Trend Analysis**: Spending patterns and insights

### AI Assistant
- **Contextual Responses**: AI understands your spending patterns
- **Budget Advice**: Personalized financial recommendations
- **Recipe Suggestions**: Based on grocery purchases
- **Spending Analysis**: Category breakdowns and trend analysis

### Data Management
- **Local Storage**: All data stored locally with AsyncStorage
- **State Persistence**: App state maintained across sessions
- **Mock Data**: Sample receipts for development and testing

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
// Zustand store with TypeScript
interface ReceiptState {
  receipts: Receipt[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  
  // CRUD operations
  addReceipt: (receipt: Receipt) => void;
  updateReceipt: (id: string, receipt: Partial<Receipt>) => void;
  deleteReceipt: (id: string) => void;
  
  // Query methods
  getTotalSpending: () => number;
  getCategorySpending: () => Record<string, number>;
}
```

### TypeScript Types
```typescript
interface Receipt {
  id: string;
  store: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  imageUri?: string;
  category?: ReceiptCategory;
}
```

### Platform Handling
```typescript
// Conditional rendering for web compatibility
{Platform.OS !== 'web' ? (
  <CameraView /> // Native camera
) : (
  <ImagePicker /> // Web fallback
)}
```

## 🧪 Testing & Mock Data

### Sample Receipts
- 5 realistic sample receipts across different categories
- Proper date formatting and realistic pricing
- Category distribution for testing analytics

### Mock AI Responses
- Context-aware responses based on spending patterns
- Budget recommendations and saving tips
- Recipe suggestions based on grocery purchases

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

### Build for Production
```bash
# iOS
npx expo build:ios

# Android
npx expo build:android

# Web
npx expo export:web
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
