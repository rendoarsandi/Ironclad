
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { TemplateForm } from "@/components/templates/template-form";
import type { ContractTemplate } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilePlus2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-context";

const fetchMockTemplate = (id: string): Promise<ContractTemplate | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (id === 't1') {
        resolve({ id: "t1", name: "Standard Freelance Agreement", createdBy: "Admin User", createDate: new Date(2023, 8, 10).toISOString(), lastModified: new Date(2023, 9, 1).toISOString(), content: "This is the initial content for the Standard Freelance Agreement. It includes clauses for scope, payment, and termination." });
      } else {
        resolve(null);
      }
    }, 500);
  });
};

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();


  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    if (templateId && user?.role === 'admin') {
      setIsLoading(true);
      fetchMockTemplate(templateId).then(data => {
        setTemplate(data);
        setIsLoading(false);
      });
    }
  }, [templateId, user, authLoading, router]);


  const handleUpdateSuccess = (updatedTemplate: ContractTemplate) => {
    console.log("Template updated:", updatedTemplate);
    // Navigation is handled within TemplateForm for this mock
  };
  
  if (isLoading || authLoading) {
    return <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || user.role !== 'admin') {
     return <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center"><p>Unauthorized.</p></div>;
  }

  if (!template) {
     return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.16))]">
        <FilePlus2 className="h-24 w-24 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Template Not Found</h2>
        <p className="text-muted-foreground mb-6">The template you are looking for does not exist.</p>
        <Button onClick={() => router.push('/dashboard/templates')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Contract Template</CardTitle>
          <CardDescription>Modify the details of &quot;{template.name}&quot;.</CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm initialData={template} onSubmitSuccess={handleUpdateSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
