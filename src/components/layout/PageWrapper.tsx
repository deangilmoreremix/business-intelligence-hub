import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModernButton } from '../ui/ModernButton';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface PageWrapperProps {
  title: string;
  description: string;
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  // Optional theme for specific apps  
  appTheme?: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'indigo' | 'teal' | 'cyan' | 'emerald';
  // Optional header actions (buttons, dropdowns, etc.)
  headerActions?: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  description,
  onBack,
  children,
  className,
  headerClassName,
  contentClassName,
  headerActions
}) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };
  
  const getThemeBackground = () => {
    if (isDark) {
      return 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900';
    }
    
    // Light mode always uses clean white background
    return 'bg-white';
  };

  return (
    <div className={cn(`min-h-screen p-6 transition-colors duration-300`, getThemeBackground(), className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={cn("flex items-center gap-4 mb-8", headerClassName)}>
          <ModernButton variant="ghost" onClick={handleBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </ModernButton>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{description}</p>
          </div>
          {/* Header Actions */}
          {headerActions && (
            <div className="flex gap-3">
              {headerActions}
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn("pb-8", contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
};