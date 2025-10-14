/*
  # Create Chatbot Tables for Business Intelligence Hub

  ## Overview
  This migration creates the necessary database infrastructure for the AI-powered chatbot assistant
  that helps users understand and navigate the Business Intelligence Hub application.

  ## New Tables

  ### 1. `chatbot_conversations`
  Stores individual chat conversation sessions for users
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid, nullable) - Associated user ID for authenticated users
  - `session_id` (text) - Browser session identifier for anonymous users
  - `title` (text) - Auto-generated conversation title
  - `context` (jsonb) - Conversation context (current app, page, user preferences)
  - `created_at` (timestamptz) - When conversation started
  - `updated_at` (timestamptz) - Last message timestamp
  - `is_active` (boolean) - Whether conversation is still active

  ### 2. `chatbot_messages`
  Stores individual messages within conversations
  - `id` (uuid, primary key) - Unique message identifier
  - `conversation_id` (uuid, foreign key) - Links to chatbot_conversations
  - `role` (text) - Message role: 'user', 'assistant', or 'system'
  - `content` (text) - Message content
  - `metadata` (jsonb) - Additional metadata (tokens used, response time, etc.)
  - `created_at` (timestamptz) - Message timestamp

  ### 3. `chatbot_knowledge_base`
  Stores structured knowledge about the application for AI context
  - `id` (uuid, primary key) - Unique knowledge entry identifier
  - `category` (text) - Knowledge category (app, feature, navigation, etc.)
  - `key` (text) - Unique identifier for the knowledge item
  - `title` (text) - Human-readable title
  - `content` (text) - Detailed content/description
  - `metadata` (jsonb) - Additional metadata (app_id, related_apps, etc.)
  - `created_at` (timestamptz) - Entry creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `chatbot_usage_analytics`
  Tracks chatbot usage for analytics and optimization
  - `id` (uuid, primary key) - Unique analytics record identifier
  - `conversation_id` (uuid, foreign key) - Links to conversation
  - `user_id` (uuid, nullable) - User who triggered the interaction
  - `session_id` (text) - Browser session identifier
  - `event_type` (text) - Type of event (message_sent, helpful, not_helpful, etc.)
  - `metadata` (jsonb) - Event-specific metadata
  - `created_at` (timestamptz) - Event timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own conversations and messages
  - Knowledge base is readable by all authenticated users
  - Analytics data restricted to system/admin access

  ## Indexes
  - Conversation lookup by user_id and session_id
  - Message retrieval by conversation_id ordered by timestamp
  - Knowledge base search by category and key
  - Analytics queries by conversation and event type
*/

-- Create chatbot_conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text NOT NULL,
  title text DEFAULT 'New Conversation',
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create chatbot_messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create chatbot_knowledge_base table
CREATE TABLE IF NOT EXISTS chatbot_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chatbot_usage_analytics table
CREATE TABLE IF NOT EXISTS chatbot_usage_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  user_id uuid,
  session_id text NOT NULL,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON chatbot_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chatbot_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON chatbot_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_key ON chatbot_knowledge_base(key);

CREATE INDEX IF NOT EXISTS idx_analytics_conversation_id ON chatbot_usage_analytics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON chatbot_usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON chatbot_usage_analytics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chatbot_conversations
CREATE POLICY "Users can view own conversations"
  ON chatbot_conversations FOR SELECT
  USING (
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create conversations"
  ON chatbot_conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own conversations"
  ON chatbot_conversations FOR UPDATE
  USING (
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR user_id = auth.uid()
  );

-- RLS Policies for chatbot_messages
CREATE POLICY "Users can view messages from own conversations"
  ON chatbot_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND (
        chatbot_conversations.session_id = current_setting('request.headers', true)::json->>'x-session-id'
        OR chatbot_conversations.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON chatbot_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND (
        chatbot_conversations.session_id = current_setting('request.headers', true)::json->>'x-session-id'
        OR chatbot_conversations.user_id = auth.uid()
      )
    )
  );

-- RLS Policies for chatbot_knowledge_base (public read access)
CREATE POLICY "Anyone can read knowledge base"
  ON chatbot_knowledge_base FOR SELECT
  USING (true);

-- RLS Policies for chatbot_usage_analytics
CREATE POLICY "Users can create analytics events"
  ON chatbot_usage_analytics FOR INSERT
  WITH CHECK (true);

-- Function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chatbot_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update conversation timestamp on new message
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON chatbot_messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON chatbot_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();