import React, { useState, useMemo } from 'react';
import { X, Search, Play, CheckCircle, Circle, RotateCcw, Book, Keyboard, Video } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { useWalkthrough } from '../../contexts/WalkthroughContext';
import { getAllWalkthroughs, getWalkthroughsByCategory } from '../../data/walkthroughs';
import { Walkthrough } from '../../types/walkthrough';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Walkthrough['category']>('all');
  const { isDark } = useTheme();
  const { startWalkthrough, getProgress, resetProgress } = useWalkthrough();

  const allWalkthroughs = useMemo(() => getAllWalkthroughs(), []);

  const filteredWalkthroughs = useMemo(() => {
    let filtered = selectedCategory === 'all'
      ? allWalkthroughs
      : getWalkthroughsByCategory(selectedCategory);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        w =>
          w.title.toLowerCase().includes(term) ||
          w.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [allWalkthroughs, selectedCategory, searchTerm]);

  const handleStartTour = (walkthroughId: string) => {
    startWalkthrough(walkthroughId);
    onClose();
  };

  const handleResetTour = async (walkthroughId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await resetProgress(walkthroughId);
  };

  const handleResetAll = async () => {
    if (window.confirm('Are you sure you want to reset all tour progress?')) {
      await resetProgress();
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Tours' },
    { id: 'onboarding', label: 'Getting Started' },
    { id: 'feature', label: 'Features' },
    { id: 'app', label: 'Applications' },
    { id: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative w-full max-w-4xl max-h-[90vh] m-4',
          'rounded-2xl shadow-2xl overflow-hidden',
          isDark ? 'bg-gray-800' : 'bg-white'
        )}
      >
        <div className={cn(
          'p-6 border-b',
          isDark ? 'border-gray-700' : 'border-gray-200'
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Help Center
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Guided tours and learning resources
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tours and help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-lg',
                'border-2 transition-all',
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              )}
            />
          </div>
        </div>

        <div className="flex gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-300px)] p-6">
          <div className="grid gap-4">
            {filteredWalkthroughs.map((walkthrough) => {
              const progress = getProgress(walkthrough.id);
              const isCompleted = progress?.completed || false;

              return (
                <div
                  key={walkthrough.id}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all cursor-pointer',
                    'hover:shadow-lg',
                    isDark
                      ? 'bg-gray-700/50 border-gray-600 hover:border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-400'
                  )}
                  onClick={() => handleStartTour(walkthrough.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          'p-2 rounded-lg',
                          isCompleted
                            ? 'bg-green-100 dark:bg-green-900/50'
                            : 'bg-blue-100 dark:bg-blue-900/50'
                        )}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {walkthrough.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {walkthrough.steps.length} steps
                            {progress && !isCompleted && (
                              <span className="ml-2">
                                • Step {progress.currentStep + 1}/{walkthrough.steps.length}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {walkthrough.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        )}>
                          {walkthrough.category}
                        </span>
                        {isCompleted && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleStartTour(walkthrough.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg font-medium transition-all',
                          'bg-blue-600 hover:bg-blue-700 text-white',
                          'flex items-center gap-2'
                        )}
                      >
                        <Play className="w-4 h-4" />
                        {isCompleted ? 'Replay' : progress ? 'Continue' : 'Start'}
                      </button>
                      {progress && (
                        <button
                          onClick={(e) => handleResetTour(walkthrough.id, e)}
                          className={cn(
                            'px-4 py-2 rounded-lg font-medium transition-all',
                            'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500',
                            'text-gray-700 dark:text-gray-300',
                            'flex items-center gap-2'
                          )}
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredWalkthroughs.length === 0 && (
              <div className="text-center py-12">
                <Book className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No tours found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          'p-4 border-t flex items-center justify-between',
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        )}>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetAll}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all',
                'text-gray-600 dark:text-gray-400',
                'hover:bg-gray-200 dark:hover:bg-gray-700',
                'flex items-center gap-2'
              )}
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Progress
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Keyboard className="w-4 h-4" />
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
