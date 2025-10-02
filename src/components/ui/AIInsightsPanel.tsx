import React, { useState } from 'react';
import { X, Brain, TrendingUp, Target, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ModernButton } from './ModernButton';
import type { AIAnalysisResult, AIInsight } from '../../services/aiService';

interface AIInsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: AIAnalysisResult | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  isOpen,
  onClose,
  analysisResult,
  isLoading = false,
  error = null,
  className
}) => {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('insights');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'trend': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'recommendation': return <Target className="w-4 h-4 text-purple-600" />;
      case 'optimization': return <CheckCircle className="w-4 h-4 text-orange-600" />;
      default: return <Brain className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const sections = [
    { id: 'insights', label: 'AI Insights', count: analysisResult?.insights?.length || 0 },
    { id: 'recommendations', label: 'Recommendations', count: analysisResult?.recommendations?.length || 0 },
    { id: 'actions', label: 'Next Actions', count: analysisResult?.nextActions?.length || 0 },
    { id: 'impact', label: 'Business Impact', count: Object.keys(analysisResult?.businessImpact || {}).length }
  ];

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl z-50",
      "transform transition-transform duration-300 ease-in-out",
      "border-l border-gray-200 dark:border-gray-700",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Analysis Results</h2>
            {analysisResult && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {analysisResult.provider.toUpperCase()} • {analysisResult.insights.length} insights • 
                {analysisResult.confidence}% confidence
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">AI is analyzing your data...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">This may take up to 30 seconds</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {analysisResult && !isLoading && (
          <div className="p-6 space-y-6">
            {/* Analysis Summary */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Analysis Summary</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">{analysisResult.summary}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-blue-700 dark:text-blue-300">
                <span>Processing Time: {(analysisResult.processingTime / 1000).toFixed(1)}s</span>
                <span>Data Points: {analysisResult.dataPointsAnalyzed}</span>
                <span>Provider: {analysisResult.provider.toUpperCase()}</span>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setExpandedSection(section.id)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium rounded transition-all duration-200",
                    expandedSection === section.id
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  {section.label}
                  {section.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                      {section.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Insights Section */}
            {expandedSection === 'insights' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI-Generated Insights
                </h3>
                
                {analysisResult.insights.map((insight, index) => (
                  <div
                    key={insight.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                      "hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700",
                      selectedInsight?.id === insight.id 
                        ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    )}
                    onClick={() => setSelectedInsight(selectedInsight?.id === insight.id ? null : insight)}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{insight.title}</h4>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full border",
                            getPriorityColor(insight.priority)
                          )}>
                            {insight.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{insight.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Impact:</span>
                            <span className={cn("font-medium", getImpactColor(insight.impact))}>
                              {insight.impact}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Confidence:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {insight.confidence}%
                            </span>
                          </div>
                          {insight.estimatedROI && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-green-500" />
                              <span className="font-medium text-green-600">{insight.estimatedROI}</span>
                            </div>
                          )}
                        </div>

                        {/* Expanded Insight Details */}
                        {selectedInsight?.id === insight.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                            {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Suggested Actions:</h5>
                                <ul className="space-y-1">
                                  {insight.suggestedActions.map((action, actionIndex) => (
                                    <li key={actionIndex} className="flex items-start gap-2 text-sm">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-gray-700 dark:text-gray-300">{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {insight.timeToImplement && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  Estimated implementation time: {insight.timeToImplement}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations Section */}
            {expandedSection === 'recommendations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Strategic Recommendations
                </h3>
                
                {analysisResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-green-800 dark:text-green-200">{index + 1}</span>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Next Actions Section */}
            {expandedSection === 'actions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Immediate Next Actions
                </h3>
                
                {analysisResult.nextActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 dark:text-blue-200">{action}</p>
                    </div>
                    <ModernButton variant="outline" size="sm">
                      Take Action
                    </ModernButton>
                  </div>
                ))}
              </div>
            )}

            {/* Business Impact Section */}
            {expandedSection === 'impact' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Expected Business Impact
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResult.businessImpact.revenue && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Revenue Impact</h4>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {analysisResult.businessImpact.revenue}
                      </p>
                    </div>
                  )}
                  
                  {analysisResult.businessImpact.efficiency && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Efficiency Gain</h4>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {analysisResult.businessImpact.efficiency}
                      </p>
                    </div>
                  )}
                  
                  {analysisResult.businessImpact.riskReduction && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Risk Reduction</h4>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {analysisResult.businessImpact.riskReduction}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Analysis completed: {new Date(analysisResult.createdAt).toLocaleString()}</span>
                <span>ID: {analysisResult.id.slice(-8)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {analysisResult && !isLoading && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3">
            <ModernButton variant="outline" size="sm" className="flex-1">
              Export Analysis
            </ModernButton>
            <ModernButton variant="outline" size="sm" className="flex-1">
              Schedule Review
            </ModernButton>
            <ModernButton variant="primary" size="sm" className="flex-1">
              Implement Top Rec
            </ModernButton>
          </div>
        </div>
      )}
    </div>
  );
};