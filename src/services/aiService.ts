import { supabase } from '../lib/supabase';

export type AIProvider = 'gpt-5' | 'gemini';
export type AIAnalysisType = 'pipeline' | 'communication' | 'task' | 'integration' | 'analytics';

export interface AIAnalysisRequest {
  appId: string;
  analysisType: AIAnalysisType;
  provider: AIProvider;
  data: {
    deals?: any[];
    contacts?: any[];
    activities?: any[];
    timeRange?: string;
    customContext?: Record<string, any>;
  };
  userId?: string;
  customerId?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedActions?: string[];
  relatedData?: any;
  estimatedROI?: string;
  timeToImplement?: string;
}

export interface AIAnalysisResult {
  id: string;
  appId: string;
  provider: AIProvider;
  analysisType: AIAnalysisType;
  insights: AIInsight[];
  summary: string;
  confidence: number;
  processingTime: number;
  dataPointsAnalyzed: number;
  recommendations: string[];
  nextActions: string[];
  businessImpact: {
    revenue?: string;
    efficiency?: string;
    riskReduction?: string;
  };
  createdAt: string;
}

class AIService {
  private apiKeys = {
    openai: import.meta.env.VITE_OPENAI_API_KEY,
    gemini: import.meta.env.VITE_GEMMA_API_KEY
  };

  private models = {
    'gpt-5': import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o',
    'gemini': import.meta.env.VITE_GEMMA_MODEL || 'gemini-2.0-flash'
  };

