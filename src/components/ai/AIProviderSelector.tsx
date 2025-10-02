import React, { useState } from 'react';
import { Brain, Zap, Check, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AIProvider } from '../../services/aiService';

interface AIProviderOption {
  id: AIProvider;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  features: string[];
  badge?: string;
  pricing?: string;
  speed?: 'fast' | 'medium' | 'slow';
  accuracy?: 'high' | 'medium' | 'low';
}

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  className?: string;
  showDetails?: boolean;
}

const providerOptions: AIProviderOption[] = [
  {
    id: 'gpt-5',
    name: 'GPT-5',
    icon: Brain,
    description: 'Advanced reasoning and comprehensive analysis',
    features: [
      'Deep business insights',
      'Complex pattern recognition',
      'Strategic recommendations',
      'Multi-factor analysis'
    ],
    badge: 'PREMIUM',
    pricing: '$0.03/1K tokens',
    speed: 'medium',
    accuracy: 'high'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: Zap,
    description: 'Fast processing with practical insights',
    features: [
      'Rapid analysis',
      'Real-time insights',
      'Efficient processing',
      'Quick recommendations'
    ],
    badge: 'FAST',
    pricing: '$0.01/1K tokens',
    speed: 'fast',
    accuracy: 'high'
  }
];

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  className,
  showDetails = false
}) => {
  const [hoveredProvider, setHoveredProvider] = useState<AIProvider | null>(null);

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'slow': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!showDetails) {
    // Simple selector for compact spaces
    return (
      <div className={cn("flex gap-2", className)}>
        {providerOptions.map((provider) => {
          const Icon = provider.icon;
          const isSelected = provider.id === selectedProvider;
          
          return (
            <button
              key={provider.id}
              onClick={() => onProviderChange(provider.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                "border focus:outline-none focus:ring-2 focus:ring-blue-500",
                isSelected
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              type="button"
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{provider.name}</span>
              {provider.badge && (
                <span className={cn(
                  "px-1.5 py-0.5 text-xs font-medium rounded-full",
                  provider.badge === 'PREMIUM' ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                )}>
                  {provider.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Detailed selector with full information
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Choose AI Provider</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providerOptions.map((provider) => {
          const Icon = provider.icon;
          const isSelected = provider.id === selectedProvider;
          const isHovered = hoveredProvider === provider.id;
          
          return (
            <div
              key={provider.id}
              className={cn(
                "relative p-4 border rounded-lg cursor-pointer transition-all duration-200",
                "hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500",
                isSelected
                  ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
              )}
              onMouseEnter={() => setHoveredProvider(provider.id)}
              onMouseLeave={() => setHoveredProvider(null)}
              onClick={() => onProviderChange(provider.id)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Provider Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isSelected ? "bg-blue-100 dark:bg-blue-900/50" : "bg-gray-100 dark:bg-gray-700"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-semibold",
                      isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                    )}>
                      {provider.name}
                    </h4>
                    {provider.badge && (
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        provider.badge === 'PREMIUM' 
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      )}>
                        {provider.badge}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-sm",
                    isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                  )}>
                    {provider.description}
                  </p>
                </div>
              </div>

              {/* Provider Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center">
                  <div className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    getSpeedColor(provider.speed || 'medium')
                  )}>
                    {provider.speed} speed
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-xs font-medium",
                    getAccuracyColor(provider.accuracy || 'high')
                  )}>
                    {provider.accuracy} accuracy
                  </div>
                </div>
              </div>

              {/* Features List */}
              {(isHovered || isSelected) && (
                <div className="space-y-1 animate-slide-in">
                  {provider.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className={cn(
                        isSelected ? "text-blue-800 dark:text-blue-200" : "text-gray-700 dark:text-gray-300"
                      )}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing Info */}
              {provider.pricing && (isHovered || isSelected) && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pricing: {provider.pricing}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Provider Comparison */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Provider Comparison</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>• <strong>GPT-5:</strong> Best for complex analysis, strategic insights, and detailed recommendations</p>
          <p>• <strong>Gemini:</strong> Ideal for quick insights, real-time analysis, and rapid decision-making</p>
        </div>
      </div>
    </div>
  );
};