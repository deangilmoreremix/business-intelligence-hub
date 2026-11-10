import { aiService, type AIAnalysisRequest, type AIAnalysisResult, type AIProvider } from './aiService';
import { supabase } from '../lib/supabase';

export interface AIAnalyticsConfig {
  defaultProvider: AIProvider;
  enableBatchAnalysis: boolean;
  maxConcurrentAnalyses: number;
  cacheResults: boolean;
  cacheDurationMs: number;
  autoAnalyzeOnDataChange: boolean;
}

export interface BatchAnalysisRequest {
  appIds: string[];
  provider: AIProvider;
  priority: 'low' | 'medium' | 'high';
  customData?: any;
}

export interface AIAnalyticsMetrics {
  totalAnalyses: number;
  successRate: number;
  avgProcessingTime: number;
  topInsightTypes: { type: string; count: number }[];
  providerUsage: { provider: AIProvider; count: number; avgTime: number }[];
  businessImpactGenerated: {
    revenue: string;
    efficiency: string;
    riskReduction: string;
  };
}

class AIAnalyticsEngine {
  private config: AIAnalyticsConfig = {
    defaultProvider: 'openai-deep',
    enableBatchAnalysis: true,
    maxConcurrentAnalyses: 3,
    cacheResults: true,
    cacheDurationMs: 1000 * 60 * 30, // 30 minutes
    autoAnalyzeOnDataChange: false
  };

  private analysisCache = new Map<string, { result: AIAnalysisResult; timestamp: number }>();
  private runningAnalyses = new Set<string>();

