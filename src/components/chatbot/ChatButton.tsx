import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { useChatStore } from '../../store/chatStore';

export const ChatButton: React.FC = () => {
  useTheme();
  const { isOpen, unreadCount, toggleChat } = useChatStore();

  return (
    <button
      onClick={toggleChat}
      className={cn(
        'fixed bottom-6 right-6 z-[9997]',
        'w-14 h-14 rounded-full shadow-2xl',
        'flex items-center justify-center',
        'transition-all duration-300 ease-in-out',
        'hover:scale-110 active:scale-95',
        'bg-gradient-to-br from-blue-500 to-blue-600',
        'hover:from-blue-600 hover:to-blue-700',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
        isOpen && 'rotate-0'
      )}
      title={isOpen ? 'Close Chat' : 'Open AI Assistant'}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <>
          <MessageCircle className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </>
      )}

      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'animate-ping opacity-20',
          'bg-blue-500',
          isOpen && 'hidden'
        )}
      />
    </button>
  );
};
