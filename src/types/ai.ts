export interface AIConfiguration {
  defaultProvider: 'openai-deep' | 'openai-fast';
  enableAutoAnalysis: boolean;
  analysisFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  maxTokensPerAnalysis: number;
  confidenceThreshold: number;
  enableCaching: boolean;
  batchAnalysisEnabled: boolean;
}

export interface AIUsageStats {
  totalCost: number;
  totalTokens: number;
  analysesRun: number;
  avgProcessingTime: number;
  successRate: number;
  topPerformingApps: string[];
}

export interface AIInsightImplementation {
  insightId: string;
  implementedAt: string;
  implementedBy: string;
  status: 'implemented' | 'in-progress' | 'cancelled';
  results?: {
    metricsBefore: Record<string, number>;
    metricsAfter: Record<string, number>;
    impact: string;
  };
}

export interface AIAnalysisHistory {
  id: string;
  appId: string;
  analysisType: string;
  provider: string;
  timestamp: string;
  insights: number;
  confidence: number;
  processingTime: number;
  implemented: number;
}

export interface AIRecommendationTracking {
  recommendationId: string;
  recommendation: string;
  appId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  estimatedImpact: string;
  actualImpact?: string;
  implementationNotes?: string;
  createdAt: string;
  updatedAt: string;
}