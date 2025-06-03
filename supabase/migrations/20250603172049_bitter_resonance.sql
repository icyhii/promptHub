/*
  # Data Management System

  1. New Tables
    - `data_exports`
      - Tracks export jobs with versioning and status
    - `data_imports`
      - Tracks import jobs with validation results
    - `webhooks`
      - Stores webhook configurations and logs
    - `api_tokens`
      - Manages API tokens with permissions
    - `audit_logs`
      - Records all system activities

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- Create enum types
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE import_status AS ENUM ('pending', 'validating', 'processing', 'completed', 'failed');
CREATE TYPE webhook_status AS ENUM ('active', 'inactive', 'failed');

-- Data Exports table
CREATE TABLE IF NOT EXISTS data_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  version text NOT NULL,
  format text NOT NULL,
  filters jsonb DEFAULT '{}',
  status export_status DEFAULT 'pending',
  total_records integer DEFAULT 0,
  processed_records integer DEFAULT 0,
  file_url text,
  error_details text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Data Imports table
CREATE TABLE IF NOT EXISTS data_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  source_version text,
  format text NOT NULL,
  status import_status DEFAULT 'pending',
  total_records integer DEFAULT 0,
  processed_records integer DEFAULT 0,
  valid_records integer DEFAULT 0,
  invalid_records integer DEFAULT 0,
  validation_errors jsonb DEFAULT '[]',
  error_details text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  endpoint_url text NOT NULL,
  events text[] NOT NULL,
  secret text NOT NULL,
  status webhook_status DEFAULT 'active',
  retry_count integer DEFAULT 0,
  last_triggered_at timestamptz,
  headers jsonb DEFAULT '{}',
  filters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Webhook Logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  attempt_count integer DEFAULT 1,
  next_retry_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- API Tokens table
CREATE TABLE IF NOT EXISTS api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  token text NOT NULL,
  permissions jsonb NOT NULL,
  last_used_at timestamptz,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Token Usage Logs table
CREATE TABLE IF NOT EXISTS token_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES api_tokens(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  response_time integer,
  created_at timestamptz DEFAULT now()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage their own exports"
  ON data_exports
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own imports"
  ON data_imports
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own webhooks"
  ON webhooks
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their webhook logs"
  ON webhook_logs
  USING (webhook_id IN (
    SELECT id FROM webhooks WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own API tokens"
  ON api_tokens
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their token usage"
  ON token_usage_logs
  USING (token_id IN (
    SELECT id FROM api_tokens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their audit logs"
  ON audit_logs
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_data_exports_user_status ON data_exports(user_id, status);
CREATE INDEX idx_data_imports_user_status ON data_imports(user_id, status);
CREATE INDEX idx_webhooks_user_status ON webhooks(user_id, status);
CREATE INDEX idx_webhook_logs_webhook_created ON webhook_logs(webhook_id, created_at);
CREATE INDEX idx_api_tokens_user_expires ON api_tokens(user_id, expires_at);
CREATE INDEX idx_token_usage_logs_token_created ON token_usage_logs(token_id, created_at);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);

-- Create functions for token rotation
CREATE OR REPLACE FUNCTION rotate_api_token(token_id uuid)
RETURNS api_tokens
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token text;
  result api_tokens;
BEGIN
  -- Generate new token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Update token
  UPDATE api_tokens
  SET token = new_token,
      updated_at = now()
  WHERE id = token_id
  AND user_id = auth.uid()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;