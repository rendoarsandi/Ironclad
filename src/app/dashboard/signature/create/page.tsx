"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Upload, Plus, Trash2, Mail, User, Calendar } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form schema
const signatureRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().optional(),
  signers: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
    })
  ).min(1, "At least one signer is required"),
});

type SignatureRequestFormValues = z.infer<typeof signatureRequestSchema>;

export default function CreateSignatureRequestPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form
  const form = useForm<SignatureRequestFormValues>({
    resolver: zodResolver(signatureRequestSchema),
    defaultValues: {
      title: "",
      message: "",
      signers: [{ name: "", email: "" }],
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // Add a new signer
  const addSigner = () => {
    const currentSigners = form.getValues("signers");
    form.setValue("signers", [...currentSigners, { name: "", email: "" }]);
  };

  // Remove a signer
  const removeSigner = (index: number) => {
    const currentSigners = form.getValues("signers");
    if (currentSigners.length > 1) {
      form.setValue(
        "signers",
        currentSigners.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Cannot remove",
        description: "At least one signer is required",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (data: SignatureRequestFormValues) => {
    if (!selectedFile) {
      toast({
        title: "File required",
        description: "Please upload a document to send for signature",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Signature request sent",
        description: `Signature request for "${data.title}" has been sent to ${data.signers.length} recipient(s)`,
      });
      setIsUploading(false);
      router.push("/dashboard/signature");
    }, 2000);
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Signature Request</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Document</CardTitle>
                  <CardDescription>
                    Upload the document you want to be signed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                      {selectedFile ? (
                        <div className="text-center">
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => setSelectedFile(null)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop your file here, or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Supported formats: PDF, DOCX, DOC (Max 10MB)
                          </p>
                          <Button variant="outline" asChild>
                            <label>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx,.doc"
                                onChange={handleFileChange}
                              />
                              Browse Files
                            </label>
                          </Button>
                        </>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter document title" {...field} />
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
                          <FormLabel>Message to Recipients</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter a message for the recipients"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This message will be included in the email sent to signers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Signers</CardTitle>
                  <CardDescription>
                    Add people who need to sign this document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.getValues("signers").map((_, index) => (
                    <div key={index} className="space-y-3">
                      {index > 0 && <Separator />}
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Signer {index + 1}</h3>
                        {form.getValues("signers").length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSigner(index)}
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
                            <FormLabel className="text-xs">Name</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                <Input placeholder="Enter name" {...field} />
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
                                <Input placeholder="Enter email" {...field} />
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
                    onClick={addSigner}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Another Signer
                  </Button>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      "Send for Signature"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
