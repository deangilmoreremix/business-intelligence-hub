import { useState, useCallback } from 'react';
import { aiService, type AIAnalysisRequest, type AIAnalysisResult, type AIProvider, type AIAnalysisType } from '../services/aiService';

export interface AIAnalysisState {
  isAnalyzing: boolean;
  result: AIAnalysisResult | null;
  error: string | null;
  history: AIAnalysisResult[];
  lastAnalysisTime: Date | null;
}

export interface AIAnalysisOptions {
  provider?: AIProvider;
  includeHistory?: boolean;
  autoSave?: boolean;
  timeout?: number;
}

export function useAIAnalysis(
  appId: string, 
  analysisType: AIAnalysisType,
  options: AIAnalysisOptions = {}
) {
  const [state, setState] = useState<AIAnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
    history: [],
    lastAnalysisTime: null
  });

  const analyze = useCallback(async (
    customData?: any,
    customProvider?: AIProvider
  ): Promise<AIAnalysisResult | null> => {
    try {
      setState(prev => ({
        ...prev,
        isAnalyzing: true,
        error: null
      }));

      // Get current data from stores if not provided
      let analysisData = customData;
      if (!analysisData) {
        const { useDealStore } = await import('../store/dealStore');
        const { useContactStore } = await import('../store/contactStore');
        
        const deals = Object.values(useDealStore.getState().deals);
        const contacts = Object.values(useContactStore.getState().contacts);
        
        analysisData = { deals, contacts };
      }

      const request: AIAnalysisRequest = {
        appId,
        analysisType,
        provider: customProvider || options.provider || 'gpt-5',
        data: {
          ...analysisData,
          timeRange: '30d'
        }
      };

      const result = await aiService.analyzeWithAI(request);

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        result,
        lastAnalysisTime: new Date(),
        history: options.includeHistory ? [result, ...prev.history.slice(0, 9)] : prev.history
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }));

      console.error('AI Analysis error:', error);
      return null;
    }
  }, [appId, analysisType, options]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      result: null, 
      error: null,
      lastAnalysisTime: null 
    }));
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const history = await aiService.getRecentAnalysis(appId, 10);
      setState(prev => ({ ...prev, history }));
    } catch (error) {
      console.error('Error loading analysis history:', error);
    }
  }, [appId]);

  // Auto-load history if option is enabled
  React.useEffect(() => {
    if (options.includeHistory) {
      loadHistory();
    }
  }, [options.includeHistory, loadHistory]);

  return {
    ...state,
    analyze,
    clearError,
    clearResult,
    loadHistory,
    
    // Computed properties
    hasInsights: state.result?.insights.length > 0,
    highPriorityInsights: state.result?.insights.filter(i => 
      i.priority === 'high' || i.priority === 'critical'
    ).length || 0,
    
    // Helper functions
    getInsightsByType: (type: string) => 
      state.result?.insights.filter(i => i.type === type) || [],
    getInsightsByPriority: (priority: string) => 
      state.result?.insights.filter(i => i.priority === priority) || []
  };
}