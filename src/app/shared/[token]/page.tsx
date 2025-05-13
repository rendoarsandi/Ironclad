"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Download, FileText, Eye, MessageSquare, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CommentList } from "@/components/comments/comment-list";
import { format } from "date-fns";

interface Share {
  id: string;
  contract_id: string;
  created_by: string;
  email: string;
  access_level: string;
  created_at: string;
  expires_at: string | null;
  share_token: string;
  is_active: boolean;
  contract?: {
    id: string;
    title: string;
    type: string;
    status: string;
    content: string;
    version: number;
    created_by: string;
    created_at: string;
    metadata: {
      file_url: string;
      file_name: string;
      file_type: string;
      file_size: number;
      tags: string[];
    };
  };
}

export default function SharedDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const shareToken = params.token as string;
  const { toast } = useToast();
  const [share, setShare] = useState<Share | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  // Load share data
  useEffect(() => {
    const loadShare = async () => {
      if (!shareToken) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('shares')
          .select(`
            *,
            contract:contract_id (
              id,
              title,
              type,
              status,
              content,
              version,
              created_by,
              created_at,
              metadata
            )
          `)
          .eq('share_token', shareToken)
          .eq('is_active', true)
          .single();

        if (error) {
          throw error;
        }

        // Check if share is expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setIsExpired(true);
          toast({
            title: "Link Kedaluwarsa",
            description: "Link berbagi ini telah kedaluwarsa.",
            variant: "destructive",
          });
          return;
        }

        setShare(data);
      } catch (error) {
        console.error('Error loading share:', error);
        toast({
          title: "Error",
          description: "Gagal memuat dokumen. Link berbagi mungkin tidak valid atau telah kedaluwarsa.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadShare();
  }, [shareToken, toast]);

  // Handle download document
  const handleDownload = () => {
    if (!share?.contract?.metadata?.file_url) return;
    
    window.open(share.contract.metadata.file_url, '_blank');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy");
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isExpired || !share) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-red-500" />
              Akses Ditolak
            </CardTitle>
            <CardDescription>
              Link berbagi tidak valid atau telah kedaluwarsa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Dokumen yang Anda cari tidak dapat diakses. Silakan hubungi orang yang membagikan dokumen ini kepada Anda untuk mendapatkan link baru.
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{share.contract?.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                Dibagikan pada {formatDate(share.created_at)}
              </span>
              {getAccessLevelBadge(share.access_level)}
              {share.expires_at && (
                <span className="text-sm text-muted-foreground">
                  Kedaluwarsa pada {formatDate(share.expires_at)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Unduh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="preview" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" /> Pratinjau
              </TabsTrigger>
              {share.access_level !== "view" && (
                <TabsTrigger value="comments">
                  <MessageSquare className="mr-2 h-4 w-4" /> Komentar
                </TabsTrigger>
              )}
              <TabsTrigger value="details">
                <FileText className="mr-2 h-4 w-4" /> Detail
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  {share.contract?.metadata?.file_url ? (
                    <iframe
                      src={share.contract.metadata.file_url}
                      className="w-full h-[70vh] border-0"
                      title={share.contract.title}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 h-64">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Pratinjau tidak tersedia untuk dokumen ini.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {share.access_level !== "view" && (
              <TabsContent value="comments" className="space-y-4">
                <CommentList contractId={share.contract_id} />
              </TabsContent>
            )}
            
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Dokumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Nama File</h3>
                    <p className="text-sm text-muted-foreground">
                      {share.contract?.metadata?.file_name || "Tidak tersedia"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Ukuran</h3>
                    <p className="text-sm text-muted-foreground">
                      {share.contract?.metadata?.file_size 
                        ? `${(share.contract.metadata.file_size / 1024 / 1024).toFixed(2)} MB` 
                        : "Tidak tersedia"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Tipe</h3>
                    <p className="text-sm text-muted-foreground">
                      {share.contract?.metadata?.file_type || "Tidak tersedia"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Deskripsi</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {share.contract?.content || "Tidak ada deskripsi untuk dokumen ini."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Berbagi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Dibagikan Dengan</h3>
                <p className="text-sm text-muted-foreground">
                  {share.email}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Level Akses</h3>
                <div className="mt-1">
                  {getAccessLevelBadge(share.access_level)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {share.access_level === "view" 
                      ? "Anda hanya dapat melihat dokumen ini." 
                      : share.access_level === "comment" 
                        ? "Anda dapat melihat dan mengomentari dokumen ini." 
                        : "Anda dapat melihat, mengomentari, dan mengedit dokumen ini."}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Tanggal Berbagi</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(share.created_at)}
                </p>
              </div>
              
              {share.expires_at && (
                <div>
                  <h3 className="text-sm font-medium">Tanggal Kedaluwarsa</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(share.expires_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
