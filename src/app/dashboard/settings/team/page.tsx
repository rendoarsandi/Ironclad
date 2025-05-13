"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Mail, Users, Trash2, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sendInviteEmail } from "@/lib/email";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { OrganizationRole } from "@/types";

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  organization_role: OrganizationRole;
  created_at: string;
}

interface Invite {
  id: string;
  email: string;
  organization_id: string;
  role: OrganizationRole;
  created_at: string;
  expires_at: string | null;
  invite_token: string;
  created_by: string;
}

// Form schema
const inviteSchema = z.object({
  email: z.string().email("Alamat email tidak valid"),
  role: z.enum(["admin", "member", "viewer"], {
    required_error: "Pilih peran untuk anggota tim",
  }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function TeamSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>("");

  // Initialize form
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  // Load team members and invites
  useEffect(() => {
    const loadTeamData = async () => {
      if (!user || !user.organization_id) {
        router.push('/dashboard');
        return;
      }

      try {
        setIsLoading(true);
        
        // Load organization info
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', user.organization_id)
          .single();
          
        if (orgError) {
          throw orgError;
        }
        
        setOrganizationName(orgData.name);
        
        // Load team members
        const { data: membersData, error: membersError } = await supabase
          .from('users')
          .select('id, email, user_metadata, organization_role, created_at')
          .eq('organization_id', user.organization_id);
          
        if (membersError) {
          throw membersError;
        }
        
        // Transform data
        const transformedMembers: TeamMember[] = membersData.map(member => ({
          id: member.id,
          email: member.email,
          name: member.user_metadata?.name || member.user_metadata?.full_name,
          avatar_url: member.user_metadata?.avatar_url,
          organization_role: member.organization_role || 'member',
          created_at: member.created_at,
        }));
        
        setTeamMembers(transformedMembers);
        
        // Load invites
        const { data: invitesData, error: invitesError } = await supabase
          .from('team_invites')
          .select('*')
          .eq('organization_id', user.organization_id)
          .is('accepted', null)
          .order('created_at', { ascending: false });
          
        if (invitesError) {
          throw invitesError;
        }
        
        setInvites(invitesData);
      } catch (error) {
        console.error('Error loading team data:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data tim. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeamData();
  }, [user, router, toast]);

  // Handle form submission
  const onSubmit = async (data: InviteFormValues) => {
    if (!user || !user.organization_id) return;

    setIsSubmitting(true);

    try {
      // Generate invite token
      const inviteToken = crypto.randomUUID();
      
      // Set expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Create invite record
      const { data: invite, error } = await supabase
        .from('team_invites')
        .insert({
          email: data.email,
          organization_id: user.organization_id,
          role: data.role,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          invite_token: inviteToken,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Send invite email
      const inviteLink = `${window.location.origin}/invite/${inviteToken}`;
      
      await sendInviteEmail(
        data.email,
        user.name || user.email || "Pengguna KontrakPro",
        organizationName,
        inviteLink,
        data.role
      );

      // Update invites list
      setInvites([invite, ...invites]);
      
      // Reset form
      form.reset();

      toast({
        title: "Berhasil",
        description: "Undangan telah dikirim",
      });
    } catch (error) {
      console.error("Error sending invite:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim undangan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete invite
  const handleDeleteInvite = async (inviteId: string) => {
    if (!user) return;

    try {
      setIsDeleting(true);
      setSelectedId(inviteId);

      const { error } = await supabase
        .from('team_invites')
        .delete()
        .eq('id', inviteId)
        .eq('created_by', user.id);

      if (error) {
        throw error;
      }

      // Update invites list
      setInvites(invites.filter(invite => invite.id !== inviteId));

      toast({
        title: "Berhasil",
        description: "Undangan telah dihapus",
      });
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus undangan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setSelectedId(null);
    }
  };

  // Remove team member
  const handleRemoveMember = async (memberId: string) => {
    if (!user || user.id === memberId) return;

    try {
      setIsDeleting(true);
      setSelectedId(memberId);

      // Update user's organization_id to null
      const { error } = await supabase.auth.admin.updateUserById(
        memberId,
        {
          user_metadata: {
            organization_id: null,
            organization_role: null,
            organization_name: null,
          },
        }
      );

      if (error) {
        throw error;
      }

      // Update team members list
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));

      toast({
        title: "Berhasil",
        description: "Anggota tim telah dihapus",
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus anggota tim. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setSelectedId(null);
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Pemilik</Badge>;
      case "admin":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Admin</Badge>;
      case "member":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Anggota</Badge>;
      case "viewer":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pengamat</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    
    return "??";
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan Tim</h1>
          <p className="text-muted-foreground">
            Kelola anggota tim dan undangan untuk {organizationName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Undang Anggota Tim
              </CardTitle>
              <CardDescription>
                Undang anggota baru ke tim Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input placeholder="Masukkan alamat email" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Peran</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="admin" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Admin - Dapat mengelola tim dan semua dokumen
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="member" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Anggota - Dapat membuat dan mengelola dokumen
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="viewer" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Pengamat - Hanya dapat melihat dokumen
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                      </>
                    ) : (
                      "Kirim Undangan"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Anggota Tim
              </CardTitle>
              <CardDescription>
                Anggota tim yang saat ini memiliki akses ke {organizationName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-muted-foreground">Belum ada anggota tim</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>{getUserInitials(member.name, member.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name || member.email}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            {getRoleBadge(member.organization_role)}
                          </div>
                        </div>
                      </div>
                      {user?.id !== member.id && user?.organization_role === 'owner' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isDeleting && selectedId === member.id}
                            >
                              {isDeleting && selectedId === member.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Anggota Tim</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus {member.name || member.email} dari tim Anda? Mereka tidak akan lagi memiliki akses ke dokumen tim.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {invites.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Undangan yang Tertunda</h3>
                    
                    {invites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-3 border rounded-md border-dashed">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{invite.email.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{invite.email}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Tertunda</Badge>
                              {getRoleBadge(invite.role)}
                            </div>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isDeleting && selectedId === invite.id}
                            >
                              {isDeleting && selectedId === invite.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Undangan</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus undangan untuk {invite.email}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteInvite(invite.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
