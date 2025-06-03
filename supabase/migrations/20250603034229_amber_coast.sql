/*
  # Add search functionality and prompt forking

  1. New Tables
    - `prompt_forks`: Tracks relationships between original and forked prompts
    - `prompt_search_index`: Stores searchable content and metadata
  
  2. Changes
    - Add full-text search capabilities to prompts table
    - Add fork-related columns to prompts table
    
  3. Functions
    - Add functions for forking prompts and updating search index
*/

-- Enable full text search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add forking columns to prompts table
ALTER TABLE prompts 
  ADD COLUMN IF NOT EXISTS forked_from uuid REFERENCES prompts(id),
  ADD COLUMN IF NOT EXISTS fork_version integer DEFAULT 1;

-- Create prompt forks table
CREATE TABLE IF NOT EXISTS prompt_forks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  forked_prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  fork_date timestamptz DEFAULT now(),
  UNIQUE(original_prompt_id, forked_prompt_id)
);

-- Create search index table
CREATE TABLE IF NOT EXISTS prompt_search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  search_vector tsvector,
  category text,
  complexity_score integer,
  last_indexed timestamptz DEFAULT now(),
  UNIQUE(prompt_id)
);

-- Create indexes
CREATE INDEX idx_prompt_forks_original ON prompt_forks(original_prompt_id);
CREATE INDEX idx_prompt_forks_forked ON prompt_forks(forked_prompt_id);
CREATE INDEX idx_prompt_search_vector ON prompt_search_index USING gin(search_vector);
CREATE INDEX idx_prompt_category ON prompt_search_index(category);
CREATE INDEX idx_prompt_complexity ON prompt_search_index(complexity_score);

-- Enable RLS
ALTER TABLE prompt_forks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_search_index ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view fork relationships for accessible prompts"
  ON prompt_forks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompts p
      WHERE (p.id = prompt_forks.original_prompt_id OR p.id = prompt_forks.forked_prompt_id)
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

-- Function to fork a prompt
CREATE OR REPLACE FUNCTION fork_prompt(
  original_prompt_id uuid,
  new_title text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_prompt_id uuid;
  original_prompt prompts%ROWTYPE;
BEGIN
  -- Get original prompt
  SELECT * INTO original_prompt FROM prompts WHERE id = original_prompt_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prompt not found';
  END IF;

  -- Create forked prompt
  INSERT INTO prompts (
    title,
    body,
    tags,
    metadata,
    creator_id,
    status,
    visibility,
    forked_from,
    fork_version
  )
  VALUES (
    COALESCE(new_title, original_prompt.title || ' (Fork)'),
    original_prompt.body,
    original_prompt.tags,
    original_prompt.metadata,
    auth.uid(),
    'draft',
    'private',
    original_prompt_id,
    COALESCE(
      (SELECT MAX(fork_version) + 1
       FROM prompts
       WHERE forked_from = original_prompt_id),
      1
    )
  )
  RETURNING id INTO new_prompt_id;

  -- Record fork relationship
  INSERT INTO prompt_forks (original_prompt_id, forked_prompt_id)
  VALUES (original_prompt_id, new_prompt_id);

  -- Update search index
  INSERT INTO prompt_search_index (
    prompt_id,
    search_vector,
    category,
    complexity_score
  )
  SELECT
    new_prompt_id,
    search_vector,
    category,
    complexity_score
  FROM prompt_search_index
  WHERE prompt_id = original_prompt_id;

  RETURN new_prompt_id;
END;
$$;

-- Function to update search index
CREATE OR REPLACE FUNCTION update_prompt_search_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO prompt_search_index (
    prompt_id,
    search_vector,
    category,
    complexity_score
  ) VALUES (
    NEW.id,
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, ARRAY[]::text[]), ' ')), 'C'),
    COALESCE((NEW.metadata->>'category')::text, 'uncategorized'),
    COALESCE((NEW.metadata->>'complexity')::integer, 1)
  )
  ON CONFLICT (prompt_id) DO UPDATE SET
    search_vector = EXCLUDED.search_vector,
    category = EXCLUDED.category,
    complexity_score = EXCLUDED.complexity_score,
    last_indexed = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger for search index updates
CREATE TRIGGER prompt_search_update
  AFTER INSERT OR UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_search_index();

-- Function to search prompts
CREATE OR REPLACE FUNCTION search_prompts(
  search_query text DEFAULT NULL,
  categories text[] DEFAULT NULL,
  min_date date DEFAULT NULL,
  max_date date DEFAULT NULL,
  models text[] DEFAULT NULL,
  min_complexity int DEFAULT NULL,
  max_complexity int DEFAULT NULL,
  sort_by text DEFAULT 'relevance',
  sort_dir text DEFAULT 'desc',
  limit_val int DEFAULT 20,
  offset_val int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  author_name text,
  category text,
  complexity_score int,
  created_at timestamptz,
  relevance float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_prompts AS (
    SELECT
      p.id,
      p.title,
      p.body as description,
      u.email as author_name,
      psi.category,
      psi.complexity_score,
      p.created_at,
      CASE
        WHEN search_query IS NULL THEN 0
        ELSE ts_rank(psi.search_vector, to_tsquery('english', search_query))
      END as relevance
    FROM prompts p
    JOIN users u ON p.creator_id = u.id
    JOIN prompt_search_index psi ON p.id = psi.prompt_id
    WHERE
      (search_query IS NULL OR psi.search_vector @@ to_tsquery('english', search_query))
      AND (categories IS NULL OR psi.category = ANY(categories))
      AND (min_date IS NULL OR p.created_at >= min_date)
      AND (max_date IS NULL OR p.created_at <= max_date)
      AND (models IS NULL OR p.metadata->>'model' = ANY(models))
      AND (min_complexity IS NULL OR psi.complexity_score >= min_complexity)
      AND (max_complexity IS NULL OR psi.complexity_score <= max_complexity)
      AND (
        p.visibility = 'public'
        OR p.creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members tm
          JOIN projects proj ON proj.team_id = tm.team_id
          WHERE tm.user_id = auth.uid()
          AND proj.id = p.id
        )
      )
  )
  SELECT *
  FROM ranked_prompts
  ORDER BY
    CASE
      WHEN sort_by = 'relevance' AND sort_dir = 'desc' THEN relevance END DESC,
    CASE
      WHEN sort_by = 'relevance' AND sort_dir = 'asc' THEN relevance END ASC,
    CASE
      WHEN sort_by = 'date' AND sort_dir = 'desc' THEN created_at END DESC,
    CASE
      WHEN sort_by = 'date' AND sort_dir = 'asc' THEN created_at END ASC,
    CASE
      WHEN sort_by = 'complexity' AND sort_dir = 'desc' THEN complexity_score END DESC,
    CASE
      WHEN sort_by = 'complexity' AND sort_dir = 'asc' THEN complexity_score END ASC
  LIMIT limit_val
  OFFSET offset_val;
END;
$$;