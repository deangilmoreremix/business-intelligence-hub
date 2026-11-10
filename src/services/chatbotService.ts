import { supabase, getSessionId } from '../lib/supabase';
import { createResponse, OPENAI_FAST_MODEL } from '../lib/openai';
import { searchKnowledge } from '../data/chatbotKnowledge';
import { aiApps } from '../data/aiApps';

export interface ChatMetadata {
  relatedApps?: Array<{ id: string; title: string; description: string }>;
  suggestions?: string[];
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: ChatMetadata;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  context: {
    currentApp?: string;
    currentRoute?: string;
    userPreferences?: Record<string, unknown>;
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
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    return getSessionId();
  }

  private buildSystemPrompt(): string {
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

      const messages: Array<{ role: string; content: string }> = [
        { role: 'system', content: this.buildSystemPrompt() }
      ];

      if (contextInfo) {
        messages.push({ role: 'system', content: contextInfo });
      }

      if (relevantKnowledge) {
        messages.push({ role: 'system', content: relevantKnowledge });
      }

      conversationHistory.slice(-10).forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      const aiResponse = await this.callOpenAIResponses(messages);

      const assistantMessage = await this.saveMessage(convId, 'assistant', aiResponse);

      const suggestions = this.generateSuggestions(userMessage);
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

  private async callOpenAIResponses(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
      const input = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant', content: m.content }));

      const text = await createResponse({
        instructions: system || undefined,
        input,
        useCase: 'chatbot',
        model: OPENAI_FAST_MODEL
      });

      return text.trim() || "I'm here to help! Please ask me anything about the Business Intelligence Hub.";
    } catch (error) {
      console.error('Error calling OpenAI Responses API:', error);
      const status = (error as { status?: number })?.status;

      if (status === 503) {
        return "The AI assistant isn't configured yet. An administrator needs to set OPENAI_API_KEY for this site.";
      }

      if (status === 401) {
        return "I'm currently unable to process your request as the AI service authentication failed. Please check the API key configuration.";
      }

      if (status === 429) {
        return "I'm experiencing high demand right now. Please try again in a moment.";
      }

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

  private generateSuggestions(userMessage: string): string[] {
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
    context?: Record<string, unknown>
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
    metadata?: Record<string, unknown>
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
    metadata: Record<string, unknown>
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
