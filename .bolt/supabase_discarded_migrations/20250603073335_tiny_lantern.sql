/*
  # Prompt Versioning System

  1. Tables
    - prompt_versions: stores version history for prompts
      - version_number: sequential version identifier
      - content: versioned prompt content
      - description: version change description
      - notes: additional version notes
      - diff: changes from previous version
      - restored_from_version: tracks version restoration

  2. Security
    - RLS enabled for version control
    - Creator-based access control
    - Public prompt version visibility
*/

-- Create prompt versions table if not exists
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

-- Create indexes safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_prompt_versions_prompt_id') THEN
    CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_prompt_versions_prompt_id_version') THEN
    CREATE INDEX idx_prompt_versions_prompt_id_version ON prompt_versions(prompt_id, version_number);
  END IF;
END$$;

-- Enable RLS
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can create versions for their prompts" ON prompt_versions;
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

  DROP POLICY IF EXISTS "Users can view versions of accessible prompts" ON prompt_versions;
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
END$$;