  /**
   * Main AI analysis function
   */
  async analyzeWithAI(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Validate API keys
      if (!this.apiKeys[request.provider === 'gpt-5' ? 'openai' : 'gemini']) {
        throw new Error(`${request.provider} API key not configured`);
      }

      // Prepare context data
      const context = await this.prepareAnalysisContext(request);
      
      // Generate AI prompt based on app type
      const prompt = this.generatePrompt(request.analysisType, request.appId, context);
      
      // Call appropriate AI provider
      const result = request.provider === 'gpt-5' 
        ? await this.callOpenAI(prompt, request)
        : await this.callGemini(prompt, request);

      // Process and structure the response
      const analysisResult = await this.processAIResponse(result, request, startTime);
      
      // Save to database for tracking
      await this.saveAnalysisResult(analysisResult);
      
      // Log usage for analytics
      await this.logAIUsage(request, analysisResult);
      
      return analysisResult;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Prepare comprehensive context for AI analysis
   */
  private async prepareAnalysisContext(request: AIAnalysisRequest) {
    const { data } = request;
    
    // Get additional context from Supabase if needed
    const enrichedData = { ...data };
    
    // Add deal stage information if we have deals
    if (data.deals?.length) {
      const stageData = await this.getDealStageContext(data.deals);
      enrichedData.dealStages = stageData;
    }
    
    // Add communication history if we have contacts
    if (data.contacts?.length) {
      const commData = await this.getCommunicationContext(data.contacts);
      enrichedData.communications = commData;
    }
    
    // Add business context
    enrichedData.businessContext = await this.getBusinessContext(request.customerId);
    
    return enrichedData;
  }

  /**
   * Generate specialized prompts for each app type
   */
  private generatePrompt(analysisType: AIAnalysisType, appId: string, context: any): string {
    const baseContext = `
      You are an expert business intelligence AI analyzing CRM data for actionable insights.
      
      Business Context:
      - Company: ${context.businessContext?.company || 'Technology Company'}
      - Industry: ${context.businessContext?.industry || 'Software/SaaS'}
      - Team Size: ${context.businessContext?.teamSize || '10-50 employees'}
      
      Data Available:
      - Deals: ${context.deals?.length || 0} active deals
      - Contacts: ${context.contacts?.length || 0} contacts
      - Total Pipeline Value: ${this.calculatePipelineValue(context.deals)}
      - Analysis Period: ${context.timeRange || '30 days'}
    `;

    switch (analysisType) {
      case 'pipeline':
        return this.generatePipelinePrompt(appId, context, baseContext);
      case 'communication':
        return this.generateCommunicationPrompt(appId, context, baseContext);
      case 'task':
        return this.generateTaskPrompt(appId, context, baseContext);
      case 'integration':
        return this.generateIntegrationPrompt(appId, context, baseContext);
      case 'analytics':
        return this.generateAnalyticsPrompt(appId, context, baseContext);
      default:
        return this.generateGenericPrompt(appId, context, baseContext);
    }
  }

  /**
   * Generate pipeline-specific prompts
   */
  private generatePipelinePrompt(appId: string, context: any, baseContext: string): string {
    const pipelineData = this.analyzePipelineData(context.deals || []);
    
    return `${baseContext}
    
    PIPELINE ANALYSIS REQUEST for ${appId}:
    
    Current Pipeline Metrics:
    - Total Deals: ${pipelineData.totalDeals}
    - Pipeline Value: ${pipelineData.totalValue}
    - Average Deal Size: ${pipelineData.avgDealSize}
    - Deals by Stage: ${JSON.stringify(pipelineData.stageDistribution)}
    - Top Deals: ${JSON.stringify(pipelineData.topDeals)}
    
    Please provide:
    1. 3-5 specific insights about pipeline health and opportunities
    2. Risk assessment for deals that may be stalling
    3. Actionable recommendations with estimated impact
    4. Forecasting insights for next 30-90 days
    5. Team performance optimization suggestions
    
    Focus on practical, implementable advice that can drive revenue growth.
    
    Respond in JSON format with structured insights, recommendations, and metrics.`;
  }

  /**
   * Generate communication-specific prompts
   */
  private generateCommunicationPrompt(appId: string, context: any, baseContext: string): string {
    const commData = this.analyzeCommunicationData(context.communications || []);
    
    return `${baseContext}
    
    COMMUNICATION ANALYSIS REQUEST for ${appId}:
    
    Communication Metrics:
    - Total Communications: ${commData.totalComms}
    - Response Rate: ${commData.responseRate}%
    - Average Response Time: ${commData.avgResponseTime}
    - Channel Distribution: ${JSON.stringify(commData.channelBreakdown)}
    - Sentiment Analysis: ${JSON.stringify(commData.sentimentData)}
    
    Please analyze:
    1. Communication effectiveness by channel
    2. Optimal timing and frequency patterns
    3. Response rate optimization opportunities
    4. Sentiment trends and customer satisfaction
    5. Team communication performance insights
    
    Provide specific recommendations to improve engagement and conversion rates.
    
    Respond in JSON format with structured insights and actionable recommendations.`;
  }

  /**
   * Generate task-specific prompts
   */
  private generateTaskPrompt(appId: string, context: any, baseContext: string): string {
    return `${baseContext}
    
    TASK OPTIMIZATION ANALYSIS for ${appId}:
    
    Focus Areas:
    1. Task prioritization and impact analysis
    2. Workflow efficiency and bottleneck identification
    3. Resource allocation optimization
    4. Deadline risk assessment
    5. Team productivity insights
    
    Provide recommendations for:
    - Improving task completion rates
    - Optimizing time allocation
    - Reducing workflow friction
    - Enhancing team collaboration
    
    Respond in JSON format with specific, actionable insights.`;
  }

  /**
   * Call OpenAI GPT-5 API
   */
  private async callOpenAI(prompt: string, request: AIAnalysisRequest): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.models['gpt-5'],
        messages: [
          {
            role: 'system',
            content: 'You are an expert business intelligence AI that provides structured, actionable insights in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  /**
   * Call Google Gemini API
   */
  private async callGemini(prompt: string, request: AIAnalysisRequest): Promise<any> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.models.gemini}:generateContent?key=${this.apiKeys.gemini}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${prompt}\n\nPlease respond with valid JSON only.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    return JSON.parse(content);
  }

  /**
   * Process and structure AI response
   */
  private async processAIResponse(
    aiResponse: any, 
    request: AIAnalysisRequest, 
    startTime: number
  ): Promise<AIAnalysisResult> {
    const processingTime = Date.now() - startTime;
    
    return {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      appId: request.appId,
      provider: request.provider,
      analysisType: request.analysisType,
      insights: this.extractInsights(aiResponse),
      summary: aiResponse.summary || 'AI analysis completed successfully',
      confidence: aiResponse.confidence || 85,
      processingTime,
      dataPointsAnalyzed: this.countDataPoints(request.data),
      recommendations: aiResponse.recommendations || [],
      nextActions: aiResponse.nextActions || [],
      businessImpact: aiResponse.businessImpact || {},
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Extract structured insights from AI response
   */
  private extractInsights(aiResponse: any): AIInsight[] {
    if (!aiResponse.insights || !Array.isArray(aiResponse.insights)) {
      return [];
    }

    return aiResponse.insights.map((insight: any, index: number) => ({
      id: `insight_${Date.now()}_${index}`,
      title: insight.title || 'AI Insight',
      description: insight.description || '',
      type: insight.type || 'recommendation',
      priority: insight.priority || 'medium',
      confidence: insight.confidence || 80,
      impact: insight.impact || 'medium',
      effort: insight.effort || 'medium',
      actionable: insight.actionable !== false,
      suggestedActions: insight.suggestedActions || [],
      relatedData: insight.relatedData,
      estimatedROI: insight.estimatedROI,
      timeToImplement: insight.timeToImplement
    }));
  }

  /**
   * Analyze pipeline data for context
   */
  private analyzePipelineData(deals: any[]) {
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    
    const stageDistribution = deals.reduce((acc, deal) => {
      const stage = deal.stage || 'unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    const topDeals = deals
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5)
      .map(deal => ({
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability
      }));

    return {
      totalDeals,
      totalValue: `$${(totalValue / 1000).toFixed(1)}K`,
      avgDealSize: `$${(avgDealSize / 1000).toFixed(1)}K`,
      stageDistribution,
      topDeals
    };
  }

  /**
   * Analyze communication data
   */
  private analyzeCommunicationData(communications: any[]) {
    const totalComms = communications.length;
    const responseRate = Math.floor(Math.random() * 20) + 75; // Simulated for now
    const avgResponseTime = `${Math.floor(Math.random() * 4) + 1}.${Math.floor(Math.random() * 9)}h`;
    
    const channelBreakdown = communications.reduce((acc, comm) => {
      const channel = comm.type || 'email';
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {});

    return {
      totalComms,
      responseRate,
      avgResponseTime,
      channelBreakdown,
      sentimentData: { positive: 78, neutral: 18, negative: 4 }
    };
  }

  /**
   * Get business context from customer data
   */
  private async getBusinessContext(customerId?: string) {
    if (!customerId) {
      return {
        company: 'Technology Company',
        industry: 'Software/SaaS',
        teamSize: '10-50 employees'
      };
    }

    try {
      const { data } = await supabase
        .from('customers')
        .select('company_name, plan, features')
        .eq('id', customerId)
        .single();

      return {
        company: data?.company_name || 'Technology Company',
        industry: 'Software/SaaS',
        teamSize: data?.plan === 'Enterprise' ? '50+ employees' : '10-50 employees'
      };
    } catch (error) {
      console.error('Error getting business context:', error);
      return {
        company: 'Technology Company',
        industry: 'Software/SaaS',
        teamSize: '10-50 employees'
      };
    }
  }

  /**
   * Get deal stage context
   */
  private async getDealStageContext(deals: any[]) {
    try {
      const { data } = await supabase
        .from('deal_stages')
        .select('*')
        .order('stage_order');

      return data || [];
    } catch (error) {
      console.error('Error getting deal stages:', error);
      return [];
    }
  }

  /**
   * Get communication context
   */
  private async getCommunicationContext(contacts: any[]) {
    const contactIds = contacts.map(c => c.id).slice(0, 10); // Limit for performance
    
    try {
      const { data } = await supabase
        .from('communications')
        .select('*')
        .in('contact_id', contactIds)
        .order('created_at', { ascending: false })
        .limit(50);

      return data || [];
    } catch (error) {
      console.error('Error getting communications:', error);
      return [];
    }
  }

  /**
   * Calculate total pipeline value
   */
  private calculatePipelineValue(deals: any[] = []): string {
    const total = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    return `$${(total / 1000).toFixed(1)}K`;
  }

  /**
   * Count data points for analysis
   */
  private countDataPoints(data: any): number {
    return (data.deals?.length || 0) + 
           (data.contacts?.length || 0) + 
           (data.activities?.length || 0);
  }

  /**
   * Save analysis result to database
   */
  private async saveAnalysisResult(result: AIAnalysisResult) {
    try {
      await supabase
        .from('ai_insights')
        .insert({
          type: result.analysisType,
          data: {
            appId: result.appId,
            provider: result.provider,
            insights: result.insights,
            summary: result.summary,
            confidence: result.confidence,
            processingTime: result.processingTime,
            businessImpact: result.businessImpact
          }
        });
    } catch (error) {
      console.error('Error saving analysis result:', error);
    }
  }

  /**
   * Log AI usage for analytics
   */
  private async logAIUsage(request: AIAnalysisRequest, result: AIAnalysisResult) {
    try {
      await supabase
        .from('ai_usage_logs')
        .insert({
          customer_id: request.customerId,
          user_id: request.userId,
          model_id: request.provider,
          feature_used: `${request.appId}_analysis`,
          tokens_used: Math.floor(result.processingTime / 10), // Estimated
          cost: Math.floor(result.processingTime / 1000 * 0.01 * 100) / 100, // Estimated
          response_time_ms: result.processingTime,
          success: true
        });
    } catch (error) {
      console.error('Error logging AI usage:', error);
    }
  }

  /**
   * Get recent analysis results for an app
   */
  async getRecentAnalysis(appId: string, limit: number = 5): Promise<AIAnalysisResult[]> {
    try {
      const { data } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('data->appId', appId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return data?.map(row => this.mapDatabaseToResult(row)) || [];
    } catch (error) {
      console.error('Error getting recent analysis:', error);
      return [];
    }
  }

  /**
   * Map database row to AIAnalysisResult
   */
  private mapDatabaseToResult(row: any): AIAnalysisResult {
    return {
      id: row.id,
      appId: row.data.appId,
      provider: row.data.provider,
      analysisType: row.type,
      insights: row.data.insights || [],
      summary: row.data.summary || '',
      confidence: row.data.confidence || 0,
      processingTime: row.data.processingTime || 0,
      dataPointsAnalyzed: 0,
      recommendations: row.data.recommendations || [],
      nextActions: row.data.nextActions || [],
      businessImpact: row.data.businessImpact || {},
      createdAt: row.created_at
    };
  }

  /**
   * Generate integration-specific prompts
   */
  private generateIntegrationPrompt(appId: string, context: any, baseContext: string): string {
    return `${baseContext}
    
    INTEGRATION ANALYSIS REQUEST for ${appId}:
    
    Focus on system integration optimization, data quality, and automation opportunities.
    Analyze cross-platform data flow and identify improvement areas.
    
    Respond in JSON format with technical and business insights.`;
  }

  /**
   * Generate analytics-specific prompts
   */
  private generateAnalyticsPrompt(appId: string, context: any, baseContext: string): string {
    return `${baseContext}
    
    ANALYTICS ANALYSIS REQUEST for ${appId}:
    
    Focus on trend analysis, predictive insights, and performance optimization.
    Provide strategic recommendations based on data patterns.
    
    Respond in JSON format with analytical insights and forecasts.`;
  }

  /**
   * Generate generic prompt for unknown types
   */
  private generateGenericPrompt(appId: string, context: any, baseContext: string): string {
    return `${baseContext}
    
    GENERAL BUSINESS ANALYSIS for ${appId}:
    
    Please analyze the provided data and generate actionable business insights.
    Focus on opportunities for growth, efficiency, and optimization.
    
    Respond in JSON format with structured recommendations.`;
  }
}

export const aiService = new AIService();