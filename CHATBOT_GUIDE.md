# AI Chatbot Assistant - User Guide

## Overview

The Business Intelligence Hub now includes an intelligent AI-powered chatbot assistant that helps users navigate, understand, and make the most of the platform's 35 specialized applications.

## Features

### Core Capabilities
- **Conversational AI**: Powered by OpenAI GPT-4, the chatbot understands natural language queries
- **Context-Aware**: Knows which app you're currently viewing and provides relevant assistance
- **Knowledge Base**: Has comprehensive knowledge about all 35 applications, features, and capabilities
- **Smart Suggestions**: Provides suggested questions and related apps based on your queries
- **Persistent Conversations**: Chat history is saved and can be resumed across sessions

### UI Features
- **Floating Chat Button**: Always accessible from any page with a pulse animation
- **Expandable Chat Window**: Modern glass-morphism design with minimize/maximize controls
- **Message Bubbles**: Clear distinction between user and AI messages
- **Related Apps**: AI can suggest relevant applications with direct navigation links
- **Quick Suggestions**: Pre-defined questions to get you started quickly
- **Typing Indicators**: Visual feedback while AI is thinking
- **Unread Badge**: Shows unread message count when chat is closed
- **Dark/Light Mode**: Automatically adapts to your theme preference

## How to Use

### Opening the Chat
1. Click the blue floating chat button in the bottom-right corner
2. The chat window will expand with a welcome message
3. You'll see suggested questions to get started

### Asking Questions
- Type your question in the input field at the bottom
- Press Enter to send (Shift+Enter for new line)
- The AI will respond with helpful information
- Related apps will be shown when relevant

### Example Questions
- "What can this platform do?"
- "Show me pipeline analytics apps"
- "How do I track deal risks?"
- "What are the communication tools available?"
- "Help me get started with the platform"
- "Explain the AI Sales Forecast app"
- "How do I navigate to different categories?"

### Navigating to Apps
When the AI suggests related apps:
- Click on any app card in the response
- You'll be automatically navigated to that app
- The chat window will minimize automatically

### Managing Chat
- **Minimize**: Click the minus icon to collapse the chat
- **Close**: Click the X icon to close completely
- **Reopen**: Click the floating button again to resume

## Technical Details

### Database Tables
The chatbot uses the following Supabase tables:
- `chatbot_conversations`: Stores chat sessions
- `chatbot_messages`: Individual messages within conversations
- `chatbot_knowledge_base`: Application knowledge and documentation
- `chatbot_usage_analytics`: Usage tracking and analytics

### Knowledge Coverage
The chatbot has knowledge about:
- All 35 applications (descriptions, use cases, features)
- 5 main categories (Pipeline, Communication, Tasks, Integration, Analytics)
- Dashboard features and navigation
- Guided tours and walkthroughs
- Data persistence and syncing
- Best practices and tips
- Common troubleshooting issues

### Privacy & Security
- Conversations are linked to your browser session
- Row Level Security (RLS) ensures data privacy
- Only you can access your chat history
- AI responses are generated via OpenAI's secure API

### API Configuration
The chatbot uses OpenAI's **Responses API** with the GPT-4 model (configurable).

Configuration in your `.env` file:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4o  # Optional: defaults to gpt-4o
```

**Why Responses API?**
- Modern OpenAI API for production use
- Better structured outputs and response handling
- Improved error handling and rate limit management
- Future-ready for GPT-5 and advanced features
- Supports streaming (ready for future implementation)

If the API key is not configured, the chatbot will show a friendly error message.

## Tips for Best Results

1. **Be Specific**: Ask about specific features or apps for more targeted help
2. **Use Context**: The AI knows which page you're on - leverage that
3. **Explore Suggestions**: Try the suggested questions to discover features
4. **Follow Links**: Click on related apps to explore them directly
5. **Start Tours**: Ask about guided tours if you're new to the platform

## Features Coming Soon

- Export chat history
- Voice input support
- Multi-language support
- Advanced analytics dashboard for chat insights
- Integration with other AI models (Gemini, Claude)

## Support

If you encounter any issues with the chatbot:
1. Check that your OpenAI API key is properly configured
2. Ensure you have a stable internet connection
3. Try refreshing the page to reset the chat
4. Check the browser console for any error messages

---

**Note**: The AI assistant is designed to help you navigate and understand the platform. For complex technical issues or custom implementations, please refer to the main documentation or contact support.
