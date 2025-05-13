-- Create organizations table
CREATE OR REPLACE FUNCTION create_organizations_table()
RETURNS void AS $$
BEGIN
  -- Drop the table if it exists with wrong schema
  DROP TABLE IF EXISTS organizations;

  -- Create the table with correct schema
  CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Create contracts table
CREATE OR REPLACE FUNCTION create_contracts_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    content TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
  );
END;
$$ LANGUAGE plpgsql;

-- Create signatures table
CREATE OR REPLACE FUNCTION create_signatures_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    signature_image_url TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    metadata JSONB
  );
END;
$$ LANGUAGE plpgsql;

-- Create chat_sessions table
CREATE OR REPLACE FUNCTION create_chat_sessions_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Create chat_messages table
CREATE OR REPLACE FUNCTION create_chat_messages_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create team_invites table
CREATE OR REPLACE FUNCTION create_team_invites_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    organization_id UUID NOT NULL,
    role TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    accepted BOOLEAN,
    accepted_at TIMESTAMPTZ,
    invite_token TEXT NOT NULL UNIQUE
  );
END;
$$ LANGUAGE plpgsql;
