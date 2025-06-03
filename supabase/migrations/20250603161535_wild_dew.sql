/*
  # Version Control System for Prompts

  1. New Tables
    - prompt_versions: Stores version history with metadata
    - prompt_reviews: Manages review process and feedback
    - prompt_comments: Handles threaded discussions
    - prompt_branches: Tracks different prompt variations
    - prompt_merges: Records merge history and conflicts

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
*/

-- Create enum for review status
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'changes_requested');

-- Create enum for branch type
CREATE TYPE branch_type AS ENUM ('main', 'feature', 'experiment');

-- Prompt Versions Table
CREATE TABLE IF NOT EXISTS prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content text NOT NULL,
  change_log text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  branch_id uuid,
  parent_version_id uuid REFERENCES prompt_versions(id),
  is_latest boolean DEFAULT false,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  UNIQUE(prompt_id, version_number)
);

-- Prompt Branches Table
CREATE TABLE IF NOT EXISTS prompt_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  name text NOT NULL,
  type branch_type DEFAULT 'feature',
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  base_version_id uuid REFERENCES prompt_versions(id),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(prompt_id, name)
);

-- Prompt Reviews Table
CREATE TABLE IF NOT EXISTS prompt_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES prompt_versions(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id),
  status review_status DEFAULT 'pending',
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  quality_score integer CHECK (quality_score BETWEEN 1 AND 5),
  review_metrics jsonb DEFAULT '{}'::jsonb
);

-- Prompt Comments Table
CREATE TABLE IF NOT EXISTS prompt_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES prompt_versions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  parent_comment_id uuid REFERENCES prompt_comments(id),
  selection_start integer,
  selection_end integer,
  resolved boolean DEFAULT false
);

-- Prompt Merges Table
CREATE TABLE IF NOT EXISTS prompt_merges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_branch_id uuid REFERENCES prompt_branches(id) ON DELETE CASCADE,
  target_branch_id uuid REFERENCES prompt_branches(id) ON DELETE CASCADE,
  merged_version_id uuid REFERENCES prompt_versions(id),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  conflict_resolution jsonb DEFAULT '{}'::jsonb,
  merge_strategy text,
  status text DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_merges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view versions of accessible prompts"
  ON prompt_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompts p
      WHERE p.id = prompt_versions.prompt_id
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

CREATE POLICY "Users can create versions for their prompts"
  ON prompt_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompts p
      WHERE p.id = prompt_versions.prompt_id
      AND p.creator_id = auth.uid()
    )
  );

-- Create functions for version control operations
CREATE OR REPLACE FUNCTION create_prompt_branch(
  p_prompt_id uuid,
  p_name text,
  p_type branch_type,
  p_description text
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_branch_id uuid;
  v_base_version_id uuid;
BEGIN
  -- Get the latest version from main branch
  SELECT id INTO v_base_version_id
  FROM prompt_versions
  WHERE prompt_id = p_prompt_id
  AND is_latest = true
  ORDER BY version_number DESC
  LIMIT 1;

  -- Create new branch
  INSERT INTO prompt_branches (
    prompt_id,
    name,
    type,
    description,
    created_by,
    base_version_id
  )
  VALUES (
    p_prompt_id,
    p_name,
    p_type,
    p_description,
    auth.uid(),
    v_base_version_id
  )
  RETURNING id INTO v_branch_id;

  RETURN v_branch_id;
END;
$$;

-- Function to merge branches
CREATE OR REPLACE FUNCTION merge_prompt_branches(
  p_source_branch_id uuid,
  p_target_branch_id uuid,
  p_strategy text DEFAULT 'auto'
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_merge_id uuid;
  v_merged_version_id uuid;
BEGIN
  -- Create merge record
  INSERT INTO prompt_merges (
    source_branch_id,
    target_branch_id,
    created_by,
    merge_strategy,
    status
  )
  VALUES (
    p_source_branch_id,
    p_target_branch_id,
    auth.uid(),
    p_strategy,
    'pending'
  )
  RETURNING id INTO v_merge_id;

  -- Additional merge logic would go here
  -- For now, we'll just return the merge ID
  RETURN v_merge_id;
END;
$$;

-- Indexes for better performance
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_branch_id ON prompt_versions(branch_id);
CREATE INDEX idx_prompt_branches_prompt_id ON prompt_branches(prompt_id);
CREATE INDEX idx_prompt_reviews_version_id ON prompt_reviews(version_id);
CREATE INDEX idx_prompt_comments_version_id ON prompt_comments(version_id);
CREATE INDEX idx_prompt_comments_parent_id ON prompt_comments(parent_comment_id);