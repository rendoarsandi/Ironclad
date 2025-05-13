
"use client";

import { TemplateForm } from "@/components/templates/template-form";
import type { ContractTemplate } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { useEffect } from "react";

export default function NewTemplatePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || (user && user.role !== 'admin')) {
    return <div className="flex justify-center items-center h-64"><p>Loading or unauthorized...</p></div>;
  }
  
  const handleCreateSuccess = (newTemplate: ContractTemplate) => {
    console.log("Template created:", newTemplate);
    // Navigation is handled within TemplateForm for this mock
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Contract Template</CardTitle>
          <CardDescription>Design a reusable structure for your contracts.</CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm onSubmitSuccess={handleCreateSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
