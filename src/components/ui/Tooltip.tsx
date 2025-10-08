import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  maxWidth?: string;
  className?: string;
  showArrow?: boolean;
  interactive?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  disabled = false,
  maxWidth = '250px',
  className,
  showArrow = true,
  interactive = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsMounted(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsVisible(false);
    setTimeout(() => {
      setIsMounted(false);
    }, 150);
  };

  const handleMouseEnter = () => {
    showTooltip();
  };

  const handleMouseLeave = () => {
    if (!interactive) {
      hideTooltip();
    }
  };

  const handleTooltipMouseEnter = () => {
    if (interactive) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleTooltipMouseLeave = () => {
    if (interactive) {
      hideTooltip();
    }
  };

  const getPositionClasses = () => {
    const positions = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };
    return positions[position];
  };

  const getArrowClasses = () => {
    const arrows = {
      top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
      left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
      right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
    };
    return arrows[position];
  };

  const clonedChildren = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      children.props.onBlur?.(e);
    }
  });

  if (disabled || !content) {
    return children;
  }

  return (
    <div className="relative inline-flex">
      {clonedChildren}
      {isMounted && (
        <div
          ref={tooltipRef}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          className={cn(
            'absolute z-[100] px-3 py-2 text-sm font-medium rounded-lg shadow-lg',
            'transition-all duration-150 pointer-events-none',
            interactive && 'pointer-events-auto',
            isDark
              ? 'bg-gray-800 text-white border border-gray-700'
              : 'bg-gray-900 text-white border border-gray-800',
            getPositionClasses(),
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            className
          )}
          style={{ maxWidth }}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {content}
          {showArrow && (
            <div
              className={cn(
                'absolute w-0 h-0',
                'border-4',
                isDark ? 'border-gray-800' : 'border-gray-900',
                getArrowClasses()
              )}
            />
          )}
        </div>
      )}
    </div>
  );
};
