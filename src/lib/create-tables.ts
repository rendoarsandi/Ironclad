import { supabase } from "./supabase";

/**
 * Create organizations table directly with SQL
 */
export async function createOrganizationsTable() {
  try {
    console.log("Creating organizations table directly with SQL...");
    
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS organizations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_by TEXT NOT NULL
        );
      `
    });
    
    if (error) {
      console.error("Error creating organizations table with SQL:", error);
      return { success: false, error };
    }
    
    console.log("Organizations table created successfully with SQL");
    return { success: true };
  } catch (error) {
    console.error("Error creating organizations table:", error);
    return { success: false, error };
  }
}

/**
 * Create contracts table directly with SQL
 */
export async function createContractsTable() {
  try {
    console.log("Creating contracts table directly with SQL...");
    
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS contracts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT NOT NULL,
          content TEXT,
          version INTEGER NOT NULL DEFAULT 1,
          created_by TEXT NOT NULL,
          organization_id TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          metadata JSONB
        );
      `
    });
    
    if (error) {
      console.error("Error creating contracts table with SQL:", error);
      return { success: false, error };
    }
    
    console.log("Contracts table created successfully with SQL");
    return { success: true };
  } catch (error) {
    console.error("Error creating contracts table:", error);
    return { success: false, error };
  }
}

/**
 * Create signatures table directly with SQL
 */
export async function createSignaturesTable() {
  try {
    console.log("Creating signatures table directly with SQL...");
    
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS signatures (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          signature_image_url TEXT,
          signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          ip_address TEXT,
          metadata JSONB
        );
      `
    });
    
    if (error) {
      console.error("Error creating signatures table with SQL:", error);
      return { success: false, error };
    }
    
    console.log("Signatures table created successfully with SQL");
    return { success: true };
  } catch (error) {
    console.error("Error creating signatures table:", error);
    return { success: false, error };
  }
}

/**
 * Create chat_sessions table directly with SQL
 */
export async function createChatSessionsTable() {
  try {
    console.log("Creating chat_sessions table directly with SQL...");
    
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          user_id TEXT NOT NULL,
          organization_id TEXT,
          last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          status TEXT NOT NULL DEFAULT 'active'
        );
      `
    });
    
    if (error) {
      console.error("Error creating chat_sessions table with SQL:", error);
      return { success: false, error };
    }
    
    console.log("Chat sessions table created successfully with SQL");
    return { success: true };
  } catch (error) {
    console.error("Error creating chat_sessions table:", error);
    return { success: false, error };
  }
}

/**
 * Create chat_messages table directly with SQL
 */
export async function createChatMessagesTable() {
  try {
    console.log("Creating chat_messages table directly with SQL...");
    
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    });
    
    if (error) {
      console.error("Error creating chat_messages table with SQL:", error);
      return { success: false, error };
    }
    
    console.log("Chat messages table created successfully with SQL");
    return { success: true };
  } catch (error) {
    console.error("Error creating chat_messages table:", error);
    return { success: false, error };
  }
}

/**
 * Create team_invites table directly with SQL
 */
export async function createTeamInvitesTable() {
  try {
    console.log("Creating team_invites table directly with SQL...");
    
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS team_invites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL,
          organization_id TEXT NOT NULL,
          role TEXT NOT NULL,
          created_by TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ,
          accepted BOOLEAN,
          accepted_at TIMESTAMPTZ,
          invite_token TEXT NOT NULL UNIQUE
        );
      `
    });
    
    if (error) {
      console.error("Error creating team_invites table with SQL:", error);
      return { success: false, error };
    }
    
    console.log("Team invites table created successfully with SQL");
    return { success: true };
  } catch (error) {
    console.error("Error creating team_invites table:", error);
    return { success: false, error };
  }
}

/**
 * Create all tables directly with SQL
 */
export async function createAllTables() {
  await createOrganizationsTable();
  await createContractsTable();
  await createSignaturesTable();
  await createChatSessionsTable();
  await createChatMessagesTable();
  await createTeamInvitesTable();
  
  return { success: true };
}
