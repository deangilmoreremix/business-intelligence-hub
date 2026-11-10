import React, { useEffect, useRef, useState } from 'react';
import { Brain, Zap, History, Settings, AlertTriangle } from 'lucide-react';
import { AIAnalysisButton } from '../ui/AIAnalysisButton';
import { AIInsightsPanel } from '../ui/AIInsightsPanel';
import { Section } from '../ui/Section';
import { ModernButton } from '../ui/ModernButton';
import type { AIAnalysisResult, AIAnalysisType, AIProvider } from '../../services/aiService';
import { cn } from '../../lib/utils';
import { AI_RUN_EVENT, type AIRunDetail } from '../../lib/aiBus';

interface AIAnalysisSectionProps {
  appId: string;
  analysisType: AIAnalysisType;
  title?: string;
  description?: string;
  className?: string;
  defaultProvider?: AIProvider;
  showHistory?: boolean;
  customData?: Record<string, unknown>;
}

export const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({
  appId,
  analysisType,
  title = "AI Analysis",
  description = "Get AI-powered insights for this application",
  className,
  defaultProvider = 'openai-deep',
  showHistory = true}) => {
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [selectedProvider] = useState<AIProvider>(defaultProvider);
  
  // The AIAnalysisButton runs the analysis and reports back through these callbacks.
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [history, setHistory] = useState<AIAnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [runSignal, setRunSignal] = useState(0);
  const waiters = useRef<Array<(r: AIAnalysisResult | null) => void>>([]);
  const settle = (r: AIAnalysisResult | null) => { waiters.current.splice(0).forEach(w => w(r)); };

  // Allows the host page's own buttons to trigger this section's analysis (see lib/aiBus).
  useEffect(() => {
    const onRun = (e: Event) => {
      const d = (e as CustomEvent<AIRunDetail>).detail;
      if (d.appId !== appId || d.handled) return;
      d.handled = true;
      waiters.current.push(d.done);
      setRunSignal(n => n + 1);
    };
    window.addEventListener(AI_RUN_EVENT, onRun);
    return () => window.removeEventListener(AI_RUN_EVENT, onRun);
  }, [appId]);

  const hasInsights = (result?.insights?.length ?? 0) > 0;
  const highPriorityInsights = result?.insights?.filter(i => i.priority === 'high' || i.priority === 'critical').length ?? 0;

  const handleAnalysisStart = () => { setError(null); setIsAnalyzing(true); };

  const handleAnalysisComplete = (r: AIAnalysisResult) => {
    setIsAnalyzing(false);
    setResult(r);
    if (showHistory) setHistory(h => [r, ...h].slice(0, 10));
    setShowInsightsPanel(true);
    settle(r);
  };

  const handleAnalysisError = (errorMessage: string) => {
    setIsAnalyzing(false);
    setError(errorMessage);
    settle(null);
  };

  const getAnalysisTypeIcon = () => {
    switch (analysisType) {
      case 'pipeline': return <Brain className="w-6 h-6 text-blue-600" />;
      case 'communication': return <Zap className="w-6 h-6 text-green-600" />;
      case 'task': return <Settings className="w-6 h-6 text-purple-600" />;
      case 'integration': return <Settings className="w-6 h-6 text-orange-600" />;
      case 'analytics': return <Brain className="w-6 h-6 text-indigo-600" />;
      default: return <Brain className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <>
      <Section
        title={title}
        description={description}
        icon={getAnalysisTypeIcon()}
        className={className}
      >
        <div className="space-y-6">
          {/* AI Analysis Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AIAnalysisButton
                appId={appId}
                analysisType={analysisType}
                runSignal={runSignal}
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisError={handleAnalysisError}
                defaultProvider={selectedProvider}
                showProviderSelector={true}
              />
              
              {result && (
                <ModernButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInsightsPanel(true)}
                  className="flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  View Insights
                  {highPriorityInsights > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      {highPriorityInsights}
                    </span>
                  )}
                </ModernButton>
              )}
            </div>

            {showHistory && history.length > 0 && (
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={() => setShowInsightsPanel(true)}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                History ({history.length})
              </ModernButton>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Quick Insights Preview */}
          {hasInsights && !isAnalyzing && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Latest AI Insights</h4>
              
              {result?.insights.slice(0, 3).map((insight) => (
                <div 
                  key={insight.id}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={() => setShowInsightsPanel(true)}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      insight.priority === 'high' || insight.priority === 'critical' 
                        ? "bg-red-100 text-red-800" 
                        : "bg-blue-100 text-blue-800"
                    )}>
                      {insight.priority}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 text-sm">{insight.title}</h5>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 line-clamp-2">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {result && result.insights.length > 3 && (
                <button
                  onClick={() => setShowInsightsPanel(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  View all {result.insights.length} insights →
                </button>
              )}
            </div>
          )}

          {/* Analysis Stats */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{result.insights.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Insights</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{result.confidence}%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Confidence</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {(result.processingTime / 1000).toFixed(1)}s
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Processing</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{result.dataPointsAnalyzed}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Data Points</p>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* AI Insights Panel */}
      <AIInsightsPanel
        isOpen={showInsightsPanel}
        onClose={() => setShowInsightsPanel(false)}
        analysisResult={result}
        isLoading={isAnalyzing}
        error={error}
      />
    </>
  );
};