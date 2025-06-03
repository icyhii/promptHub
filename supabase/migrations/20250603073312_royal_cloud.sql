/*
  # Team Management Schema Update

  1. New Types
    - team_visibility: public/private visibility settings
    - invitation_status: tracks invitation lifecycle
    - team_role: defines member role hierarchy

  2. Tables
    - team_settings: team configuration and metadata
    - team_invitations: manages team invites
    - team_audit_logs: tracks team activity

  3. Security
    - RLS enabled on all tables
    - Role-based access policies
    - Audit logging for key actions
*/

-- Create enum types if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_visibility') THEN
    CREATE TYPE team_visibility AS ENUM ('public', 'private');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'revoked');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_role') THEN
    CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
  END IF;
END$$;

-- Team settings table
CREATE TABLE IF NOT EXISTS team_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  logo_url text,
  description text,
  visibility team_visibility NOT NULL DEFAULT 'private',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role team_role NOT NULL DEFAULT 'editor',
  token text NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, email)
);

-- Team audit logs table
CREATE TABLE IF NOT EXISTS team_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE team_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_settings_team_id') THEN
    CREATE INDEX idx_team_settings_team_id ON team_settings(team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_invitations_team_id') THEN
    CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_invitations_email') THEN
    CREATE INDEX idx_team_invitations_email ON team_invitations(email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_audit_logs_team_id') THEN
    CREATE INDEX idx_team_audit_logs_team_id ON team_audit_logs(team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_audit_logs_user_id') THEN
    CREATE INDEX idx_team_audit_logs_user_id ON team_audit_logs(user_id);
  END IF;
END$$;

-- Update existing team_members table to use enum
DO $$
BEGIN
  ALTER TABLE team_members 
    ALTER COLUMN role TYPE team_role 
    USING role::team_role;
EXCEPTION
  WHEN others THEN NULL;
END$$;

-- RLS Policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Team admins can manage settings" ON team_settings;
  CREATE POLICY "Team admins can manage settings"
    ON team_settings
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_settings.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
      )
    );

  DROP POLICY IF EXISTS "Team members can view settings" ON team_settings;
  CREATE POLICY "Team members can view settings"
    ON team_settings
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_settings.team_id
        AND tm.user_id = auth.uid()
      )
      OR
      visibility = 'public'
    );

  DROP POLICY IF EXISTS "Team admins can manage invitations" ON team_invitations;
  CREATE POLICY "Team admins can manage invitations"
    ON team_invitations
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_invitations.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
      )
    );

  DROP POLICY IF EXISTS "Users can view their own invitations" ON team_invitations;
  CREATE POLICY "Users can view their own invitations"
    ON team_invitations
    FOR SELECT
    TO authenticated
    USING (
      email = (
        SELECT email FROM users
        WHERE id = auth.uid()
      )
    );

  DROP POLICY IF EXISTS "Team members can view audit logs" ON team_audit_logs;
  CREATE POLICY "Team members can view audit logs"
    ON team_audit_logs
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_audit_logs.team_id
        AND tm.user_id = auth.uid()
      )
    );
END$$;

-- Create team management function
CREATE OR REPLACE FUNCTION create_team_with_settings(
  team_name text,
  team_description text DEFAULT NULL,
  team_visibility team_visibility DEFAULT 'private'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_team_id uuid;
BEGIN
  -- Create team
  INSERT INTO teams (name, owner_id)
  VALUES (team_name, auth.uid())
  RETURNING id INTO new_team_id;

  -- Create team settings
  INSERT INTO team_settings (team_id, description, visibility)
  VALUES (new_team_id, team_description, team_visibility);

  -- Add owner as first member
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (new_team_id, auth.uid(), 'owner');

  -- Log creation
  INSERT INTO team_audit_logs (team_id, user_id, action, details)
  VALUES (
    new_team_id,
    auth.uid(),
    'team.created',
    jsonb_build_object(
      'name', team_name,
      'visibility', team_visibility
    )
  );

  RETURN new_team_id;
END;
$$;