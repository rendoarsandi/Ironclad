
"use client";

import type { User, UserRole } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseLoginWithEmail, supabaseSignUpWithEmail, signInWithGoogle as supabaseSignInWithGoogle, supabaseLogout, type AuthChangeEvent, type Session, type SupabaseUserType } from '@/lib/supabase';
import { OrganizationConfirmationDialog } from './organization-confirmation-dialog';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUserType): User => {
  // Supabase admin role might be managed through custom claims or a separate table.
  // For simplicity, we'll use a convention here.
  const determinedRole: UserRole = supabaseUser.email?.toLowerCase().includes('admin@kontrakpro.com')
    ? 'admin'
    : 'user';

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    avatarUrl: supabaseUser.user_metadata?.avatar_url || `https://picsum.photos/seed/${supabaseUser.id}/100/100`,
    role: determinedRole,
  };
};


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session ? mapSupabaseUserToAppUser(session.user) : null);
      if (session) {
        localStorage.setItem('kontrakpro_supabase_user', JSON.stringify(mapSupabaseUserToAppUser(session.user)));
      } else {
        localStorage.removeItem('kontrakpro_supabase_user');
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setLoading(true);
        setSession(session);
        const currentUser = session?.user;

        if (currentUser) {
          // Check if this is a new Google login without organization
          const isGoogleLogin = event === 'SIGNED_IN' &&
                               currentUser.app_metadata.provider === 'google';
          const hasOrganization = currentUser.user_metadata.organization_name ||
                                 currentUser.user_metadata.organization_id;

          // If Google login without organization, show organization dialog
          if (isGoogleLogin && !hasOrganization) {
            setPendingGoogleUser(currentUser);
            setShowOrgDialog(true);
            setLoading(false);
            return; // Don't proceed with normal flow
          }

          const appUser = mapSupabaseUserToAppUser(currentUser);
          setUser(appUser);
          localStorage.setItem('kontrakpro_supabase_user', JSON.stringify(appUser));
        } else {
          setUser(null);
          localStorage.removeItem('kontrakpro_supabase_user');
        }

        setLoading(false);
      }
    );

    // Check for stored user if Supabase hasn't initialized yet
     if (loading && !session?.user) {
        const storedUserJson = localStorage.getItem('kontrakpro_supabase_user');
        if (storedUserJson) {
            try {
                const storedUser = JSON.parse(storedUserJson) as User;
                 if (storedUser && storedUser.id && storedUser.email) {
                     if(!user) setUser(storedUser);
                } else {
                    localStorage.removeItem('kontrakpro_supabase_user');
                }
            } catch (e) {
                console.error("Failed to parse stored user, removing.", e);
                localStorage.removeItem('kontrakpro_supabase_user');
            }
        }
    }


    return () => {
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: supabaseUser, error } = await supabaseLoginWithEmail(email, password);
      if (supabaseUser) {
        // Special case for rendoarsandi@gmail.com
        const isSpecialAccount = email.toLowerCase() === 'rendoarsandi@gmail.com';

        if (isSpecialAccount) {
          // Import dynamically to avoid circular dependencies
          const { userHasData, storeMockDataForUser } = await import('@/lib/mock-data');
          const { createAllTables } = await import('@/lib/create-tables');

          // Create all tables if they don't exist
          await createAllTables();

          // Check if user already has data
          const hasData = await userHasData(supabaseUser.id);

          if (!hasData) {
            console.log("Storing mock data for special account:", email);

            // Get organization ID
            const { data: userData } = await supabase.auth.getUser();
            let organizationId = userData.user?.user_metadata?.organization_id;

            // If no organization ID, create one
            if (!organizationId) {
              organizationId = crypto.randomUUID();

              // Update user with organization info
              await supabase.auth.updateUser({
                data: {
                  organization_name: "Default Organization",
                  organization_id: organizationId,
                  organization_role: 'owner',
                },
              });

              // Try to insert the organization record
              try {
                await supabase
                  .from('organizations')
                  .insert({
                    id: organizationId,
                    name: "Default Organization",
                    created_by: supabaseUser.id || email || 'unknown',
                    created_at: new Date().toISOString()
                  });
              } catch (insertError) {
                console.error("Error inserting organization record:", JSON.stringify(insertError));
                // We continue anyway
              }
            }

            // Store mock data
            await storeMockDataForUser(supabaseUser.id, organizationId);
          }
        }

        // onAuthStateChange will handle setting user and local storage
        router.push('/dashboard');
      } else {
        throw error || new Error("Email login failed.");
      }
    } catch(e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (
    email: string,
    password: string,
    fullName?: string,
    organizationName?: string
  ) => {
    setLoading(true);
    try {
      const { user: supabaseUser, error } = await supabaseSignUpWithEmail(
        email,
        password,
        fullName,
        organizationName
      );
      if (supabaseUser) {
         // onAuthStateChange will handle setting user and local storage
        // For Supabase, signUp might automatically sign in or require verification
        // Adjust router.push based on your Supabase email verification settings
        router.push('/dashboard'); // Or to a "please verify email" page
      } else {
        throw error || new Error("Email signup failed.");
      }
    } catch(e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const [showOrgDialog, setShowOrgDialog] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // supabaseSignInWithGoogle initiates OAuth flow. User state will be updated by onAuthStateChange.
      const { error } = await supabaseSignInWithGoogle();
      if (error) {
        throw error;
      }
      // Redirection happens via Supabase, onAuthStateChange handles the rest.
    } catch(e) {
      throw e;
    } finally {
      // setLoading might be set to false too early if redirection is quick
      // Consider managing loading state more carefully for OAuth flows
      // For now, we'll leave it, as onAuthStateChange will set loading to false eventually.
    }
  };

  // Handle organization confirmation after Google login
  const handleOrganizationConfirm = async (organizationName: string) => {
    if (!pendingGoogleUser) return;

    try {
      console.log("Creating organization for user:", pendingGoogleUser.id);

      // Import the createOrganizationsTable function
      const { createOrganizationsTable } = await import('@/lib/create-tables');

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
        throw updateError;
      }

      // Try to insert the organization record
      try {
        const { error: insertError } = await supabase
          .from('organizations')
          .insert({
            id: organizationId,
            name: organizationName,
            created_by: pendingGoogleUser.id || pendingGoogleUser.email || 'unknown',
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

      // Special case for rendoarsandi@gmail.com
      const isSpecialAccount = pendingGoogleUser.email?.toLowerCase() === 'rendoarsandi@gmail.com';

      if (isSpecialAccount) {
        // Import dynamically to avoid circular dependencies
        const { userHasData, storeMockDataForUser } = await import('@/lib/mock-data');

        // Check if user already has data
        const hasData = await userHasData(pendingGoogleUser.id);

        if (!hasData) {
          console.log("Storing mock data for special account:", pendingGoogleUser.email);
          await storeMockDataForUser(pendingGoogleUser.id, organizationId);
        }
      }

      // Close dialog and redirect
      setShowOrgDialog(false);
      setPendingGoogleUser(null);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error in organization confirmation:", JSON.stringify(error));

      // Even if there's an error, we'll still close the dialog and redirect
      // to avoid blocking the user
      setShowOrgDialog(false);
      setPendingGoogleUser(null);
      router.push('/dashboard');
    }
  };


  const logout = async () => {
    setLoading(true);
    const { error } = await supabaseLogout();
    if (error) {
      console.error("Error signing out: ", error);
    }
    // setUser and localStorage are handled by onAuthStateChange
    setLoading(false);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, setLoading, loginWithEmail, signupWithEmail, loginWithGoogle, logout }}>
      {children}

      {/* Organization Confirmation Dialog */}
      {showOrgDialog && pendingGoogleUser && (
        <OrganizationConfirmationDialog
          isOpen={showOrgDialog}
          onClose={() => {
            setShowOrgDialog(false);
            setPendingGoogleUser(null);
            // Logout if user cancels
            supabaseLogout();
          }}
          onConfirm={handleOrganizationConfirm}
          email={pendingGoogleUser.email || ''}
        />
      )}
    </AuthContext.Provider>
  );
};
