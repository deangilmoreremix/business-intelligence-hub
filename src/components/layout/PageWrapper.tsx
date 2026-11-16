import React, { useState } from 'react';
import { ArrowLeft, Move } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MovableSections } from '../movable/MovableSections';
import { savePref } from '../../lib/prefs';
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
  const { pathname } = useLocation();
  const [arranging, setArranging] = useState(false);
  const resetLayout = () => { void savePref(`page-sections:${pathname}`, []).then(() => window.location.reload()); };
  
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
          <div className="flex gap-3 items-center">
            {headerActions}
            <button type="button" onClick={() => setArranging(a => !a)} aria-pressed={arranging} title="Rearrange the sections of this page" data-testid="arrange-toggle"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Move className="w-4 h-4" />{arranging ? 'Done' : 'Arrange'}
            </button>
            {arranging && <button type="button" onClick={resetLayout} data-testid="arrange-reset" className="px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Reset</button>}
          </div>
        </div>

        {/* Content */}
        <div className={cn("pb-8", contentClassName)}>
          <MovableSections pageKey={pathname} arranging={arranging}>{children}</MovableSections>
        </div>
      </div>
    </div>
  );
};