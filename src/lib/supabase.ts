
import { createClient, type AuthChangeEvent, type Session, type User as SupabaseUserType } from '@supabase/supabase-js';
import { storeMockDataForUser, userHasData } from './mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseSignUpWithEmail = async (
  email: string,
  password: string,
  fullName?: string,
  organizationName?: string
) => {
  // Special case for rendoarsandi@gmail.com
  const isSpecialAccount = email.toLowerCase() === 'rendoarsandi@gmail.com';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
        name: fullName || '',
        organization_name: organizationName || '',
        organization_role: 'owner', // Default role for creator is owner
      },
    },
  });

  // If user was created successfully and we have their ID
  if (data.user && organizationName) {
    try {
      // Import the createOrganizationsTable function
      const { createOrganizationsTable } = await import('./create-tables');

      // Create organizations table if it doesn't exist
      await createOrganizationsTable();

      // Generate a unique ID for the organization
      const organizationId = crypto.randomUUID();

      // Update user with organization info in metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          organization_name: organizationName,
          organization_id: organizationId,
          organization_role: 'owner',
        },
      });

      if (updateError) {
        console.error("Error updating user with organization info:", JSON.stringify(updateError));
        // We don't throw here to avoid preventing user creation
      }

      // Try to insert the organization record
      try {
        const { error: insertError } = await supabase
          .from('organizations')
          .insert({
            id: organizationId,
            name: organizationName,
            created_by: data.user.id || data.user.email || 'unknown',
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("Error inserting organization record:", JSON.stringify(insertError));
          // We continue anyway since we've already updated the user metadata
        }
      } catch (insertError) {
        console.error("Exception inserting organization record:", JSON.stringify(insertError));
        // We continue anyway since we've already updated the user metadata
      }

      // If this is the special account, store mock data
      if (isSpecialAccount && data.user) {
        // Check if user already has data
        const hasData = await userHasData(data.user.id);

        if (!hasData) {
          console.log("Storing mock data for special account:", email);
          await storeMockDataForUser(data.user.id, organizationId);
        }
      }
    } catch (error) {
      console.error("Error in organization creation process:", JSON.stringify(error));
    }
  }

  return { user: data.user, session: data.session, error };
};

export const supabaseLoginWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, session: data.session, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined, // Or your specific callback URL
    }
  });
  return { user: data, error }; // signInWithOAuth returns { data: { provider, url }, error }
};

export const supabaseLogout = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export type { AuthChangeEvent, Session, SupabaseUserType };
