"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Upload, Plus, Trash2, Mail, User, Calendar } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DocumentUpload } from "@/components/contracts/document-upload";
import { supabase } from "@/lib/supabase";
import { sendSignatureRequestEmail } from "@/lib/email";

// Form schema
const signatureRequestSchema = z.object({
  title: z.string().min(1, "Judul diperlukan"),
  message: z.string().optional(),
  signers: z.array(
    z.object({
      name: z.string().min(1, "Nama diperlukan"),
      email: z.string().email("Alamat email tidak valid"),
    })
  ).min(1, "Minimal satu penandatangan diperlukan"),
  expiresAt: z.string().optional(),
});

type SignatureRequestFormValues = z.infer<typeof signatureRequestSchema>;

export default function RequestSignaturePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<SignatureRequestFormValues>({
    resolver: zodResolver(signatureRequestSchema),
    defaultValues: {
      title: "",
      message: "",
      signers: [{ name: "", email: "" }],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    },
  });

  // Setup field array for signers
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "signers",
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
  const onSubmit = async (data: SignatureRequestFormValues) => {
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
        type: "signature_request",
        status: "pending",
        content: data.message || "",
        version: 1,
        created_by: user.id,
        organization_id: user.organization_id || null,
        metadata: {
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          signers: data.signers,
          expires_at: data.expiresAt,
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

      // Send email to each signer
      for (const signer of data.signers) {
        const signatureLink = `${window.location.origin}/dashboard/signature/${contract.id}`;
        
        await sendSignatureRequestEmail(
          signer.email,
          data.title,
          user.name || user.email || "Pengguna KontrakPro",
          signatureLink,
          data.message
        );
      }

      toast({
        title: "Berhasil",
        description: "Permintaan tanda tangan telah dikirim",
      });

      // Redirect to signature page
      router.push("/dashboard/signature");
    } catch (error) {
      console.error("Error creating signature request:", error);
      toast({
        title: "Error",
        description: "Gagal membuat permintaan tanda tangan. Silakan coba lagi.",
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
        <h1 className="text-2xl font-bold tracking-tight">Buat Permintaan Tanda Tangan</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Permintaan</CardTitle>
                  <CardDescription>
                    Masukkan informasi tentang permintaan tanda tangan
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
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pesan untuk Penandatangan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan pesan untuk penandatangan (opsional)"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Pesan ini akan disertakan dalam email yang dikirim ke penandatangan.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Kedaluwarsa</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Permintaan tanda tangan akan kedaluwarsa pada tanggal ini.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Penandatangan</h3>
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-3 p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Penandatangan {index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name={`signers.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Nama</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <Input placeholder="Masukkan nama" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`signers.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Email</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <Input placeholder="Masukkan email" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => append({ name: "", email: "" })}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Tambah Penandatangan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !fileUrl}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                  </>
                ) : (
                  "Kirim Permintaan Tanda Tangan"
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
        </div>
      </div>
    </div>
  );
}
