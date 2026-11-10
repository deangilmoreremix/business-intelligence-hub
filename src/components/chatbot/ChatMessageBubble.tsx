import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatMessage } from '../../services/chatbotService';
import { useNavigate } from 'react-router-dom';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const isUser = message.role === 'user';

  const relatedApps = message.metadata?.relatedApps || [];

  const handleAppClick = (appId: string) => {
    navigate(`/app/${appId}`);
  };

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-blue-600'
            : isDark
            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
            : 'bg-gradient-to-br from-blue-400 to-blue-500'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      <div className={cn('flex-1 max-w-[80%]', isUser && 'flex justify-end')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-blue-600 text-white'
              : isDark
              ? 'bg-gray-700 text-gray-100'
              : 'bg-gray-100 text-gray-900'
          )}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {!isUser && relatedApps.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-600/30 dark:border-gray-500/30">
              <p className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400">
                Related Apps:
              </p>
              <div className="space-y-1.5">
                {relatedApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-colors',
                      isDark
                        ? 'bg-gray-600/50 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    )}
                  >
                    <div className="font-medium">{app.title}</div>
                    <div className="text-gray-500 dark:text-gray-400 line-clamp-1">
                      {app.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={cn(
              'text-xs mt-2',
              isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
