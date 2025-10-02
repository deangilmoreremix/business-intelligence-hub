import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Type, Contrast } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccessibilityFeaturesProps {
  className?: string;
}

export const AccessibilityFeatures: React.FC<AccessibilityFeaturesProps> = ({
  className
}) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [isOpen, setIsOpen] = useState(false);

  // Initialize from user preferences
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('high-contrast') === 'true';
    const savedReducedMotion = localStorage.getItem('reduced-motion') === 'true' || 
                             window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const savedFontSize = localStorage.getItem('font-size') || 'normal';

    setHighContrast(savedHighContrast);
    setReducedMotion(savedReducedMotion);
    setFontSize(savedFontSize);

    // Apply initial settings
    if (savedHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    if (savedReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
    document.documentElement.setAttribute('data-font-size', savedFontSize);
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('high-contrast', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('reduced-motion', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem('font-size', size);
    document.documentElement.setAttribute('data-font-size', size);
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small', multiplier: '0.875' },
    { value: 'normal', label: 'Normal', multiplier: '1' },
    { value: 'large', label: 'Large', multiplier: '1.125' },
    { value: 'x-large', label: 'Extra Large', multiplier: '1.25' }
  ];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-lg glass-card hover:shadow-lg transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
        )}
        aria-label="Accessibility settings"
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
      >
        <Eye className="w-5 h-5 text-gray-700 dark:text-gray-400" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 p-4 w-64",
            "bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700",
            "z-50 animate-slide-in"
          )}
          role="dialog"
          aria-label="Accessibility settings"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Accessibility Settings
          </h3>

          <div className="space-y-4">
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  High Contrast
                </label>
              </div>
              <button
                onClick={toggleHighContrast}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  highContrast ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                )}
                role="switch"
                aria-checked={highContrast}
                aria-label="Toggle high contrast mode"
                type="button"
              >
                <span
                  className={cn(
                    "inline-block h-3 w-3 transform rounded-full bg-white transition",
                    highContrast ? "translate-x-5" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Reduce Motion
                </label>
              </div>
              <button
                onClick={toggleReducedMotion}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  reducedMotion ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                )}
                role="switch"
                aria-checked={reducedMotion}
                aria-label="Toggle reduced motion"
                type="button"
              >
                <span
                  className={cn(
                    "inline-block h-3 w-3 transform rounded-full bg-white transition",
                    reducedMotion ? "translate-x-5" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {/* Font Size Selection */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Font Size
                </label>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {fontSizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFontSizeChange(option.value)}
                    className={cn(
                      "px-2 py-1 text-xs rounded border transition-colors",
                      "focus:outline-none focus:ring-1 focus:ring-blue-500",
                      fontSize === option.value
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    )}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                "w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300",
                "hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};