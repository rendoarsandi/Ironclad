"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Pen, Trash2 } from "lucide-react";
import Link from "next/link";
import { SignaturePad } from "@/components/signature/signature-pad";
import { supabase } from "@/lib/supabase";
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

export default function ManageSignaturePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [signature, setSignature] = useState<string | null>(null);
  const [savedSignatures, setSavedSignatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);

  // Load user's signatures
  useEffect(() => {
    const loadSignatures = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('signatures')
          .select('*')
          .eq('user_id', user.id)
          .is('contract_id', null) // Only get default signatures
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setSavedSignatures(data || []);
      } catch (error) {
        console.error('Error loading signatures:', error);
        toast({
          title: "Error",
          description: "Gagal memuat tanda tangan. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSignatures();
  }, [user, toast]);

  // Handle signature change
  const handleSignatureChange = (newSignature: string | null) => {
    setSignature(newSignature);
  };

  // Delete a signature
  const handleDeleteSignature = async (id: string) => {
    if (!user) return;

    try {
      setIsDeleting(true);
      setSelectedSignatureId(id);

      const { error } = await supabase
        .from('signatures')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update the list
      setSavedSignatures(savedSignatures.filter(sig => sig.id !== id));

      toast({
        title: "Berhasil",
        description: "Tanda tangan telah dihapus",
      });
    } catch (error) {
      console.error('Error deleting signature:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus tanda tangan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setSelectedSignatureId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/signature">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Kelola Tanda Tangan</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Buat Tanda Tangan Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <SignaturePad 
                onSignatureChange={handleSignatureChange} 
                saveToDatabase={true}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tanda Tangan Tersimpan</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : savedSignatures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Anda belum memiliki tanda tangan tersimpan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedSignatures.map((sig, index) => (
                    <div key={sig.id} className="relative">
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">
                            Dibuat pada: {new Date(sig.signed_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <div className="border rounded-md p-2 bg-white">
                            <img 
                              src={sig.signature_image_url} 
                              alt="Tanda tangan" 
                              className="max-h-24 object-contain"
                            />
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              disabled={isDeleting && selectedSignatureId === sig.id}
                            >
                              {isDeleting && selectedSignatureId === sig.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Tanda Tangan</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus tanda tangan ini? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSignature(sig.id)}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
