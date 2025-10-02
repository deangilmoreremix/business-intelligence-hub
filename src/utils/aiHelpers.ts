import type { AIInsight, AIAnalysisResult } from '../services/aiService';

export function categorizeInsights(insights: AIInsight[]) {
  return {
    opportunities: insights.filter(i => i.type === 'opportunity'),
    risks: insights.filter(i => i.type === 'risk'),
    trends: insights.filter(i => i.type === 'trend'),
    recommendations: insights.filter(i => i.type === 'recommendation'),
    optimizations: insights.filter(i => i.type === 'optimization')
  };
}

export function prioritizeInsights(insights: AIInsight[]): AIInsight[] {
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  return insights.sort((a, b) => {
    // Sort by priority first, then by confidence
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });
}

export function calculateROIFromInsights(insights: AIInsight[]): {
  totalEstimatedROI: number;
  highImpactCount: number;
  quickWinsCount: number;
} {
  let totalROI = 0;
  let highImpactCount = 0;
  let quickWinsCount = 0;

  insights.forEach(insight => {
    if (insight.impact === 'high') highImpactCount++;
    if (insight.effort === 'low' && insight.impact !== 'low') quickWinsCount++;
    
    // Extract ROI percentage from estimatedROI string
    if (insight.estimatedROI) {
      const roiMatch = insight.estimatedROI.match(/(\d+)%/);
      if (roiMatch) {
        totalROI += parseInt(roiMatch[1]);
      }
    }
  });

  return {
    totalEstimatedROI: totalROI,
    highImpactCount,
    quickWinsCount
  };
}

export function formatAnalysisTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function getInsightTypeIcon(type: string): string {
  switch (type) {
    case 'opportunity': return '💡';
    case 'risk': return '⚠️';
    case 'trend': return '📈';
    case 'recommendation': return '🎯';
    case 'optimization': return '⚡';
    default: return '🤖';
  }
}

export function generateInsightSummary(result: AIAnalysisResult): string {
  const { insights } = result;
  const categories = categorizeInsights(insights);
  
  const summaryParts = [];
  
  if (categories.opportunities.length > 0) {
    summaryParts.push(`${categories.opportunities.length} opportunities identified`);
  }
  
  if (categories.risks.length > 0) {
    summaryParts.push(`${categories.risks.length} risks detected`);
  }
  
  if (categories.recommendations.length > 0) {
    summaryParts.push(`${categories.recommendations.length} recommendations provided`);
  }

  return summaryParts.join(', ') || 'Analysis completed';
}

export function filterInsightsByApp(
  insights: AIInsight[], 
  appId: string, 
  analysisResults: AIAnalysisResult[]
): AIInsight[] {
  const appResults = analysisResults.filter(r => r.appId === appId);
  const appInsightIds = appResults.flatMap(r => r.insights.map(i => i.id));
  return insights.filter(i => appInsightIds.includes(i.id));
}

export function getInsightActionability(insight: AIInsight): {
  score: number;
  factors: string[];
  nextSteps: string[];
} {
  let score = 0;
  const factors = [];
  const nextSteps = [];

  // Calculate actionability score
  if (insight.actionable) score += 30;
  if (insight.suggestedActions && insight.suggestedActions.length > 0) {
    score += 25;
    factors.push('Has specific action items');
  }
  if (insight.effort === 'low') {
    score += 20;
    factors.push('Low implementation effort');
  }
  if (insight.impact === 'high') {
    score += 15;
    factors.push('High business impact');
  }
  if (insight.confidence > 80) {
    score += 10;
    factors.push('High AI confidence');
  }

  // Generate next steps
  if (insight.suggestedActions) {
    nextSteps.push(...insight.suggestedActions.slice(0, 3));
  }
  
  if (insight.timeToImplement) {
    nextSteps.push(`Timeline: ${insight.timeToImplement}`);
  }

  return { score, factors, nextSteps };
}