import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { useChatStore } from '../../store/chatStore';
import { chatbotService, ChatMessage } from '../../services/chatbotService';
import { useLocation } from 'react-router-dom';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatSuggestions } from './ChatSuggestions';

export const ChatWidget: React.FC = () => {
  const { isDark } = useTheme();
  const location = useLocation();
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    error,
    suggestions,
    currentConversationId,
    closeChat,
    minimizeChat,
    maximizeChat,
    addMessage,
    setLoading,
    setError,
    handleResponse
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      const currentApp = location.pathname.split('/').pop();
      const context = {
        currentRoute: location.pathname,
        currentApp: currentApp !== '' ? currentApp : undefined
      };

      const { response, conversationId, messageId } = await chatbotService.sendMessage(
        currentConversationId,
        message,
        context
      );

      handleResponse(response, conversationId, messageId);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div
        className={cn(
          'fixed bottom-4 right-4 z-[9998]',
          'w-80 rounded-t-2xl shadow-2xl overflow-hidden',
          'transition-all duration-300 ease-in-out',
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between p-4 cursor-pointer',
            isDark ? 'bg-gray-900/50' : 'bg-gray-50'
          )}
          onClick={maximizeChat}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                AI Assistant
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click to expand
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeChat();
            }}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[9998]',
        'w-[450px] h-[600px] rounded-2xl shadow-2xl',
        'flex flex-col overflow-hidden',
        'transition-all duration-300 ease-in-out',
        isDark
          ? 'bg-gray-800/95 backdrop-blur-xl border border-gray-700'
          : 'bg-white/95 backdrop-blur-xl border border-gray-200'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between p-4 border-b',
          isDark
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-gray-700'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 border-gray-200'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-white/80">Ask me anything about the platform</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={minimizeChat}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={closeChat}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to AI Assistant!
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              I'm here to help you navigate the Business Intelligence Hub. Ask me anything!
            </p>
            <ChatSuggestions
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        )}

        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && suggestions.length > 0 && (
        <div className="px-4 pb-2">
          <ChatSuggestions
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            compact
          />
        </div>
      )}

      <div
        className={cn(
          'p-4 border-t',
          isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
        )}
      >
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg resize-none',
              'border-2 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
            )}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              'px-4 py-3 rounded-lg font-medium transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'flex items-center gap-2'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
