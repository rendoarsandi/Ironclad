
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FilePlus2, Eye, Edit3, Trash2, PlusCircle, FileText, Wand2 } from "lucide-react";
import type { ContractTemplate } from "@/types";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const mockTemplatesData: ContractTemplate[] = [
  { id: "t1", name: "Standard Freelance Agreement", createdBy: "Admin User", createDate: new Date(2023, 8, 10).toISOString(), lastModified: new Date(2023, 9, 1).toISOString(), content: "This is the **Standard Freelance Agreement** content. It includes clauses for scope of work, payment terms, and confidentiality." },
  { id: "t2", name: "Service Level Agreement (SLA)", createdBy: "Admin User", createDate: new Date(2023, 7, 1).toISOString(), lastModified: new Date(2023, 10, 5).toISOString(), content: "This **Service Level Agreement (SLA)** outlines the expected service standards, metrics, and remedies." },
  { id: "t3", name: "Mutual Non-Disclosure Agreement", createdBy: "Admin User", createDate: new Date(2024, 0, 15).toISOString(), lastModified: new Date(2024, 0, 15).toISOString(), content: "This **Mutual Non-Disclosure Agreement (NDA)** is for protecting confidential information shared between two parties." },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
      router.replace('/dashboard');
      return;
    }
    // Simulate fetching templates
    setTimeout(() => {
      setTemplates(mockTemplatesData);
      setIsLoading(false);
    }, 700);
  }, [user, router, toast]);

  const handleUseTemplate = (templateId: string) => {
    // Navigate to a new contract page, passing the template ID to pre-fill the content.
    // This assumes a page like /dashboard/contracts/new can handle a ?templateId= query param.
    router.push(`/dashboard/contracts/new?templateId=${templateId}`);
     toast({
        title: "Loading Template",
        description: `Creating a new contract using template ${templateId}.`,
      });
  };

  // Placeholder for delete functionality
  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    // Here you would typically show a confirmation dialog
    // and then make an API call to delete the template.
    // For now, we'll just filter it from the mock data and show a toast.
    if (confirm(`Are you sure you want to delete the template "${templateName}"? This action cannot be undone.`)) {
      setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateId));
      toast({
        title: "Template Deleted",
        description: `Template "${templateName}" has been deleted.`,
        variant: "destructive"
      });
    }
  };


  if (isLoading || (user && user.role !== 'admin')) {
     return (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /> 
            <p className="text-lg text-muted-foreground">Loading templates...</p>
        </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Templates</h1>
          <p className="text-muted-foreground">Manage reusable contract templates for your organization.</p>
        </div>
        <Link href="/dashboard/templates/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Template
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Template Library</CardTitle>
          <CardDescription>
            {templates.length > 0 ? `Showing ${templates.length} templates.` : "No templates found. Create your first template!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Created By</TableHead>
                  <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/templates/${template.id}/edit`} className="hover:underline text-primary">
                        {template.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{template.createdBy}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(template.lastModified), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUseTemplate(template.id)}>
                            <Wand2 className="mr-2 h-4 w-4 text-green-500" /> Use Template
                          </DropdownMenuItem>
                           <DropdownMenuItem asChild>
                             <Link href={`/dashboard/templates/${template.id}/edit`}> 
                               <Edit3 className="mr-2 h-4 w-4" /> Edit
                             </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled> 
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id, template.name)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-16">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground/70" /> 
              <h3 className="mt-4 text-xl font-semibold text-foreground">No Templates Available</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get started by creating a new contract template.</p>
              <Link href="/dashboard/templates/new" className="mt-6">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create First Template
                </Button>
            </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
