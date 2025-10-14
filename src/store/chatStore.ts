import { create } from 'zustand';
import { ChatMessage, ChatConversation, ChatbotResponse } from '../services/chatbotService';

interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  currentConversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  unreadCount: number;

  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;

  setCurrentConversation: (conversationId: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;

  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSuggestions: (suggestions: string[]) => void;

  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;

  handleResponse: (response: ChatbotResponse, conversationId: string, messageId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  isMinimized: false,
  currentConversationId: null,
  messages: [],
  isLoading: false,
  error: null,
  suggestions: [
    'What can this platform do?',
    'Show me pipeline analytics',
    'How do I get started?'
  ],
  unreadCount: 0,

  openChat: () => set({ isOpen: true, isMinimized: false, unreadCount: 0 }),

  closeChat: () => set({ isOpen: false, isMinimized: false }),

  toggleChat: () => {
    const { isOpen } = get();
    if (isOpen) {
      set({ isOpen: false, isMinimized: false });
    } else {
      set({ isOpen: true, isMinimized: false, unreadCount: 0 });
    }
  },

  minimizeChat: () => set({ isMinimized: true }),

  maximizeChat: () => set({ isMinimized: false }),

  setCurrentConversation: (conversationId) => set({ currentConversationId: conversationId }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [], currentConversationId: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setSuggestions: (suggestions) => set({ suggestions }),

  incrementUnreadCount: () => set((state) => ({
    unreadCount: state.isOpen ? state.unreadCount : state.unreadCount + 1
  })),

  resetUnreadCount: () => set({ unreadCount: 0 }),

  handleResponse: (response, conversationId, messageId) => {
    const { isOpen } = get();

    const assistantMessage: ChatMessage = {
      id: messageId,
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      metadata: {
        relatedApps: response.relatedApps
      }
    };

    set((state) => ({
      messages: [...state.messages, assistantMessage],
      currentConversationId: conversationId,
      suggestions: response.suggestions || state.suggestions,
      isLoading: false,
      unreadCount: isOpen ? 0 : state.unreadCount + 1
    }));
  }
}));
