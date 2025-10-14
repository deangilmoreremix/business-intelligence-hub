import { supabase } from '../lib/supabase';
import { getAllKnowledge, searchKnowledge } from '../data/chatbotKnowledge';
import { aiApps } from '../data/aiApps';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  context: {
    currentApp?: string;
    currentRoute?: string;
    userPreferences?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  relatedApps?: Array<{ id: string; title: string; description: string }>;
}

class ChatbotService {
  private apiKey: string;
  private model: string;
  private sessionId: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.model = 'gpt-4o';
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('chatbot_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot_session_id', sessionId);
    }
    return sessionId;
  }

  private buildSystemPrompt(): string {
    const knowledge = getAllKnowledge();
    const appsList = aiApps.map(app => `- ${app.title} (${app.category}): ${app.description}`).join('\n');

    return `You are an intelligent, helpful AI assistant for the Business Intelligence Hub application. Your role is to help users understand, navigate, and make the most of the platform.

**About the Platform:**
The Business Intelligence Hub is a comprehensive AI-driven analytics platform with 35 specialized applications across 5 categories:
1. Pipeline Analytics (10 apps) - Sales pipeline management and optimization
2. Communication Analytics (6 apps) - Communication pattern analysis and optimization
3. Task Analytics (6 apps) - Workflow and task optimization
4. Integration Analytics (6 apps) - Tool integration and data quality monitoring
5. Analytics Dashboard (7 apps) - Comprehensive reporting and visualization

**Available Applications:**
${appsList}

**Key Features:**
- Real-time dashboards with live data monitoring
- AI-powered predictive analytics and insights
- Dark/Light mode theme support
- Search and filter functionality
- Guided tours and walkthroughs
- Data persistence with Supabase
- CRM integration capabilities

**Your Responsibilities:**
1. Help users find the right application for their needs
2. Explain how to use features and navigate the platform
3. Provide guidance on best practices and optimization strategies
4. Answer questions about specific applications and their capabilities
5. Suggest relevant apps based on user queries
6. Offer tips to maximize productivity and insights

**Guidelines:**
- Be concise but informative
- Use friendly, professional language
- Provide specific app recommendations when relevant
- Offer step-by-step guidance when needed
- Reference specific features and categories accurately
- If you don't know something specific, acknowledge it honestly
- Encourage users to explore the Help Center for guided tours

**Response Format:**
- Answer the user's question directly
- When relevant, suggest 1-3 related applications they might find useful
- Keep responses focused and actionable
- Use bullet points for clarity when listing multiple items

Remember: Your goal is to make users successful with the platform by providing excellent, context-aware assistance.`;
  }

  async sendMessage(
    conversationId: string | null,
    userMessage: string,
    context?: {
      currentApp?: string;
      currentRoute?: string;
    }
  ): Promise<{ response: ChatbotResponse; conversationId: string; messageId: string }> {
    try {
      let convId = conversationId;

      if (!convId) {
        convId = await this.createConversation(userMessage, context);
      }

      await this.saveMessage(convId, 'user', userMessage);

      const conversationHistory = await this.getConversationHistory(convId);

      const contextInfo = this.buildContextInfo(context);
      const relevantKnowledge = this.findRelevantKnowledge(userMessage);

      const messages = [
        { role: 'system', content: this.buildSystemPrompt() },
        ...(contextInfo ? [{ role: 'system', content: contextInfo }] : []),
        ...(relevantKnowledge ? [{ role: 'system', content: relevantKnowledge }] : []),
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const aiResponse = await this.callOpenAI(messages);

      const assistantMessage = await this.saveMessage(convId, 'assistant', aiResponse);

      const suggestions = this.generateSuggestions(userMessage, context);
      const relatedApps = this.findRelatedApps(userMessage);

      await this.logUsageAnalytics(convId, 'message_sent', {
        userMessageLength: userMessage.length,
        responseLength: aiResponse.length,
        context
      });

      return {
        response: {
          message: aiResponse,
          suggestions,
          relatedApps: relatedApps.slice(0, 3)
        },
        conversationId: convId,
        messageId: assistantMessage
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  private async callOpenAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.apiKey) {
      return "I'm currently unable to process your request as the AI service is not configured. Please contact support or check the application settings.";
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 800,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', errorData);
        throw new Error('AI service error');
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment. In the meantime, you can explore the Help Center for guided tours and documentation.";
    }
  }

  private buildContextInfo(context?: { currentApp?: string; currentRoute?: string }): string | null {
    if (!context?.currentApp && !context?.currentRoute) return null;

    const parts = [];

    if (context.currentRoute) {
      parts.push(`User is currently on: ${context.currentRoute}`);
    }

    if (context.currentApp) {
      const app = aiApps.find(a => a.id === context.currentApp);
      if (app) {
        parts.push(`User is viewing: ${app.title} - ${app.description}`);
      }
    }

    return parts.length > 0 ? `**Current Context:**\n${parts.join('\n')}` : null;
  }

  private findRelevantKnowledge(query: string): string | null {
    const results = searchKnowledge(query).slice(0, 3);
    if (results.length === 0) return null;

    const knowledgeText = results
      .map(k => `- ${k.title}: ${k.content}`)
      .join('\n');

    return `**Relevant Knowledge:**\n${knowledgeText}`;
  }

  private findRelatedApps(query: string): Array<{ id: string; title: string; description: string }> {
    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(' ').filter(w => w.length > 3);

    return aiApps
      .filter(app => {
        const searchText = `${app.title} ${app.description} ${app.category}`.toLowerCase();
        return keywords.some(keyword => searchText.includes(keyword));
      })
      .map(app => ({
        id: app.id,
        title: app.title,
        description: app.description
      }));
  }

  private generateSuggestions(userMessage: string, context?: { currentApp?: string }): string[] {
    const suggestions: string[] = [];

    if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('how')) {
      suggestions.push('Show me a guided tour');
      suggestions.push('What are the main features?');
    }

    if (userMessage.toLowerCase().includes('pipeline') || userMessage.toLowerCase().includes('deal')) {
      suggestions.push('Show me pipeline analytics apps');
      suggestions.push('How do I track deal risks?');
    }

    if (userMessage.toLowerCase().includes('analytic') || userMessage.toLowerCase().includes('report')) {
      suggestions.push('What analytics tools are available?');
      suggestions.push('How do I create reports?');
    }

    if (suggestions.length === 0) {
      suggestions.push('What can this platform do?');
      suggestions.push('Show me communication tools');
      suggestions.push('Help me get started');
    }

    return suggestions.slice(0, 3);
  }

  private async createConversation(
    firstMessage: string,
    context?: Record<string, any>
  ): Promise<string> {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');

    const { data, error } = await supabase
      .from('chatbot_conversations')
      .insert({
        session_id: this.sessionId,
        title,
        context: context || {},
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data.id;
  }

  private async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const { data, error } = await supabase
      .from('chatbot_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }

    return data.id;
  }

  private async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }

    return data.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      timestamp: new Date(msg.created_at),
      metadata: msg.metadata
    }));
  }

  async getRecentConversations(limit: number = 10): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('session_id', this.sessionId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    const conversations = await Promise.all(
      data.map(async conv => {
        const messages = await this.getConversationHistory(conv.id);
        return {
          id: conv.id,
          title: conv.title,
          messages,
          context: conv.context,
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at)
        };
      })
    );

    return conversations;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('chatbot_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('session_id', this.sessionId);

    if (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  private async logUsageAnalytics(
    conversationId: string,
    eventType: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('chatbot_usage_analytics')
        .insert({
          conversation_id: conversationId,
          session_id: this.sessionId,
          event_type: eventType,
          metadata
        });
    } catch (error) {
      console.error('Error logging analytics:', error);
    }
  }

  async provideFeedback(
    conversationId: string,
    messageId: string,
    isHelpful: boolean
  ): Promise<void> {
    await this.logUsageAnalytics(conversationId, isHelpful ? 'helpful' : 'not_helpful', {
      messageId
    });
  }
}

export const chatbotService = new ChatbotService();
