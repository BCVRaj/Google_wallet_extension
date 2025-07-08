<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Receipt Management App - Copilot Instructions

This is a production-ready React Native receipt management app built with Expo and TypeScript. The app provides AI-powered insights, receipt scanning, spending analytics, and financial assistance.

## Tech Stack
- **Frontend**: React Native 0.79.1 with TypeScript
- **Framework**: Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand with AsyncStorage persistence
- **UI Components**: Custom components with LinearGradient and Lucide icons
- **Charts**: react-native-chart-kit for data visualization
- **Camera**: expo-camera for receipt scanning
- **Image Picker**: expo-image-picker for gallery selection

## Architecture Guidelines
- Use TypeScript strict mode with proper type definitions
- Follow React Native best practices for cross-platform compatibility
- Implement responsive design with Flexbox layouts
- Use StyleSheet.create() for consistent styling
- Handle platform-specific features (iOS/Android/Web)
- Implement proper error handling and user feedback

## Code Style
- Use functional components with hooks
- Implement proper prop typing with interfaces
- Follow 2-space indentation
- Use meaningful component and variable names
- Include proper error boundaries and loading states
- Write accessible code with proper contrast and touch targets

## Key Features
1. **Receipt Management**: CRUD operations for receipts
2. **Camera Scanning**: Live camera preview with AI processing simulation
3. **Analytics**: Category-based spending charts and insights
4. **AI Assistant**: Contextual chat with financial advice
5. **Cross-Platform**: Web, iOS, and Android compatibility

## File Structure
- `app/` - Navigation and screens (Expo Router)
- `components/` - Reusable UI components
- `store/` - Zustand state management
- `types/` - TypeScript interface definitions
- `constants/` - App-wide constants (colors, etc.)
- `mocks/` - Sample data for development

## Design System
- **Colors**: iOS/Linear inspired palette with primary blue (#4A6FA5)
- **Gradients**: Subtle LinearGradient usage for depth
- **Shadows**: Platform-specific shadow implementations
- **Typography**: Consistent font weights and sizes
- **Spacing**: 8px grid system for consistent layouts

## State Management
- Zustand store with persistence using AsyncStorage
- Separate actions for receipts and chat messages
- Computed values for analytics (total spending, category breakdown)
- Proper typing for all state and actions

## Navigation
- File-based routing with Expo Router
- Tab navigation with 4 main screens
- Dynamic routes for receipt details and editing
- Proper back navigation and deep linking support

## Performance Considerations
- Use FlatList for efficient scrolling
- Implement proper image optimization
- Minimize re-renders with proper state management
- Use React.memo for expensive components
- Handle keyboard avoiding views properly

## Testing & Development
- Mock AI responses for development
- Sample data for testing features
- Proper error handling and loading states
- Cross-platform testing considerations

When working with this codebase, maintain consistency with the existing patterns and architecture. Always consider cross-platform compatibility and implement proper TypeScript typing.
