import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReceiptStore } from '../../store/receiptStore';
import { ChatMessage } from '../../components/ChatMessage';
import { ChatInput } from '../../components/ChatInput';
import { Colors } from '../../constants/Colors';
import { ChatMessage as ChatMessageType } from '../../types/receipt';
import { getChatResponse } from '../../services/geminiAssistant';

export default function AssistantScreen() {
  const { 
    chatMessages, 
    addChatMessage, 
    receipts, 
    getTotalSpending, 
    getCategorySpending, 
    initializeDatabase, 
    loadReceipts 
  } = useReceiptStore();
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Initialize database on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDatabase();
        await loadReceipts();
      } catch (error) {
        console.error('Failed to initialize database in assistant:', error);
      }
    };

    initializeApp();
  }, []);

  // Generate AI response using Gemini 2.5 Flash
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await getChatResponse(userMessage);
      return response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback responses if Gemini fails
      const lowerMessage = userMessage.toLowerCase();
      const totalSpending = getTotalSpending();
      const receipts = useReceiptStore.getState().receipts;

      if (receipts.length === 0) {
        if (lowerMessage.includes('spending') || lowerMessage.includes('budget') || lowerMessage.includes('receipt')) {
          return `I don't see any receipts yet! Start by scanning your first receipt using the scan tab, and I'll be able to help you analyze your spending patterns with AI-powered insights.`;
        }
        
        return `Hello! I'm your AI financial assistant powered by Gemini. Please scan some receipts first, and then I'll provide personalized insights about your spending patterns.`;
      }

      // Basic fallback responses when AI is unavailable
      if (lowerMessage.includes('spending') || lowerMessage.includes('budget')) {
        return `Based on your ${receipts.length} receipts, you've spent $${totalSpending.toFixed(2)} total. For detailed AI insights, please check your Gemini API configuration.`;
      }

      return `I'm having trouble connecting to the AI service right now, but I can see you have ${receipts.length} receipt(s) totaling $${totalSpending.toFixed(2)}. Please check your internet connection and Gemini API configuration.`;
    }
  };

  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get AI response
      const aiResponse = await generateAIResponse(messageText);
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(aiMessage);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessageType }) => (
    <ChatMessage message={item} />
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>AI is typing...</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isTyping]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.highlight]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>AI Financial Assistant</Text>
                <Text style={styles.headerSubtitle}>
                  Get insights about your spending patterns
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Messages */}
          <View style={styles.messagesContainer}>
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={renderTypingIndicator}
            />
          </View>

          {/* Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isTyping}
            placeholder={isTyping ? 'AI is thinking...' : 'Ask about your spending...'}
          />
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.card,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.card,
    opacity: 0.9,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  typingContainer: {
    marginVertical: 4,
    marginHorizontal: 16,
    alignItems: 'flex-start',
  },
  typingBubble: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  typingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
