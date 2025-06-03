/*
  # Analytics System Tables

  1. New Tables
    - `prompt_analytics` - Stores aggregated analytics data
      - `id` (uuid, primary key)
      - `prompt_id` (uuid, references prompts)
      - `views` (integer)
      - `unique_users` (integer)
      - `likes` (integer)
      - `shares` (integer)
      - `comments` (integer)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_engagement` - Tracks individual user interactions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `prompt_id` (uuid, references prompts)
      - `action_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
*/

-- Create prompt analytics table
CREATE TABLE IF NOT EXISTS prompt_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  unique_users integer DEFAULT 0,
  likes integer DEFAULT 0,
  shares integer DEFAULT 0,
  comments integer DEFAULT 0,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(prompt_id, date)
);

-- Create user engagement table
CREATE TABLE IF NOT EXISTS user_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prompt_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_prompt_analytics_prompt_id ON prompt_analytics(prompt_id);
CREATE INDEX idx_prompt_analytics_date ON prompt_analytics(date);
CREATE INDEX idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX idx_user_engagement_prompt_id ON user_engagement(prompt_id);
CREATE INDEX idx_user_engagement_action_type ON user_engagement(action_type);

-- RLS Policies

-- Prompt Analytics
CREATE POLICY "Users can view analytics for accessible prompts"
  ON prompt_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompts p
      WHERE p.id = prompt_analytics.prompt_id
      AND (
        p.creator_id = auth.uid()
        OR p.visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM team_members tm
          JOIN projects proj ON proj.team_id = tm.team_id
          WHERE tm.user_id = auth.uid()
          AND proj.id = p.id
        )
      )
    )
  );

-- User Engagement
CREATE POLICY "Users can view engagement data for accessible prompts"
  ON user_engagement
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompts p
      WHERE p.id = user_engagement.prompt_id
      AND (
        p.creator_id = auth.uid()
        OR p.visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM team_members tm
          JOIN projects proj ON proj.team_id = tm.team_id
          WHERE tm.user_id = auth.uid()
          AND proj.id = p.id
        )
      )
    )
  );

-- Function to record user engagement
CREATE OR REPLACE FUNCTION record_engagement(
  p_prompt_id uuid,
  p_action_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert engagement record
  INSERT INTO user_engagement (user_id, prompt_id, action_type)
  VALUES (auth.uid(), p_prompt_id, p_action_type);

  -- Update analytics
  INSERT INTO prompt_analytics (prompt_id, date)
  VALUES (p_prompt_id, CURRENT_DATE)
  ON CONFLICT (prompt_id, date)
  DO UPDATE SET
    views = CASE WHEN p_action_type = 'view' THEN prompt_analytics.views + 1 ELSE prompt_analytics.views END,
    likes = CASE WHEN p_action_type = 'like' THEN prompt_analytics.likes + 1 ELSE prompt_analytics.likes END,
    shares = CASE WHEN p_action_type = 'share' THEN prompt_analytics.shares + 1 ELSE prompt_analytics.shares END,
    comments = CASE WHEN p_action_type = 'comment' THEN prompt_analytics.comments + 1 ELSE prompt_analytics.comments END,
    updated_at = now();
END;
$$;