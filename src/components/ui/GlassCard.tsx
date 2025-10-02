import React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hover = true
}) => {
  return (
    <div
      className={cn(
        'glass-card rounded-xl p-6',
        'bg-white/80 dark:bg-gray-800/80',
        'border border-white/20 dark:border-gray-700/50',
        'backdrop-blur-md shadow-lg',
        hover && 'hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 dark:hover:bg-gray-800/90',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}