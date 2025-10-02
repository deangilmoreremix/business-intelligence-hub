import React from 'react';
import { cn } from '../../lib/utils';
import { GlassCard } from './GlassCard';

interface SectionProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'glass' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6', 
  lg: 'p-8'
};

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  icon,
  children,
  className,
  headerClassName,
  contentClassName,
  variant = 'glass',
  size = 'md'
}) => {
  const headerContent = (title || description || icon) && (
    <div className={cn("flex items-center gap-3 mb-6", headerClassName)}>
      {icon && (
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
      )}
      {(title || description) && (
        <div>
          {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
    </div>
  );

  const content = (
    <>
      {headerContent}
      <div className={contentClassName}>
        {children}
      </div>
    </>
  );

  if (variant === 'glass') {
    return (
      <GlassCard className={cn(sizeClasses[size], className)}>
        {content}
      </GlassCard>
    );
  }

  if (variant === 'bordered') {
    return (
      <div className={cn(
        'border border-gray-200 rounded-lg bg-white',
        sizeClasses[size],
        className
      )}>
        {content}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn(sizeClasses[size], className)}>
      {content}
    </div>
  );
};