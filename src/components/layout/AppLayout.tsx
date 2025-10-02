import React from 'react';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6', 
  xl: 'p-8'
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className,
  maxWidth = '7xl',
  padding = 'lg'
}) => {
  return (
    <div className={cn(
      'min-h-screen',
      paddingClasses[padding],
      className
    )}>
      <div className={cn('mx-auto', maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  );
};