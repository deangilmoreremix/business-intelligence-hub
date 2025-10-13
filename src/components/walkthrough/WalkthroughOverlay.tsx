import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface WalkthroughOverlayProps {
  targetElement?: string;
  highlightPadding?: number;
  children: React.ReactNode;
  isActive: boolean;
}

export const WalkthroughOverlay: React.FC<WalkthroughOverlayProps> = ({
  targetElement,
  highlightPadding = 8,
  children,
  isActive
}) => {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const { isDark } = useTheme();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!targetElement || !isActive) {
      setHighlightRect(null);
      return;
    }

    const updateHighlight = () => {
      const element = document.querySelector(targetElement);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      }
    };

    updateHighlight();

    const handleResize = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateHighlight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetElement, isActive]);

  if (!isActive) return null;

  const overlayContent = (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - highlightPadding}
                y={highlightRect.top - highlightPadding}
                width={highlightRect.width + highlightPadding * 2}
                height={highlightRect.height + highlightPadding * 2}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)'}
          mask="url(#spotlight-mask)"
          className="transition-all duration-300"
        />
        {highlightRect && (
          <>
            <rect
              x={highlightRect.left - highlightPadding}
              y={highlightRect.top - highlightPadding}
              width={highlightRect.width + highlightPadding * 2}
              height={highlightRect.height + highlightPadding * 2}
              rx="8"
              fill="none"
              stroke={isDark ? '#60a5fa' : '#3b82f6'}
              strokeWidth="2"
              className="animate-pulse"
            />
            <rect
              x={highlightRect.left - highlightPadding - 4}
              y={highlightRect.top - highlightPadding - 4}
              width={highlightRect.width + highlightPadding * 2 + 8}
              height={highlightRect.height + highlightPadding * 2 + 8}
              rx="10"
              fill="none"
              stroke={isDark ? '#60a5fa' : '#3b82f6'}
              strokeWidth="1"
              opacity="0.5"
            />
          </>
        )}
      </svg>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {children}
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
};
