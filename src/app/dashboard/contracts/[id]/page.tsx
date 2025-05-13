
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Download, FileText, Clock, CheckCircle, Pen, Share2, History, Eye, PlayCircle, Search, AlertTriangle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SignaturePad } from "@/components/signature/signature-pad";
import { Separator } from "@/components/ui/separator";
import { ContractSummaryCard } from '@/components/contracts/contract-summary-card';
import { ClauseExtraction } from '@/components/ai/clause-extraction';
import { RiskDetection } from '@/components/ai/risk-detection';
import { CommentList } from '@/components/comments/comment-list';
import { ShareDocumentDialog } from '@/components/contracts/share-document-dialog';
import { format } from 'date-fns';
import type { Contract } from '@/types';

interface ContractData {
  id: string;
  title: string;
  type: string;
  status: string;
  content: string;
  version: number;
  created_by: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  metadata: {
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
    tags: string[];
  };
}

interface SignatureData {
  id: string;
  user_id: string;
  signature_image_url: string;
  signed_at: string;
}

// Mock data for a single contract
const fetchMockContract = (id: string): Promise<Contract | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (id === 'c1') {
        resolve({ id: "c1", name: "Master Service Agreement", uploadedBy: "Alice Wonderland", uploadDate: new Date(2023, 10, 15).toISOString(), status: "active", version: 2, filePath: "contracts/msa.pdf", summary: "This Master Service Agreement (MSA) outlines the terms and conditions for services provided by Party A to Party B, covering scope, payment, confidentiality, and termination clauses. It is effective from November 15, 2023." });
      } else if (id === 'c2') {
        resolve({ id: "c2", name: "Non-Disclosure Agreement", uploadedBy: "Bob The Builder", uploadDate: new Date(2023, 11, 1).toISOString(), status: "pending_review", version: 1, filePath: "contracts/nda.pdf" });
      } else {
        resolve(null);
      }
    }, 500);
  });
};

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | ContractData | null>(null);
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signature, setSignature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("preview");

  // Load contract data
  useEffect(() => {
    if (authLoading) return;

    const loadContract = async () => {
      setIsLoading(true);

      try {
        // First try to load from Supabase
        if (user) {
          const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', contractId)
            .single();

          if (!error && data) {
            setContract(data as ContractData);

            // Load signatures
            const { data: signaturesData, error: signaturesError } = await supabase
              .from('signatures')
              .select('*')
              .eq('contract_id', contractId)
              .order('signed_at', { ascending: false });

            if (!signaturesError) {
              setSignatures(signaturesData as SignatureData[]);
            }

            setIsLoading(false);
            return;
          }
        }

        // Fallback to mock data if Supabase fails or user is not logged in
        const mockData = await fetchMockContract(contractId);
        setContract(mockData);
      } catch (error) {
        console.error('Error loading contract:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data dokumen. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContract();
  }, [contractId, user, authLoading, toast]);

  // Handle signature change
  const handleSignatureChange = (newSignature: string | null) => {
    setSignature(newSignature);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft</Badge>;
      case "signed":
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktif</Badge>;
      case "pending":
      case "pending_review":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Menunggu Review</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Kedaluwarsa</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status.replace("_", " ")}</Badge>;
    }
  };

  // Check if user has signed
  const hasUserSigned = () => {
    return signatures.some(sig => sig.user_id === user?.id);
  };

  // Handle download document
  const handleDownload = () => {
    if (!contract) return;

    // For ContractData type
    if ('metadata' in contract && contract.metadata?.file_url) {
      window.open(contract.metadata.file_url, '_blank');
    }
    // For Contract type
    else if ('filePath' in contract && contract.filePath) {
      // This is just a mock, in a real app you would have a proper URL
      toast({
        title: "Download",
        description: `Downloading ${contract.name || 'document'}...`,
      });
    }
  };

  const handleSummaryGenerated = (summary: string) => {
    if (contract && 'summary' in contract) {
      setContract({ ...contract, summary });
    }
  };

  const handleStartReview = () => {
    if (!contract) return;

    if ('status' in contract) {
      // For Contract type
      setContract({...contract, status: 'pending_review'});
      toast({
        title: "Review Dimulai",
        description: `Kontrak "${contract.name}" sekarang sedang dalam review.`
      });
    } else {
      // For ContractData type
      supabase
        .from('contracts')
        .update({ status: 'pending' })
        .eq('id', contract.id)
        .then(() => {
          setContract({...contract, status: 'pending'});
          toast({
            title: "Review Dimulai",
            description: `Dokumen "${contract.title}" sekarang sedang dalam review.`
          });
        })
        .catch(error => {
          console.error('Error updating contract status:', error);
          toast({
            title: "Error",
            description: "Gagal memperbarui status dokumen.",
            variant: "destructive",
          });
        });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/contracts">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Dokumen Tidak Ditemukan</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Dokumen yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle different contract types
  const contractTitle = 'title' in contract ? contract.title : contract.name;
  const contractStatus = contract.status;
  const contractVersion = contract.version;
  const contractDate = 'created_at' in contract ? contract.created_at : contract.uploadDate;
  const fileUrl = 'metadata' in contract && contract.metadata ? contract.metadata.file_url : null;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/contracts">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{contractTitle}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(contractStatus)}
              <span className="text-sm text-muted-foreground">
                Versi {contractVersion} - {formatDate(contractDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Unduh
          </Button>
          <ShareDocumentDialog contractId={params.id} contractTitle={contractTitle}>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" /> Bagikan
            </Button>
          </ShareDocumentDialog>
          {contractStatus === 'draft' && (
            <Button onClick={handleStartReview} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlayCircle className="mr-2 h-4 w-4" /> Mulai Review
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="preview" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" /> Pratinjau
              </TabsTrigger>
              <TabsTrigger value="sign">
                <Pen className="mr-2 h-4 w-4" /> Tanda Tangan
              </TabsTrigger>
              <TabsTrigger value="summary">
                <FileText className="mr-2 h-4 w-4" /> Ringkasan
              </TabsTrigger>
              <TabsTrigger value="clauses">
                <Search className="mr-2 h-4 w-4" /> Klausa
              </TabsTrigger>
              <TabsTrigger value="risks">
                <AlertTriangle className="mr-2 h-4 w-4" /> Risiko
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageSquare className="mr-2 h-4 w-4" /> Komentar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  {fileUrl ? (
                    <iframe
                      src={fileUrl}
                      className="w-full h-[70vh] border-0"
                      title={contractTitle}
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

            <TabsContent value="sign" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tanda Tangani Dokumen</CardTitle>
                  <CardDescription>
                    Buat tanda tangan Anda untuk dokumen ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasUserSigned() ? (
                    <div className="text-center py-6">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Dokumen Telah Ditandatangani</h3>
                      <p className="text-muted-foreground mt-2">
                        Anda telah menandatangani dokumen ini pada{" "}
                        {formatDate(signatures.find(sig => sig.user_id === user?.id)?.signed_at || "")}
                      </p>
                    </div>
                  ) : (
                    <SignaturePad
                      onSignatureChange={handleSignatureChange}
                      contractId={contractId}
                      saveToDatabase={true}
                      className="w-full"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              {'summary' in contract && (
                <ContractSummaryCard
                  contract={contract as Contract}
                  onSummaryGenerated={handleSummaryGenerated}
                />
              )}
              {'content' in contract && (
                <Card>
                  <CardHeader>
                    <CardTitle>Deskripsi Dokumen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{contract.content || "Tidak ada deskripsi untuk dokumen ini."}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="clauses" className="space-y-4">
              <ClauseExtraction
                documentUrl={'metadata' in contract && contract.metadata ? contract.metadata.file_url : ''}
                documentName={contractTitle}
              />
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <RiskDetection
                documentUrl={'metadata' in contract && contract.metadata ? contract.metadata.file_url : ''}
                documentName={contractTitle}
              />
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <CommentList contractId={params.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detail Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {'metadata' in contract && contract.metadata ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium">Nama File</h3>
                    <p className="text-sm text-muted-foreground">
                      {contract.metadata.file_name || "Tidak tersedia"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Ukuran</h3>
                    <p className="text-sm text-muted-foreground">
                      {contract.metadata.file_size
                        ? `${(contract.metadata.file_size / 1024 / 1024).toFixed(2)} MB`
                        : "Tidak tersedia"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Tipe</h3>
                    <p className="text-sm text-muted-foreground">
                      {contract.metadata.file_type || "Tidak tersedia"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Tag</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contract.metadata.tags && contract.metadata.tags.length > 0 ? (
                        contract.metadata.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Tidak ada tag</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {'uploadedBy' in contract && (
                    <div>
                      <h3 className="text-sm font-medium">Diunggah Oleh</h3>
                      <p className="text-sm text-muted-foreground">{contract.uploadedBy}</p>
                    </div>
                  )}

                  {'filePath' in contract && (
                    <div>
                      <h3 className="text-sm font-medium">Lokasi File</h3>
                      <p className="text-sm text-muted-foreground">{contract.filePath || "Tidak tersedia"}</p>
                    </div>
                  )}
                </>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-medium">Deskripsi</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {'content' in contract ? (contract.content || "Tidak ada deskripsi") :
                   'summary' in contract ? (contract.summary || "Tidak ada ringkasan") :
                   "Tidak ada deskripsi"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Tanda Tangan</CardTitle>
            </CardHeader>
            <CardContent>
              {signatures.length === 0 ? (
                <div className="text-center py-4">
                  <Pen className="h-8 w-8 text-muted-foreground opacity-20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada tanda tangan untuk dokumen ini
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {signatures.map((sig, index) => (
                    <div key={sig.id} className="relative">
                      {index > 0 && <Separator className="my-4" />}
                      <div>
                        <p className="text-sm font-medium">
                          {sig.user_id === user?.id ? "Anda" : "Pengguna lain"}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Ditandatangani pada {formatDate(sig.signed_at)}
                        </p>
                        <div className="border rounded-md p-2 bg-white">
                          <img
                            src={sig.signature_image_url}
                            alt="Tanda tangan"
                            className="max-h-16 object-contain"
                          />
                        </div>
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
