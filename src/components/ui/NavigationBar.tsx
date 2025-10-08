import React from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Users, Target, Calendar, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { Tooltip } from './Tooltip';
import { tooltipContent } from '../../data/tooltipContent';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  tooltip?: keyof typeof tooltipContent.navigation;
}

const navigationItems: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: Home,
    description: 'AI Analytics Hub',
    tooltip: 'dashboard'
  },
  {
    path: '/app/pipeline-intelligence',
    label: 'Pipeline',
    icon: BarChart3,
    description: 'Pipeline Intelligence',
    tooltip: 'pipeline'
  },
  {
    path: '/app/activity-analytics',
    label: 'Activity',
    icon: Users,
    description: 'Activity Analytics',
    tooltip: 'activity'
  },
  {
    path: '/app/smart-followups',
    label: 'Tasks',
    icon: Target,
    description: 'Smart Follow-ups',
    tooltip: 'tasks'
  },
  {
    path: '/app/performance-reports',
    label: 'Reports',
    icon: Calendar,
    description: 'Performance Reports',
    tooltip: 'reports'
  }
];

interface NavigationBarProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
  showLabels?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  className,
  variant = 'horizontal',
  showLabels = true
}) => {
  const location = useLocation();
  const { isDark } = useTheme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  if (variant === 'vertical') {
    return (
      <nav className={cn(
       "flex items-center gap-1 p-2 bg-gray-50/95 dark:bg-gray-800/80 backdrop-blur-md",
      "border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm",
        "min-h-screen w-64",
        className
      )}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Analytics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Navigation
          </p>
        </div>
        
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                isActive && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
              )} />
              <div className="flex-1">
                <p className={cn(
                  "font-medium",
                  isActive ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                )}>
                  {item.label}
                </p>
                {item.description && (
                  <p className={cn(
                    "text-xs",
                    isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {item.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="relative">
      <nav className={cn(
        "navigation-bar flex items-center gap-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActiveRoute(item.path);
        const tooltipText = item.tooltip ? tooltipContent.navigation[item.tooltip] : item.description;

        return (
          <Tooltip content={tooltipText || ''} position="bottom" key={item.path}>
            <Link
              to={item.path}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400",
                isActive && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              )}
              title={item.description}
              style={{
                color: isDark ? (isActive ? '#60a5fa' : '#ffffff') : (isActive ? '#2563eb' : '#111827')
              }}
            >
              <Icon className={cn(
                "w-4 h-4",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
              )}
              style={{
                color: isDark ? (isActive ? '#60a5fa' : '#ffffff') : (isActive ? '#2563eb' : '#111827'),
                stroke: 'currentColor',
                fill: 'none',
                strokeWidth: 2
              }}
              />
              {showLabels && (
                <span className={cn(
                  "text-sm font-medium",
                  isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          </Tooltip>
        );
      })}
      </nav>
    </div>
  );
};