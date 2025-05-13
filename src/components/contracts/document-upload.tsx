"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, File, X, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth-context";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadProps {
  onUploadComplete?: (fileUrl: string, fileName: string, fileType: string, fileSize: number) => void;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
  buttonText?: string;
  showPreview?: boolean;
  className?: string;
}

export function DocumentUpload({
  onUploadComplete,
  acceptedFileTypes = [".pdf", ".docx", ".doc"],
  maxSizeMB = 10,
  buttonText = "Unggah Dokumen",
  showPreview = true,
  className = "",
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: `Ukuran file maksimal adalah ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const fileExtension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFileTypes.includes(fileExtension) && acceptedFileTypes.length > 0) {
      toast({
        title: "Format file tidak didukung",
        description: `Format yang didukung: ${acceptedFileTypes.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Create preview for PDF
    if (fileExtension === ".pdf" && showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file name
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const filePath = `documents/${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('contracts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          },
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);

      // Call the callback with the file URL
      if (onUploadComplete) {
        onUploadComplete(
          urlData.publicUrl,
          file.name,
          file.type,
          file.size
        );
      }

      toast({
        title: "Berhasil",
        description: "Dokumen telah diunggah",
      });

      // Reset the form
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Gagal mengunggah",
        description: "Terjadi kesalahan saat mengunggah dokumen. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Clear selected file
  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Unggah Dokumen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Mengunggah... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {showPreview && previewUrl && (
              <div className="border rounded-md p-2 mt-4">
                <iframe
                  src={previewUrl}
                  className="w-full h-[300px]"
                  title="Document Preview"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Seret dan lepas file di sini, atau klik untuk memilih
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Format yang didukung: {acceptedFileTypes.join(", ")} (Maks {maxSizeMB}MB)
            </p>
            <Button variant="outline" asChild>
              <Label htmlFor="file-upload" className="cursor-pointer">
                Pilih File
              </Label>
            </Button>
            <Input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={acceptedFileTypes.join(",")}
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        )}
      </CardContent>
      {file && (
        <CardFooter>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunggah...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> {buttonText}
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
