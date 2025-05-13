"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Share2, Copy, Mail, Calendar, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { sendSignatureRequestEmail } from "@/lib/email";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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

interface ShareDocumentDialogProps {
  contractId: string;
  contractTitle: string;
  children?: React.ReactNode;
}

interface Share {
  id: string;
  email: string;
  access_level: string;
  created_at: string;
  expires_at: string | null;
  share_token: string;
  is_active: boolean;
}

// Form schema
const shareSchema = z.object({
  email: z.string().email("Alamat email tidak valid"),
  accessLevel: z.enum(["view", "comment", "edit"], {
    required_error: "Pilih level akses",
  }),
  expiresAt: z.string().optional(),
});

type ShareFormValues = z.infer<typeof shareSchema>;

export function ShareDocumentDialog({ contractId, contractTitle, children }: ShareDocumentDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shares, setShares] = useState<Share[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedShareId, setSelectedShareId] = useState<string | null>(null);

  // Initialize form
  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      email: "",
      accessLevel: "view",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    },
  });

  // Load shares when dialog opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    
    if (open && user) {
      await loadShares();
    }
  };

  // Load shares
  const loadShares = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('contract_id', contractId)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setShares(data || []);
    } catch (error) {
      console.error('Error loading shares:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data berbagi. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: ShareFormValues) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Generate share token
      const shareToken = uuidv4();
      
      // Create share record in database
      const shareData = {
        contract_id: contractId,
        created_by: user.id,
        email: data.email,
        access_level: data.accessLevel,
        expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        share_token: shareToken,
      };

      const { data: share, error } = await supabase
        .from('shares')
        .insert(shareData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Send email notification
      const shareLink = `${window.location.origin}/shared/${shareToken}`;
      
      await sendSignatureRequestEmail(
        data.email,
        contractTitle,
        user.name || user.email || "Pengguna KontrakPro",
        shareLink,
        `Dokumen ini dibagikan dengan Anda dengan akses ${data.accessLevel === 'view' ? 'lihat' : data.accessLevel === 'comment' ? 'komentar' : 'edit'}.`
      );

      // Update shares list
      setShares([share, ...shares]);
      
      // Reset form
      form.reset();

      toast({
        title: "Berhasil",
        description: "Dokumen telah dibagikan",
      });
    } catch (error) {
      console.error("Error sharing document:", error);
      toast({
        title: "Error",
        description: "Gagal membagikan dokumen. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy share link to clipboard
  const copyShareLink = (shareToken: string) => {
    const shareLink = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Disalin",
      description: "Link berbagi telah disalin ke clipboard",
    });
  };

  // Delete share
  const handleDeleteShare = async (shareId: string) => {
    if (!user) return;

    try {
      setIsDeleting(true);
      setSelectedShareId(shareId);

      const { error } = await supabase
        .from('shares')
        .delete()
        .eq('id', shareId)
        .eq('created_by', user.id);

      if (error) {
        throw error;
      }

      // Update shares list
      setShares(shares.filter(share => share.id !== shareId));

      toast({
        title: "Berhasil",
        description: "Berbagi dokumen telah dihapus",
      });
    } catch (error) {
      console.error('Error deleting share:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus berbagi dokumen. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setSelectedShareId(null);
    }
  };

  // Get access level badge
  const getAccessLevelBadge = (accessLevel: string) => {
    switch (accessLevel) {
      case "view":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Lihat</Badge>;
      case "comment":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Komentar</Badge>;
      case "edit":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Edit</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tidak ada";
    return format(new Date(dateString), "dd MMMM yyyy");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" /> Bagikan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bagikan Dokumen</DialogTitle>
          <DialogDescription>
            Bagikan dokumen ini dengan orang lain melalui email.
          </DialogDescription>
        </DialogHeader>
        
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
              name="accessLevel"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Level Akses</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="view" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Lihat - Hanya dapat melihat dokumen
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="comment" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Komentar - Dapat melihat dan mengomentari dokumen
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="edit" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Edit - Dapat melihat, mengomentari, dan mengedit dokumen
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Kedaluwarsa (Opsional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input type="date" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Akses akan berakhir pada tanggal ini. Biarkan kosong untuk akses tanpa batas waktu.
                  </FormDescription>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Membagikan...
                </>
              ) : (
                "Bagikan Dokumen"
              )}
            </Button>
          </form>
        </Form>

        {shares.length > 0 && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Dokumen Dibagikan Dengan</h3>
              
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {shares.map((share) => (
                    <div key={share.id} className="flex items-start justify-between p-3 border rounded-md">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="font-medium">{share.email}</span>
                          <span className="ml-2">{getAccessLevelBadge(share.access_level)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Dibagikan pada {formatDate(share.created_at)}
                          {share.expires_at && ` • Kedaluwarsa pada ${formatDate(share.expires_at)}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyShareLink(share.share_token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isDeleting && selectedShareId === share.id}
                            >
                              {isDeleting && selectedShareId === share.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Berbagi</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus akses untuk {share.email}? Mereka tidak akan lagi dapat mengakses dokumen ini.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteShare(share.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
