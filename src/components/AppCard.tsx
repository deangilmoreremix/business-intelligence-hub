import React from 'react';
import { DivideIcon as LucideIcon, Star } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { cn } from '../lib/utils';
import { Tooltip } from './ui/Tooltip';
import { tooltipContent } from '../data/tooltipContent';

interface AppCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  appId?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  title,
  description,
  icon: Icon,
  category,
  onClick,
  isFavorite = false,
  onToggleFavorite,
  appId
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };

  const getTooltipContent = () => {
    if (appId && appId in tooltipContent.aiApps) {
      return tooltipContent.aiApps[appId as keyof typeof tooltipContent.aiApps];
    }
    return description;
  };

  return (
    <Tooltip content={getTooltipContent()} position="top" maxWidth="350px">
      <GlassCard
        onClick={onClick}
        className={cn(
          "animate-slide-in cursor-pointer",
          "hover:border-blue-200 dark:hover:border-blue-700",
          "group"
        )}
      >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-lg flex-shrink-0 transition-all duration-200",
          "bg-blue-100 dark:bg-blue-900/50",
          "group-hover:bg-blue-200 dark:group-hover:bg-blue-900/70"
        )}>
          <Icon className="w-6 h-6 text-blue-800 dark:text-blue-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              {category}
            </span>
            {onToggleFavorite && (
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  "p-1 rounded transition-colors",
                  isFavorite 
                    ? "text-yellow-500 hover:text-yellow-600" 
                    : "text-gray-400 hover:text-yellow-500"
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
      </GlassCard>
    </Tooltip>
  );
};