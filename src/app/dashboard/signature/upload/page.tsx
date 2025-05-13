"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { DocumentUpload } from "@/components/contracts/document-upload";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form schema
const documentSchema = z.object({
  title: z.string().min(1, "Judul dokumen diperlukan"),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function UploadDocumentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  // Handle document upload complete
  const handleUploadComplete = (url: string, name: string, type: string, size: number) => {
    setFileUrl(url);
    setFileName(name);
    setFileType(type);
    setFileSize(size);
    
    // Auto-fill title with file name (without extension)
    const titleWithoutExtension = name.split('.').slice(0, -1).join('.');
    form.setValue("title", titleWithoutExtension);
  };

  // Handle form submission
  const onSubmit = async (data: DocumentFormValues) => {
    if (!user || !fileUrl) {
      toast({
        title: "Error",
        description: "Anda harus login dan mengunggah dokumen terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create document record in database
      const documentData = {
        title: data.title,
        type: "document", // You can have different types like "contract", "agreement", etc.
        status: "draft",
        content: data.description || "",
        version: 1,
        created_by: user.id,
        organization_id: user.organization_id || null,
        metadata: {
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        }
      };

      const { data: contract, error } = await supabase
        .from('contracts')
        .insert(documentData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Berhasil",
        description: "Dokumen telah diunggah dan disimpan",
      });

      // Redirect to document page
      router.push(`/dashboard/contracts/${contract.id}`);
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan dokumen. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-2xl font-bold tracking-tight">Unggah Dokumen</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Dokumen</CardTitle>
                  <CardDescription>
                    Masukkan informasi tentang dokumen yang Anda unggah
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Dokumen</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan judul dokumen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan deskripsi dokumen (opsional)"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Deskripsi singkat tentang dokumen ini
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan tag, dipisahkan dengan koma"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Contoh: kontrak, perjanjian, nda
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !fileUrl}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Dokumen"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <DocumentUpload
            onUploadComplete={handleUploadComplete}
            acceptedFileTypes={[".pdf", ".docx", ".doc"]}
            maxSizeMB={10}
            buttonText="Unggah Dokumen"
            showPreview={true}
            className="sticky top-6"
          />

          {fileUrl && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Status Dokumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-green-600">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">Dokumen telah diunggah</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Silakan lengkapi detail dokumen dan klik Simpan
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
