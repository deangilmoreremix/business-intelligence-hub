/*
  # Create app_content table for data persistence

  1. New Tables
    - `app_content`
      - `id` (uuid, primary key) - Unique identifier for each content record
      - `key` (text, unique) - Content identifier/key for lookups
      - `value` (jsonb) - Flexible JSON storage for any content data
      - `user_id` (uuid, nullable) - References auth.users for user-specific content
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last modification timestamp

  2. Security
    - Enable RLS on `app_content` table
    - Allow read access for all users
    - Allow insert for authenticated users only
    - Allow update/delete for authenticated users on their own content

  3. Features
    - Automatic updated_at timestamp trigger
    - Foreign key constraint to auth.users
    - Optimized indexes for key-based lookups
*/

-- Create the app_content table
CREATE TABLE IF NOT EXISTS public.app_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.app_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.app_content
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.app_content
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users on their own content" ON public.app_content
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users on their own content" ON public.app_content
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_app_content_updated_at
BEFORE UPDATE ON public.app_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_app_content_key ON public.app_content (key);
CREATE INDEX IF NOT EXISTS idx_app_content_user_id ON public.app_content (user_id);
CREATE INDEX IF NOT EXISTS idx_app_content_created_at ON public.app_content (created_at);