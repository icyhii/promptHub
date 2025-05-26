/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text)
      - preferences (jsonb)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - prompts
      - id (uuid, primary key)
      - title (text)
      - body (text)
      - tags (text[])
      - metadata (jsonb)
      - creator_id (uuid, references users)
      - status (text)
      - visibility (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - prompt_versions
      - id (uuid, primary key)
      - prompt_id (uuid, references prompts)
      - version_number (integer)
      - content (text)
      - change_log (text)
      - created_at (timestamp)
    
    - prompt_executions
      - id (uuid, primary key)
      - prompt_id (uuid, references prompts)
      - input (jsonb)
      - output (jsonb)
      - model (text)
      - runtime_stats (jsonb)
      - user_rating (integer)
      - test_case_id (uuid)
      - created_at (timestamp)
    
    - teams
      - id (uuid, primary key)
      - name (text)
      - owner_id (uuid, references users)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - team_members
      - team_id (uuid, references teams)
      - user_id (uuid, references users)
      - role (text)
      - created_at (timestamp)
      - primary key (team_id, user_id)
    
    - projects
      - id (uuid, primary key)
      - name (text)
      - team_id (uuid, references teams)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - comments
      - id (uuid, primary key)
      - prompt_id (uuid, references prompts)
      - user_id (uuid, references users)
      - body (text)
      - created_at (timestamp)
    
    - optimization_jobs
      - id (uuid, primary key)
      - prompt_id (uuid, references prompts)
      - status (text)
      - method (text)
      - result_summary (jsonb)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - token_usage_logs
      - id (uuid, primary key)
      - prompt_id (uuid, references prompts)
      - user_id (uuid, references users)
      - model (text)
      - token_count (integer)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Prompts table
CREATE TABLE public.prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  creator_id uuid REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'private',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Prompt versions table
CREATE TABLE public.prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content text NOT NULL,
  change_log text,
  created_at timestamptz DEFAULT now()
);

-- Prompt executions table
CREATE TABLE public.prompt_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE CASCADE,
  input jsonb NOT NULL,
  output jsonb,
  model text NOT NULL,
  runtime_stats jsonb DEFAULT '{}',
  user_rating integer,
  test_case_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

-- Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments table
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Optimization jobs table
CREATE TABLE public.optimization_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  method text NOT NULL,
  result_summary jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Token usage logs table
CREATE TABLE public.token_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  model text NOT NULL,
  token_count integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can read public prompts and their own prompts
CREATE POLICY "Users can read public and own prompts" ON public.prompts
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'public' OR 
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.team_id = tm.team_id
        AND p.id = prompts.id
      )
    )
  );

-- Users can create prompts
CREATE POLICY "Users can create prompts" ON public.prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Users can update their own prompts
CREATE POLICY "Users can update own prompts" ON public.prompts
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Users can delete their own prompts
CREATE POLICY "Users can delete own prompts" ON public.prompts
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Create indexes
CREATE INDEX idx_prompts_creator ON public.prompts(creator_id);
CREATE INDEX idx_prompts_status ON public.prompts(status);
CREATE INDEX idx_prompts_visibility ON public.prompts(visibility);
CREATE INDEX idx_prompt_versions_prompt_id ON public.prompt_versions(prompt_id);
CREATE INDEX idx_prompt_executions_prompt_id ON public.prompt_executions(prompt_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_projects_team_id ON public.projects(team_id);
CREATE INDEX idx_comments_prompt_id ON public.comments(prompt_id);
CREATE INDEX idx_optimization_jobs_prompt_id ON public.optimization_jobs(prompt_id);
CREATE INDEX idx_token_usage_logs_prompt_id ON public.token_usage_logs(prompt_id);
CREATE INDEX idx_token_usage_logs_user_id ON public.token_usage_logs(user_id);

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();