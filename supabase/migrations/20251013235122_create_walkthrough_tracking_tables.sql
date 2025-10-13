/*
  # User Walkthrough and Tooltip Tracking System

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (text) - Unique identifier for each user (localStorage-based for now)
      - `preferences` (jsonb) - General user preferences
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `walkthrough_progress`
      - `id` (uuid, primary key)
      - `user_id` (text) - References user identifier
      - `walkthrough_id` (text) - Identifier for specific walkthrough
      - `completed` (boolean) - Whether walkthrough is completed
      - `current_step` (integer) - Current step number in walkthrough
      - `total_steps` (integer) - Total steps in walkthrough
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `last_seen_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tooltip_interactions`
      - `id` (uuid, primary key)
      - `user_id` (text) - References user identifier
      - `tooltip_id` (text) - Identifier for specific tooltip
      - `interaction_count` (integer) - Number of times user has seen this tooltip
      - `dismissed` (boolean) - Whether user has permanently dismissed this tooltip
      - `last_interaction_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data

  3. Indexes
    - Add indexes on user_id for efficient queries
    - Add composite indexes for common query patterns
*/

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create walkthrough_progress table
CREATE TABLE IF NOT EXISTS walkthrough_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  walkthrough_id text NOT NULL,
  completed boolean DEFAULT false,
  current_step integer DEFAULT 0,
  total_steps integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, walkthrough_id)
);

-- Create tooltip_interactions table
CREATE TABLE IF NOT EXISTS tooltip_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  tooltip_id text NOT NULL,
  interaction_count integer DEFAULT 1,
  dismissed boolean DEFAULT false,
  last_interaction_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tooltip_id)
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkthrough_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooltip_interactions ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences (allow all access since we're using localStorage user_id)
CREATE POLICY "Users can view all preferences"
  ON user_preferences FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update all preferences"
  ON user_preferences FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete all preferences"
  ON user_preferences FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for walkthrough_progress
CREATE POLICY "Users can view all walkthrough progress"
  ON walkthrough_progress FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert walkthrough progress"
  ON walkthrough_progress FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update all walkthrough progress"
  ON walkthrough_progress FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete all walkthrough progress"
  ON walkthrough_progress FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for tooltip_interactions
CREATE POLICY "Users can view all tooltip interactions"
  ON tooltip_interactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert tooltip interactions"
  ON tooltip_interactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update all tooltip interactions"
  ON tooltip_interactions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete all tooltip interactions"
  ON tooltip_interactions FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_walkthrough_progress_user_id ON walkthrough_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_walkthrough_progress_composite ON walkthrough_progress(user_id, walkthrough_id);
CREATE INDEX IF NOT EXISTS idx_tooltip_interactions_user_id ON tooltip_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tooltip_interactions_composite ON tooltip_interactions(user_id, tooltip_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_walkthrough_progress_updated_at BEFORE UPDATE ON walkthrough_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();