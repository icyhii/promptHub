/*
  # Version Control System Implementation

  1. New Tables
    - `prompt_versions`
      - `id` (uuid, primary key)
      - `prompt_id` (uuid, references prompts)
      - `version_number` (integer)
      - `content` (jsonb) - stores complete prompt state
      - `diff` (jsonb) - stores changes from previous version
      - `description` (text) - brief version description
      - `notes` (text) - detailed version notes
      - `tags` (text[]) - version tags/labels
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `restored_from_version` (integer) - tracks version restoration
      
  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create prompt_versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content jsonb NOT NULL,
  diff jsonb,
  description text NOT NULL,
  notes text,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  restored_from_version integer,
  UNIQUE(prompt_id, version_number)
);

-- Create index for faster version lookups
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id_version ON prompt_versions(prompt_id, version_number);

-- Enable RLS
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

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
          WHERE tm.user_id = auth.uid()
          AND EXISTS (
            SELECT 1 FROM projects proj
            WHERE proj.team_id = tm.team_id
            AND proj.id = p.id
          )
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

-- Function to get next version number
CREATE OR REPLACE FUNCTION get_next_version_number(p_prompt_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT MAX(version_number) + 1
      FROM prompt_versions
      WHERE prompt_id = p_prompt_id
    ),
    1
  );
END;
$$;