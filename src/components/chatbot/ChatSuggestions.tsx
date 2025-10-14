import React from 'react';
import { Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  compact?: boolean;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  compact = false
}) => {
  const { isDark } = useTheme();

  if (suggestions.length === 0) return null;

  return (
    <div className={cn('space-y-2', !compact && 'mt-4')}>
      {!compact && (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Suggested questions:</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              'hover:scale-105 active:scale-95',
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
              compact && 'text-[11px] px-2.5 py-1'
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
