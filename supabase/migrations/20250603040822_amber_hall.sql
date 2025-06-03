/*
  # Add version control for prompts

  1. New Tables
    - `prompt_versions` - Stores version history for prompts
      - `id` (uuid, primary key)
      - `prompt_id` (uuid, references prompts)
      - `version_number` (integer)
      - `content` (jsonb)
      - `description` (text)
      - `notes` (text, optional)
      - `diff` (jsonb)
      - `created_by` (uuid)
      - `created_at` (timestamp)
      - `restored_from_version` (integer, optional)

  2. Security
    - Enable RLS on `prompt_versions` table
    - Add policies for version management
*/

-- Create prompt versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content jsonb NOT NULL,
  description text NOT NULL,
  notes text,
  diff jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  restored_from_version integer,
  UNIQUE(prompt_id, version_number)
);

-- Create indexes
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_prompt_id_version ON prompt_versions(prompt_id, version_number);

-- Enable RLS
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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