import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { Tooltip } from './Tooltip';
import { tooltipContent } from '../../data/tooltipContent';

export const DarkModeToggle: React.FC = () => {
  const { isDark, themeMode, setThemeMode, systemPrefersDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    { 
      key: 'light' as const, 
      label: 'Light', 
      icon: Sun,
      description: 'Light mode'
    },
    { 
      key: 'dark' as const, 
      label: 'Dark', 
      icon: Moon,
      description: 'Dark mode'
    },
    { 
      key: 'system' as const, 
      label: 'System', 
      icon: Monitor,
      description: `Follow system (${systemPrefersDark ? 'dark' : 'light'})`
    },
  ];

  const currentOption = themeOptions.find(option => option.key === themeMode) || themeOptions[0];
  const CurrentIcon = currentOption.icon;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const currentIndex = themeOptions.findIndex(option => option.key === themeMode);
      const nextIndex = event.key === 'ArrowDown' 
        ? (currentIndex + 1) % themeOptions.length
        : (currentIndex - 1 + themeOptions.length) % themeOptions.length;
      setThemeMode(themeOptions[nextIndex].key);
    }
  };

  const handleOptionSelect = (optionKey: typeof themeMode) => {
    setThemeMode(optionKey);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-theme-toggle]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus management for accessibility
  useEffect(() => {
    if (!isOpen) {
      const button = document.querySelector('[data-theme-toggle] button') as HTMLElement;
      button?.focus();
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const tooltipText = isDark
    ? tooltipContent.features.darkModeEnabled
    : tooltipContent.features.darkModeDisabled;

  return (
    <div className="relative" data-theme-toggle>
      <Tooltip content={tooltipText} position="bottom" disabled={isOpen}>
        <button
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          className={cn(
            "p-2 rounded-lg glass-card hover:shadow-lg transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900",
            "bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600"
          )}
          aria-label={`Current theme: ${currentOption.description}. Click to change theme.`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          type="button"
        >
          <CurrentIcon
            className={cn(
              "w-5 h-5 transition-all duration-200",
              isDark ? "text-yellow-400 rotate-0" : "text-gray-700 rotate-0",
              isOpen && "rotate-12"
            )}
            aria-hidden="true"
          />
        </button>
      </Tooltip>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 py-1 w-48",
            "glass-card rounded-lg shadow-xl border",
            "bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-600",
            "backdrop-blur-md z-50 animate-slide-in"
          )}
          role="menu"
          aria-label="Theme options"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = option.key === themeMode;
            
            return (
              <button
                key={option.key}
                onClick={() => handleOptionSelect(option.key)}
                className={cn(
                  "w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-150",
                  "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150",
                  "focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700",
                  "first:rounded-t-lg last:rounded-b-lg",
                  isSelected && "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500"
                )}
                role="menuitem"
                aria-selected={isSelected}
                type="button"
              >
                <Icon 
                  className={cn(
                    "w-4 h-4",
                    isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
                    "transition-colors duration-150"
                  )} 
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <div className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                  )}>
                    {option.label}
                  </div>
                  <div className={cn(
                    "text-xs transition-colors duration-150",
                    isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-scale-in"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};