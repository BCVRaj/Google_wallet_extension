import { GoogleGenerativeAI } from '@google/generative-ai';
import { getReceiptInsights, getAllReceiptsFromDatabase, initDatabase } from './database';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '');

export const getChatResponse = async (userMessage: string): Promise<string> => {
  try {
    if (!process.env.EXPO_PUBLIC_GOOGLE_API_KEY) {
      return "I'm sorry, but the AI assistant is not configured. Please add your Google API key to the .env file.";
    }

    // Initialize database first to ensure proper connection
    await initDatabase();

    // Use Gemini 2.0 Flash for faster responses
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Get user's spending data from database (now async)
    const receipts = await getAllReceiptsFromDatabase();
    const insights = await getReceiptInsights();
    
    // Build context with user's actual spending data
    const context = await buildFinancialContext(receipts, insights, userMessage);
    
    const result = await model.generateContent(context);
    return result.response.text();

  } catch (error) {
    console.error('Error getting chat response:', error);
    
    // Provide helpful fallback responses
    if (userMessage.toLowerCase().includes('spending') || userMessage.toLowerCase().includes('money')) {
      return "I'd love to help you with your spending analysis! Please make sure your Gemini API key is configured, and try scanning some receipts first so I can provide personalized insights.";
    }
    
    return "I'm having trouble connecting to the AI service right now. Please check your internet connection and try again.";
  }
};

const buildFinancialContext = async (
  receipts: any[], 
  insights: any, 
  userMessage: string
): Promise<string> => {
  const hasData = receipts.length > 0;
  
  if (!hasData) {
    return `
You are a concise personal finance assistant. User asked: "${userMessage}"

No receipts found. Encourage them to scan receipts or add purchases manually for personalized insights.

Keep response brief (2-3 sentences) and encouraging.
    `;
  }

  const recentReceipts = receipts.slice(0, 10);
  const categoryBreakdown = insights.topCategories?.map((cat: any) => 
    `${cat.category}: $${(cat.total || 0).toFixed(2)} (${cat.count || 0} items)`
  ).join(', ') || 'No categories yet';

  const monthlyTrend = insights.monthlySpending?.slice(0, 3).map((month: any) =>
    `${month.month}: $${(month.total || 0).toFixed(2)}`
  ).join(', ') || '';

  return `
You are a concise personal finance assistant. Answer briefly and actionably.

USER QUESTION: "${userMessage}"

DATA: ${insights.totalReceipts || 0} receipts, $${(insights.totalSpending || 0).toFixed(2)} total, $${(insights.averageSpending || 0).toFixed(2)} average
TOP SPENDING: ${categoryBreakdown}

RECENT: ${recentReceipts.slice(0, 3).map((r: any) => 
  `${r.merchantName || r.store || 'Unknown Store'} $${((r.totalAmount || r.total || 0)).toFixed(2)}`
).join(', ') || 'No recent transactions'}

Provide a focused 2-3 sentence answer with 1-2 specific actionable tips. Be direct and helpful.
  `;
};

// Generate spending insights and recommendations
export const generateSpendingInsights = async (): Promise<string> => {
  try {
    if (!process.env.EXPO_PUBLIC_GOOGLE_API_KEY) {
      return "Add your Google API key to get AI-powered spending insights!";
    }

    // Initialize database first to ensure proper connection
    await initDatabase();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const receipts = await getAllReceiptsFromDatabase();
    const insights = await getReceiptInsights();

    if (receipts.length === 0) {
      return "Start scanning receipts to get personalized spending insights and recommendations!";
    }

    const context = `
Analyze spending data and provide 3 key insights in bullet points:

DATA: $${(insights.totalSpending || 0).toFixed(2)} across ${insights.totalReceipts || 0} receipts, $${(insights.averageSpending || 0).toFixed(2)} average
CATEGORIES: ${insights.topCategories?.map((cat: any) => 
  `${cat.category} $${(cat.total || 0).toFixed(2)}`
).join(', ') || 'No spending data yet'}

Format: 
• [Insight 1 with specific action]
• [Insight 2 with specific action] 
• [Insight 3 with specific action]

Keep each bullet point to 1-2 sentences max.
    `;

    const result = await model.generateContent(context);
    return result.response.text();

  } catch (error) {
    console.error('Error generating spending insights:', error);
    return "Unable to generate insights right now. Try again later!";
  }
};

// Get category-specific advice
export const getCategoryAdvice = async (category: string): Promise<string> => {
  try {
    if (!process.env.EXPO_PUBLIC_GOOGLE_API_KEY) {
      return `Tips for managing ${category} spending will be available once you configure the AI assistant.`;
    }

    // Initialize database first to ensure proper connection
    await initDatabase();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const insights = await getReceiptInsights();
    
    const categoryData = insights.topCategories?.find((cat: any) => 
      cat.category.toLowerCase() === category.toLowerCase()
    );

    if (!categoryData || !categoryData.total) {
      return `You haven't spent much in the ${category} category yet. Start tracking receipts to get personalized advice!`;
    }

    const context = `
Give 3 brief tips for managing ${category} spending:

User spent: $${(categoryData.total || 0).toFixed(2)} across ${categoryData.count || 0} ${category} purchases

Format as:
• [Tip 1]
• [Tip 2] 
• [Tip 3]

Keep each tip to 1 sentence.
    `;

    const result = await model.generateContent(context);
    return result.response.text();

  } catch (error) {
    console.error('Error getting category advice:', error);
    return `Unable to get ${category} advice right now. Try again later!`;
  }
};
