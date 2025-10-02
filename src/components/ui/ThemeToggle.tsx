import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

interface ThemeToggleProps {
  variant?: 'button' | 'tabs';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabels = false,
  className
}) => {
  const { themeMode, setThemeMode, isDark, systemPrefersDark } = useTheme();

  const themeOptions = [
    { 
      key: 'light' as const, 
      label: 'Light', 
      icon: Sun,
      shortcut: 'L'
    },
    { 
      key: 'dark' as const, 
      label: 'Dark', 
      icon: Moon,
      shortcut: 'D'
    },
    { 
      key: 'system' as const, 
      label: 'System', 
      icon: Monitor,
      shortcut: 'S'
    },
  ];

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (variant === 'tabs') {
    return (
      <div 
        className={cn(
          "inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1",
          className
        )}
        role="tablist"
        aria-label="Theme selection"
      >
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.key === themeMode;
          
          return (
            <button
              key={option.key}
              onClick={() => setThemeMode(option.key)}
              className={cn(
                "inline-flex items-center justify-center rounded-md transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800",
                sizeClasses[size],
                isSelected
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
              role="tab"
              aria-selected={isSelected}
              aria-label={`${option.label} theme${option.key === 'system' ? ` (currently ${systemPrefersDark ? 'dark' : 'light'})` : ''}`}
              title={`Switch to ${option.label.toLowerCase()} theme (${option.shortcut})`}
              type="button"
            >
              <Icon className={iconSizes[size]} aria-hidden="true" />
              {showLabels && (
                <span className="ml-2 font-medium">
                  {option.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Button variant - cycles through options
  const currentIndex = themeOptions.findIndex(option => option.key === themeMode);
  const currentOption = themeOptions[currentIndex];
  const CurrentIcon = currentOption.icon;

  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % themeOptions.length;
    setThemeMode(themeOptions[nextIndex].key);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-300",
        "glass-card hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900",
        sizeClasses[size],
        className
      )}
      aria-label={`Current theme: ${currentOption.label}. Click to switch to next theme.`}
      title={`Current: ${currentOption.label}${themeMode === 'system' ? ` (${systemPrefersDark ? 'dark' : 'light'})` : ''}. Click to cycle.`}
      type="button"
    >
      <CurrentIcon 
        className={cn(
          iconSizes[size],
          "transition-colors duration-200",
          isDark ? "text-yellow-400" : "text-gray-700"
        )} 
        aria-hidden="true"
      />
      {showLabels && (
        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
          {currentOption.label}
        </span>
      )}
    </button>
  );
};