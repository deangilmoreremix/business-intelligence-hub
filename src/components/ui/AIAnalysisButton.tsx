import React, { useState } from 'react';
import { Brain, Zap, Loader2, ChevronDown } from 'lucide-react';
import { ModernButton } from './ModernButton';
import { cn } from '../../lib/utils';
import type { AIProvider, AIAnalysisType } from '../../services/aiService';
import { Tooltip } from './Tooltip';
import { tooltipContent } from '../../data/tooltipContent';

interface AIAnalysisButtonProps {
  appId: string;
  analysisType: AIAnalysisType;
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (result: any) => void;
  onAnalysisError?: (error: string) => void;
  className?: string;
  variant?: 'primary' | 'glass' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showProviderSelector?: boolean;
  defaultProvider?: AIProvider;
}

export const AIAnalysisButton: React.FC<AIAnalysisButtonProps> = ({
  appId,
  analysisType,
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
  className,
  variant = 'primary',
  size = 'md',
  showProviderSelector = true,
  defaultProvider = 'gpt-5'
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(defaultProvider);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const providers = [
    { 
      id: 'gpt-5' as const, 
      name: 'GPT-5', 
      icon: Brain,
      description: 'Advanced reasoning and analysis',
      badge: 'PREMIUM'
    },
    { 
      id: 'gemini' as const, 
      name: 'Gemini', 
      icon: Zap,
      description: 'Fast processing and insights',
      badge: 'FAST'
    }
  ];

  const currentProvider = providers.find(p => p.id === selectedProvider) || providers[0];
  const CurrentIcon = currentProvider.icon;

  const handleAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      onAnalysisStart?.();

      // Import AI service dynamically
      const { aiService } = await import('../../services/aiService');
      const { useDealStore } = await import('../../store/dealStore');
      const { useContactStore } = await import('../../store/contactStore');

      // Get current data from stores
      const deals = Object.values(useDealStore.getState().deals);
      const contacts = Object.values(useContactStore.getState().contacts);

      const result = await aiService.analyzeWithAI({
        appId,
        analysisType,
        provider: selectedProvider,
        data: {
          deals,
          contacts,
          timeRange: '30d'
        }
      });

      setLastAnalysis(new Date());
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      onAnalysisError?.(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisButtonText = () => {
    if (isAnalyzing) return 'Analyzing...';
    if (lastAnalysis) return 'Re-analyze with AI';
    return 'AI Analysis';
  };

  const getAnalysisIcon = () => {
    if (isAnalyzing) return <Loader2 className="w-4 h-4 animate-spin" />;
    return <CurrentIcon className="w-4 h-4" />;
  };

  if (!showProviderSelector) {
    return (
      <Tooltip content={tooltipContent.buttons.aiAnalysis} position="top">
        <ModernButton
          onClick={handleAnalysis}
          variant={variant}
          size={size}
          loading={isAnalyzing}
          className={cn("flex items-center gap-2", className)}
        >
          {getAnalysisIcon()}
          {getAnalysisButtonText()}
        </ModernButton>
      </Tooltip>
    );
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      {/* Main Analysis Button */}
      <Tooltip content={tooltipContent.buttons.aiAnalysisWithProvider} position="top">
        <ModernButton
          onClick={handleAnalysis}
          variant={variant}
          size={size}
          loading={isAnalyzing}
          className="rounded-r-none border-r-0 flex items-center gap-2"
        >
          {getAnalysisIcon()}
          {getAnalysisButtonText()}
        </ModernButton>
      </Tooltip>

      {/* Provider Selector Dropdown */}
      <div className="relative">
        <Tooltip content="Select AI provider for analysis" position="top">
          <button
            onClick={() => setShowProviderMenu(!showProviderMenu)}
            disabled={isAnalyzing}
            className={cn(
              "px-2 py-2 rounded-r-lg border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              variant === 'primary' && "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white",
              variant === 'outline' && "bg-white hover:bg-gray-50 border-gray-300 text-gray-700",
              variant === 'glass' && "bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30",
              isAnalyzing && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Select AI provider"
            type="button"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </Tooltip>

        {showProviderMenu && (
          <div className="absolute right-0 top-full mt-1 py-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {providers.map((provider) => {
              const ProviderIcon = provider.icon;
              const isSelected = provider.id === selectedProvider;
              
              return (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setShowProviderMenu(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left flex items-center gap-3 transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  type="button"
                >
                  <ProviderIcon className={cn(
                    "w-4 h-4",
                    isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                      )}>
                        {provider.name}
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.5 text-xs font-medium rounded-full",
                        provider.badge === 'PREMIUM' ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                      )}>
                        {provider.badge}
                      </span>
                    </div>
                    <p className={cn(
                      "text-xs",
                      isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {provider.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Last Analysis Indicator */}
      {lastAnalysis && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500 dark:text-gray-400">
          Last: {lastAnalysis.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};