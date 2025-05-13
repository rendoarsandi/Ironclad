"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Placeholder for Rich Text Editor
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import type { ContractTemplate } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth-context";

const templateSchema = z.object({
  name: z.string().min(3, { message: "Template name must be at least 3 characters." }),
  content: z.string().min(10, { message: "Template content cannot be empty." }),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  initialData?: ContractTemplate | null;
  onSubmitSuccess: (template: ContractTemplate) => void;
}

export function TemplateForm({ initialData, onSubmitSuccess }: TemplateFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      content: initialData.content,
    } : {
      name: "",
      content: "",
    },
  });

  async function onSubmit(values: TemplateFormValues) {
    setIsLoading(true);
    
    if (!user || (initialData === null && user.role !== 'admin')) {
       toast({
        title: "Authorization Error",
        description: "You are not authorized to perform this action.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentDate = new Date().toISOString();
    const createdByAdmin = user.name || user.email;

    const templateData: ContractTemplate = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name: values.name,
      content: values.content,
      createdBy: initialData?.createdBy || createdByAdmin,
      createDate: initialData?.createDate || currentDate,
      lastModified: currentDate,
    };

    console.log("Saving template:", templateData);
    onSubmitSuccess(templateData);
    
    toast({
      title: initialData ? "Template Updated" : "Template Created",
      description: `Template "${values.name}" has been successfully saved.`,
    });
    setIsLoading(false);
    router.push("/dashboard/templates");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Standard Freelance Agreement" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter contract template content here. Use placeholders like {{client_name}}, {{project_scope}}, etc. This is a placeholder for a Rich Text Editor."
                  className="min-h-[300px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {initialData ? "Save Changes" : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