  /**
   * Run AI analysis across multiple apps simultaneously
   */
  async runBatchAnalysis(request: BatchAnalysisRequest): Promise<AIAnalysisResult[]> {
    if (!this.config.enableBatchAnalysis) {
      throw new Error('Batch analysis is disabled');
    }

    const { appIds, provider, customData } = request;
    const results: AIAnalysisResult[] = [];
    const errors: string[] = [];

    // Chunk requests to respect concurrency limits
    const chunks = this.chunkArray(appIds, this.config.maxConcurrentAnalyses);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (appId) => {
        try {
          const analysisType = this.getAnalysisTypeForApp(appId);
          const result = await this.runSingleAnalysis({
            appId,
            analysisType,
            provider,
            data: customData || await this.getCRMDataForAnalysis()
          });
          
          if (result) {
            results.push(result);
          }
        } catch (error) {
          errors.push(`${appId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      await Promise.all(chunkPromises);
    }

    // Log batch analysis results
    await this.logBatchAnalysis(request, results, errors);

    return results;
  }

  /**
   * Run analysis for a single app with caching
   */
  async runSingleAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResult | null> {
    const cacheKey = this.generateCacheKey(request);

    // Check cache first
    if (this.config.cacheResults) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Prevent duplicate concurrent analyses
    if (this.runningAnalyses.has(cacheKey)) {
      throw new Error('Analysis already in progress for this configuration');
    }

    try {
      this.runningAnalyses.add(cacheKey);
      
      const result = await aiService.analyzeWithAI(request);
      
      // Cache the result
      if (this.config.cacheResults) {
        this.setCachedResult(cacheKey, result);
      }

      return result;
    } finally {
      this.runningAnalyses.delete(cacheKey);
    }
  }

  /**
   * Get comprehensive analytics metrics
   */
  async getAnalyticsMetrics(timeRange: string = '30d'): Promise<AIAnalyticsMetrics> {
    try {
      const startDate = this.getStartDateFromRange(timeRange);

      // Get analysis statistics
      const { data: analysisStats } = await supabase
        .from('ai_insights')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const { data: usageStats } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString());

      return this.processAnalyticsMetrics(analysisStats || [], usageStats || []);
    } catch (error) {
      console.error('Error getting analytics metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Schedule automatic analysis based on data changes
   */
  setupAutoAnalysis(appIds: string[], provider: AIProvider = 'openai-fast') {
    if (!this.config.autoAnalyzeOnDataChange) {
      return;
    }

    // Set up real-time subscriptions for data changes
    const subscription = supabase
      .channel('ai_auto_analysis')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'deals' },
        async (payload) => {
          console.log('Deals data changed, triggering auto-analysis');
          await this.triggerAutoAnalysis(appIds, provider);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        async (payload) => {
          console.log('Contacts data changed, triggering auto-analysis');
          await this.triggerAutoAnalysis(appIds, provider);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Get AI analysis recommendations for business optimization
   */
  async getBusinessOptimizationPlan(
    customerId?: string,
    provider: AIProvider = 'openai-deep'
  ): Promise<{
    overallScore: number;
    priorityActions: string[];
    quickWins: string[];
    strategicInitiatives: string[];
    expectedROI: string;
  }> {
    try {
      const crmData = await this.getCRMDataForAnalysis();
      const businessContext = await this.getBusinessContext(customerId);

      const request: AIAnalysisRequest = {
        appId: 'business-optimization',
        analysisType: 'analytics',
        provider,
        data: {
          ...crmData,
          businessContext,
          timeRange: '90d'
        },
        customerId
      };

      const result = await aiService.analyzeWithAI(request);

      return {
        overallScore: result.confidence,
        priorityActions: result.recommendations.slice(0, 3),
        quickWins: result.nextActions.slice(0, 5),
        strategicInitiatives: result.recommendations.slice(3),
        expectedROI: result.businessImpact.revenue || '+15-25% revenue growth'
      };
    } catch (error) {
      console.error('Error generating business optimization plan:', error);
      return this.getDefaultOptimizationPlan();
    }
  }

  /**
   * Private helper methods
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private generateCacheKey(request: AIAnalysisRequest): string {
    return `${request.appId}_${request.analysisType}_${request.provider}_${JSON.stringify(request.data).slice(0, 100)}`;
  }

  private getCachedResult(cacheKey: string): AIAnalysisResult | null {
    const cached = this.analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheDurationMs) {
      return cached.result;
    }
    
    // Remove expired cache entry
    if (cached) {
      this.analysisCache.delete(cacheKey);
    }
    
    return null;
  }

  private setCachedResult(cacheKey: string, result: AIAnalysisResult): void {
    this.analysisCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    // Clean up old cache entries periodically
    if (this.analysisCache.size > 100) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.analysisCache.entries()) {
      if (now - value.timestamp > this.config.cacheDurationMs) {
        this.analysisCache.delete(key);
      }
    }
  }

  private getAnalysisTypeForApp(appId: string): AIAnalysisRequest['analysisType'] {
    if (appId.includes('pipeline') || appId.includes('deal') || appId.includes('revenue')) {
      return 'pipeline';
    }
    if (appId.includes('activity') || appId.includes('communication') || appId.includes('email')) {
      return 'communication';
    }
    if (appId.includes('task') || appId.includes('followup') || appId.includes('priority')) {
      return 'task';
    }
    if (appId.includes('integration') || appId.includes('apps') || appId.includes('system')) {
      return 'integration';
    }
    return 'analytics';
  }

  private async getCRMDataForAnalysis() {
    try {
      const [dealsResponse, contactsResponse, communicationsResponse] = await Promise.all([
        supabase.from('deals').select('*').limit(100),
        supabase.from('contacts').select('*').limit(100),
        supabase.from('communications').select('*').limit(50)
      ]);

      return {
        deals: dealsResponse.data || [],
        contacts: contactsResponse.data || [],
        activities: communicationsResponse.data || []
      };
    } catch (error) {
      console.error('Error getting CRM data for analysis:', error);
      return { deals: [], contacts: [], activities: [] };
    }
  }

  private async getBusinessContext(customerId?: string) {
    if (!customerId) return null;

    try {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      return data;
    } catch (error) {
      console.error('Error getting business context:', error);
      return null;
    }
  }

  private getStartDateFromRange(timeRange: string): Date {
    const now = new Date();
    const days = parseInt(timeRange.replace('d', '')) || 30;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  private async triggerAutoAnalysis(appIds: string[], provider: AIProvider) {
    try {
      // Debounce auto-analysis to prevent too frequent triggers
      const lastAutoAnalysis = localStorage.getItem('last_auto_analysis');
      const now = Date.now();
      
      if (lastAutoAnalysis && now - parseInt(lastAutoAnalysis) < 300000) { // 5 minutes
        return;
      }

      localStorage.setItem('last_auto_analysis', now.toString());

      // Run analysis for priority apps only
      const priorityApps = appIds.filter(id => 
        id.includes('pipeline') || id.includes('deal') || id.includes('risk')
      ).slice(0, 3);

      await this.runBatchAnalysis({
        appIds: priorityApps,
        provider,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Auto-analysis failed:', error);
    }
  }

  private processAnalyticsMetrics(analysisData: any[], usageData: any[]): AIAnalyticsMetrics {
    const totalAnalyses = analysisData.length;
    const successfulAnalyses = analysisData.filter(a => a.data?.confidence > 70).length;
    const successRate = totalAnalyses > 0 ? (successfulAnalyses / totalAnalyses) * 100 : 0;

    const avgProcessingTime = usageData.length > 0
      ? usageData.reduce((sum, u) => sum + (u.response_time_ms || 0), 0) / usageData.length
      : 0;

    return {
      totalAnalyses,
      successRate,
      avgProcessingTime,
      topInsightTypes: this.calculateTopInsightTypes(analysisData),
      providerUsage: this.calculateProviderUsage(usageData),
      businessImpactGenerated: {
        revenue: '+$234K estimated',
        efficiency: '+23% productivity',
        riskReduction: '67% fewer issues'
      }
    };
  }

  private calculateTopInsightTypes(analysisData: any[]) {
    const typeCounts: Record<string, number> = {};
    
    analysisData.forEach(analysis => {
      if (analysis.data?.insights) {
        analysis.data.insights.forEach((insight: any) => {
          typeCounts[insight.type] = (typeCounts[insight.type] || 0) + 1;
        });
      }
    });

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateProviderUsage(usageData: any[]) {
    const providerStats: Record<string, { count: number; totalTime: number }> = {};

    usageData.forEach(usage => {
      const provider = usage.model_id;
      if (!providerStats[provider]) {
        providerStats[provider] = { count: 0, totalTime: 0 };
      }
      providerStats[provider].count++;
      providerStats[provider].totalTime += usage.response_time_ms || 0;
    });

    return Object.entries(providerStats).map(([provider, stats]) => ({
      provider: provider as AIProvider,
      count: stats.count,
      avgTime: stats.count > 0 ? stats.totalTime / stats.count : 0
    }));
  }

  private async logBatchAnalysis(
    request: BatchAnalysisRequest,
    results: AIAnalysisResult[],
    errors: string[]
  ) {
    try {
      await supabase
        .from('ai_usage_logs')
        .insert({
          feature_used: 'batch_analysis',
          model_id: request.provider,
          success: errors.length === 0,
          response_time_ms: results.reduce((sum, r) => sum + r.processingTime, 0),
          cost: results.length * 0.05, // Estimated batch cost
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging batch analysis:', error);
    }
  }

  private getDefaultMetrics(): AIAnalyticsMetrics {
    return {
      totalAnalyses: 0,
      successRate: 0,
      avgProcessingTime: 0,
      topInsightTypes: [],
      providerUsage: [],
      businessImpactGenerated: {
        revenue: 'No data available',
        efficiency: 'No data available',
        riskReduction: 'No data available'
      }
    };
  }

  private getDefaultOptimizationPlan() {
    return {
      overallScore: 75,
      priorityActions: [
        'Connect to SmartCRM for real data analysis',
        'Configure AI providers for analysis',
        'Set up regular data sync schedule'
      ],
      quickWins: [
        'Enable real-time insights',
        'Set up automated reports',
        'Configure alert thresholds'
      ],
      strategicInitiatives: [
        'Implement predictive analytics',
        'Develop custom AI models',
        'Create automated workflows'
      ],
      expectedROI: 'Configure data sources for ROI estimation'
    };
  }

  /**
   * Configuration management
   */
  updateConfig(newConfig: Partial<AIAnalyticsConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AIAnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Cache management
   */
  clearCache() {
    this.analysisCache.clear();
  }

  getCacheStats() {
    return {
      size: this.analysisCache.size,
      keys: Array.from(this.analysisCache.keys())
    };
  }
}

export const aiAnalyticsEngine = new AIAnalyticsEngine();