/*
  # Team Management System Implementation

  1. New Tables
    - `team_settings`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `logo_url` (text)
      - `description` (text)
      - `visibility` (text)
      - `archived` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `team_invitations`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `email` (text)
      - `role` (text)
      - `token` (text)
      - `status` (text)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `team_audit_logs`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for team members based on roles
*/

-- Team settings table
CREATE TABLE IF NOT EXISTS team_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  logo_url text,
  description text,
  visibility text NOT NULL DEFAULT 'private',
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
  role text NOT NULL DEFAULT 'member',
  token text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
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

-- Create indexes
CREATE INDEX idx_team_settings_team_id ON team_settings(team_id);
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_audit_logs_team_id ON team_audit_logs(team_id);
CREATE INDEX idx_team_audit_logs_user_id ON team_audit_logs(user_id);

-- Add team visibility enum
CREATE TYPE team_visibility AS ENUM ('public', 'private');
ALTER TABLE team_settings 
  ALTER COLUMN visibility TYPE team_visibility 
  USING visibility::team_visibility;

-- Add invitation status enum
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'revoked');
ALTER TABLE team_invitations 
  ALTER COLUMN status TYPE invitation_status 
  USING status::invitation_status;

-- Add member role enum
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
ALTER TABLE team_members 
  ALTER COLUMN role TYPE team_role 
  USING role::team_role;

-- RLS Policies

-- Team Settings
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

-- Team Invitations
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

-- Audit Logs
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

-- Functions

-- Function to create a team with initial settings
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