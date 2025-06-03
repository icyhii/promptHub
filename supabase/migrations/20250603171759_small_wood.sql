/*
  # Add vector search capabilities
  
  1. New Features
    - Enable vector extension for semantic search
    - Create prompt_embeddings table for storing embeddings
    - Add efficient vector similarity search index
    - Implement search_prompts function
  
  2. Security
    - Enable RLS on prompt_embeddings table
    - Add policy for authenticated users to read embeddings
*/

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE IF NOT EXISTS prompt_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  content_embedding vector(1536),
  metadata_embedding vector(1536),
  last_updated timestamptz DEFAULT now(),
  UNIQUE(prompt_id)
);

-- Create index for faster similarity search
CREATE INDEX IF NOT EXISTS prompt_embeddings_vector_idx 
  ON prompt_embeddings 
  USING ivfflat (content_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Enable RLS
ALTER TABLE prompt_embeddings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (with IF NOT EXISTS)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'prompt_embeddings' 
    AND policyname = 'Users can read embeddings for accessible prompts'
  ) THEN
    CREATE POLICY "Users can read embeddings for accessible prompts"
      ON prompt_embeddings
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM prompts p
          WHERE p.id = prompt_embeddings.prompt_id
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
  END IF;
END $$;

-- Create or replace search function
CREATE OR REPLACE FUNCTION search_prompts(
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int,
  filter_categories text[] DEFAULT NULL,
  filter_models text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    1 - (pe.content_embedding <=> query_embedding) as similarity
  FROM prompts p
  JOIN prompt_embeddings pe ON p.id = pe.prompt_id
  WHERE 1 - (pe.content_embedding <=> query_embedding) > similarity_threshold
    AND (filter_categories IS NULL OR p.metadata->>'category' = ANY(filter_categories))
    AND (filter_models IS NULL OR p.metadata->>'model' = ANY(filter_models))
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;