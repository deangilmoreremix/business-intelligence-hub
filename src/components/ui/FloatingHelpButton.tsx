import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { Tooltip } from './Tooltip';
import { tooltipContent } from '../../data/tooltipContent';

interface FloatingHelpButtonProps {
  onOpenHelp: () => void;
  className?: string;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({
  onOpenHelp,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'flex flex-col items-end gap-3',
        className
      )}
      data-tour="help-button"
    >
      <div
        className={cn(
          'transition-all duration-300',
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        )}
      >
        <div
          className={cn(
            'rounded-lg shadow-xl p-4 max-w-sm',
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Need Help?
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Access guided tours, keyboard shortcuts, and help resources.
          </p>
          <button
            onClick={() => {
              setIsExpanded(false);
              onOpenHelp();
            }}
            className={cn(
              'w-full px-4 py-2 rounded-lg font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white btn-solid',
              'transition-colors duration-200'
            )}
          >
            Open Help Center
          </button>
        </div>
      </div>

      <Tooltip
        content={tooltipContent.help.startTour}
        position="left"
      >
        <button
          onClick={() => {
            if (isExpanded) {
              setIsExpanded(false);
              onOpenHelp();
            } else {
              setIsExpanded(!isExpanded);
            }
          }}
          className={cn(
            'p-4 rounded-full shadow-2xl',
            'transition-all duration-300',
            'hover:scale-110 active:scale-95',
            isDark
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600',
            'text-white',
            'group'
          )}
          aria-label="Get help"
        >
          <HelpCircle
            className={cn(
              'w-6 h-6 transition-transform duration-300',
              isExpanded && 'rotate-90'
            )}
          />
        </button>
      </Tooltip>
    </div>
  );
};
