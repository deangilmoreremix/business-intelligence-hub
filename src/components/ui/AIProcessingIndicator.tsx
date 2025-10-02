import React from 'react';
import { Brain, Zap, Loader2 } from 'lucide-react';

interface AIProcessingIndicatorProps {
  isProcessing: boolean;
  message?: string;
  type?: 'brain' | 'zap' | 'loader';
}

export const AIProcessingIndicator: React.FC<AIProcessingIndicatorProps> = ({
  isProcessing,
  message = 'AI is analyzing...',
  type = 'brain'
}) => {
  if (!isProcessing) return null;

  const getIcon = () => {
    switch (type) {
      case 'zap': return <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'loader': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'brain':
      default: return <Brain className="w-5 h-5 text-purple-500 animate-pulse" />;
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
      {getIcon()}
      <span className="text-sm text-blue-700 font-medium">{message}</span>
    </div>
  );
};