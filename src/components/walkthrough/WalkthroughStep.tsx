import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { WalkthroughStep as WalkthroughStepType } from '../../types/walkthrough';

interface WalkthroughStepProps {
  step: WalkthroughStepType;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const WalkthroughStep: React.FC<WalkthroughStepProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const calculatePosition = () => {
      if (step.position === 'center' || !step.targetElement) {
        setPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2
        });
        setIsPositioned(true);
        return;
      }

      const target = document.querySelector(step.targetElement);
      const card = cardRef.current;

      if (!target || !card) {
        setPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2
        });
        setIsPositioned(true);
        return;
      }

      const targetRect = target.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const padding = 20;
      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'top':
          top = targetRect.top - cardRect.height - padding;
          left = targetRect.left + targetRect.width / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + targetRect.width / 2;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2;
          left = targetRect.left - cardRect.width - padding;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2;
          left = targetRect.right + padding;
          break;
        default:
          top = window.innerHeight / 2;
          left = window.innerWidth / 2;
      }

      if (left < padding) left = padding;
      if (left + cardRect.width > window.innerWidth - padding) {
        left = window.innerWidth - cardRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + cardRect.height > window.innerHeight - padding) {
        top = window.innerHeight - cardRect.height - padding;
      }

      setPosition({ top, left });
      setIsPositioned(true);
    };

    setTimeout(calculatePosition, 50);

    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [step.targetElement, step.position]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const isCenter = step.position === 'center' || !step.targetElement;

  return (
    <div
      ref={cardRef}
      className={cn(
        'pointer-events-auto',
        'transition-all duration-300',
        isPositioned ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        isCenter ? 'fixed' : 'absolute'
      )}
      style={
        isCenter
          ? {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }
          : {
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform:
                step.position === 'top' || step.position === 'bottom'
                  ? 'translateX(-50%)'
                  : step.position === 'left' || step.position === 'right'
                  ? 'translateY(-50%)'
                  : 'none'
            }
      }
    >
      <div
        className={cn(
          'rounded-xl shadow-2xl p-6 max-w-md',
          'border-2',
          isDark
            ? 'bg-gray-800 border-blue-500/50'
            : 'bg-white border-blue-400/50',
          'animate-slide-in'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStepIndex + 1} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close walkthrough"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {step.description}
        </p>

        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 rounded-full flex-1 transition-all duration-300',
                index <= currentStepIndex
                  ? 'bg-blue-500'
                  : isDark
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {step.showSkip !== false && (
              <button
                onClick={onSkip}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                  'text-gray-600 dark:text-gray-400',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'flex items-center gap-2'
                )}
              >
                <SkipForward className="w-4 h-4" />
                Skip Tour
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={onPrev}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                  'bg-gray-100 dark:bg-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-200 dark:hover:bg-gray-600',
                  'flex items-center gap-2'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                {step.prevLabel || 'Previous'}
              </button>
            )}

            <button
              onClick={onNext}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                'bg-blue-600 hover:bg-blue-700',
                'text-white btn-solid',
                'flex items-center gap-2',
                'shadow-lg shadow-blue-500/30'
              )}
            >
              {currentStepIndex === totalSteps - 1
                ? 'Finish'
                : step.nextLabel || 'Next'}
              {currentStepIndex < totalSteps - 1 && (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
