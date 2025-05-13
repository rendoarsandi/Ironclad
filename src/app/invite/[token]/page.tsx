"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Building2, LogIn } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Invite {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  created_at: string;
  expires_at: string | null;
  invite_token: string;
  created_by: string;
  organization?: {
    id: string;
    name: string;
    created_at: string;
    created_by: string;
  };
  inviter?: {
    id: string;
    email: string;
    user_metadata: {
      name?: string;
      full_name?: string;
    };
  };
}

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const inviteToken = params.token as string;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Load invite data
  useEffect(() => {
    const loadInvite = async () => {
      if (!inviteToken) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('team_invites')
          .select(`
            *,
            organization:organization_id (*),
            inviter:created_by (
              id,
              email,
              user_metadata
            )
          `)
          .eq('invite_token', inviteToken)
          .is('accepted', null)
          .single();

        if (error) {
          throw error;
        }

        // Check if invite is expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setIsExpired(true);
          toast({
            title: "Undangan Kedaluwarsa",
            description: "Undangan ini telah kedaluwarsa.",
            variant: "destructive",
          });
          return;
        }

        setInvite(data);
      } catch (error) {
        console.error('Error loading invite:', error);
        toast({
          title: "Error",
          description: "Gagal memuat undangan. Undangan mungkin tidak valid atau telah kedaluwarsa.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInvite();
  }, [inviteToken, toast]);

  // Accept invite
  const handleAcceptInvite = async () => {
    if (!invite || !user) {
      // If user is not logged in, redirect to login page
      if (!user) {
        // Store invite token in localStorage to handle after login
        localStorage.setItem('pending_invite_token', inviteToken);
        router.push(`/login?redirect=/invite/${inviteToken}`);
        return;
      }
      return;
    }

    // Check if the logged in user matches the invited email
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      toast({
        title: "Email Tidak Cocok",
        description: `Undangan ini untuk ${invite.email}. Silakan login dengan akun tersebut.`,
        variant: "destructive",
      });
      return;
    }

    setIsAccepting(true);

    try {
      // Update user with organization info
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          organization_id: invite.organization_id,
          organization_name: invite.organization?.name,
          organization_role: invite.role,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Mark invite as accepted
      const { error: inviteError } = await supabase
        .from('team_invites')
        .update({
          accepted: true,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invite.id);

      if (inviteError) {
        throw inviteError;
      }

      setIsAccepted(true);
      
      toast({
        title: "Berhasil",
        description: `Anda telah bergabung dengan ${invite.organization?.name}`,
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast({
        title: "Error",
        description: "Gagal menerima undangan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle loading state
  if (isLoading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle expired or invalid invite
  if (isExpired || !invite) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-red-500" />
              Undangan Tidak Valid
            </CardTitle>
            <CardDescription>
              Undangan tidak valid atau telah kedaluwarsa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Undangan yang Anda coba akses tidak valid atau telah kedaluwarsa. Silakan hubungi orang yang mengundang Anda untuk mendapatkan undangan baru.
            </p>
            <Button asChild className="w-full">
              <Link href="/">
                Kembali ke Beranda
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle accepted invite
  if (isAccepted) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Undangan Diterima
            </CardTitle>
            <CardDescription>
              Anda telah bergabung dengan {invite.organization?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Anda akan dialihkan ke dashboard dalam beberapa detik...
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">
                Pergi ke Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Undangan Tim
          </CardTitle>
          <CardDescription>
            Anda diundang untuk bergabung dengan tim
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{invite.organization?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {invite.inviter?.user_metadata?.name || invite.inviter?.user_metadata?.full_name || invite.inviter?.email} mengundang Anda untuk bergabung dengan tim mereka sebagai{" "}
              <span className="font-medium">
                {invite.role === "admin" ? "Administrator" : invite.role === "member" ? "Anggota" : "Pengamat"}
              </span>
              .
            </p>
          </div>

          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Informasi Undangan</h3>
                <div className="mt-2 text-sm">
                  <p className="text-muted-foreground">Email: {invite.email}</p>
                  <p className="text-muted-foreground">
                    Peran: {invite.role === "admin" ? "Administrator" : invite.role === "member" ? "Anggota" : "Pengamat"}
                  </p>
                  {invite.expires_at && (
                    <p className="text-muted-foreground">
                      Kedaluwarsa pada: {new Date(invite.expires_at).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handleAcceptInvite}
            className="w-full"
            disabled={isAccepting}
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menerima...
              </>
            ) : !user ? (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Login untuk Menerima
              </>
            ) : (
              "Terima Undangan"
            )}
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Kembali ke Beranda
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
