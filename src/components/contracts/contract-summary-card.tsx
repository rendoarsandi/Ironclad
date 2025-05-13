"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Sparkles, AlertTriangle, FileText, Users, CalendarDays, Landmark, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { summarizeContract } from "@/ai/flows/contract-summarization";
import type { Contract } from "@/types";

// Define the structure for a more detailed summary
interface StructuredSummary {
  overallSummary: string;
  keyClauses?: Array<{ title: string; text: string; riskLevel?: 'high' | 'medium' | 'low' }>;
  involvedParties?: Array<{ name: string; role: string }>;
  effectiveDate?: string;
  expirationDate?: string;
  contractValue?: string;
  governingLaw?: string;
  // Add any other fields you expect from the AI
}

interface ContractSummaryCardProps {
  contract: Contract;
  onSummaryGenerated: (summary: string | StructuredSummary) => void; // Callback to update parent state with new summary type
}

// Helper function to convert File to Data URI (remains the same)
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to fetch a file object for summarization (remains the same)
async function getFileObject(contract: Contract): Promise<File | null> {
  if (contract.fileUrl) {
    if (contract.fileUrl.startsWith('blob:')) {
      try {
        const response = await fetch(contract.fileUrl);
        const blob = await response.blob();
        return new File([blob], contract.name, { type: blob.type || 'application/octet-stream' });
      } catch (error) {
        console.error("Error fetching blob URL for summarization:", error);
      }
    }
  }
  const fileName = contract.name || "contract_document";
  const fileExtension = contract.filePath?.split('.').pop() || "txt";
  const mimeType = `text/plain`;
  const dummyContent = `This is a mock contract document for ${fileName}.${fileExtension}. It outlines various terms and conditions. Content is for summarization testing purposes. Document path: ${contract.filePath || 'N/A'}`;
  const blob = new Blob([dummyContent], { type: mimeType });
  return new File([blob], `${fileName}.${fileExtension}`, { type: mimeType });
}


export function ContractSummaryCard({ contract, onSummaryGenerated }: ContractSummaryCardProps) {
  // The summary can now be a string or a StructuredSummary object
  const [summary, setSummary] = useState<string | StructuredSummary | null>(contract.summary || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // If contract.summary changes from parent, update local state
    setSummary(contract.summary || null);
  }, [contract.summary]);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);

    const fileToSummarize = await getFileObject(contract);

    if (!fileToSummarize) {
      toast({
        title: "File Not Available",
        description: "Could not retrieve the contract file for summarization.",
        variant: "destructive",
      });
      setError("Could not retrieve the contract file for summarization.");
      setIsLoading(false);
      return;
    }

    try {
      const contractDataUri = await fileToDataUri(fileToSummarize);
      // IMPORTANT: Assuming summarizeContract now returns a StructuredSummary or a string as fallback
      const result = await summarizeContract({ contractDataUri }); // This is the AI call
      
      if (result && (result.summary || result.overallSummary)) { // Check for simple string or structured summary
        const newSummary = typeof result.summary === 'string' ? result.summary : result; // Adapt based on actual AI output
        setSummary(newSummary as string | StructuredSummary); 
        onSummaryGenerated(newSummary as string | StructuredSummary);
        toast({
          title: "Summary Generated",
          description: "AI-powered summary is now available.",
        });
      } else {
        throw new Error("Summary generation returned an empty or invalid result.");
      }
    } catch (err) {
      console.error("Error generating summary:", err);
      let detailedMessage = "An unknown error occurred.";
      if (err instanceof Error) {
        detailedMessage = err.message;
        if (err.name === 'TypeError' && err.message.toLowerCase().includes('failed to fetch')) {
          detailedMessage = "Could not connect to the AI service. Please check your internet connection and API key.";
        }
      }
      setError(`Failed to generate summary: ${detailedMessage}`);
      toast({
        title: "Summarization Failed",
        description: detailedMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRiskBadge = (riskLevel?: 'high' | 'medium' | 'low') => {
    if (!riskLevel) return null;
    let variant: "default" | "destructive" | "secondary" | "outline" = "secondary";
    if (riskLevel === 'high') variant = 'destructive';
    if (riskLevel === 'medium') variant = 'outline'; // Or choose another appropriate color like warning
    return <Badge variant={variant} className="ml-2 capitalize">{riskLevel} Risk</Badge>;
  };

  const renderStructuredSummary = (structuredData: StructuredSummary) => (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none dark:prose-invert rounded-md border bg-muted/20 p-4">
        <h4 className="font-semibold text-lg mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Overall Summary</h4>
        <p>{structuredData.overallSummary}</p>
      </div>

      {structuredData.involvedParties && structuredData.involvedParties.length > 0 && (
        <div className="p-4 border rounded-md bg-muted/20">
          <h4 className="font-semibold text-lg mb-2 flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Involved Parties</h4>
          <ul className="list-disc list-inside space-y-1">
            {structuredData.involvedParties.map((party, index) => (
              <li key={index}><strong>{party.name}</strong> ({party.role})</li>
            ))}
          </ul>
        </div>
      )}

      {(structuredData.effectiveDate || structuredData.expirationDate || structuredData.contractValue || structuredData.governingLaw) && (
         <div className="grid md:grid-cols-2 gap-4">
            {structuredData.effectiveDate && (
                <Card className="bg-muted/10">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-primary"/>Effective Date</CardTitle></CardHeader>
                    <CardContent><p>{structuredData.effectiveDate}</p></CardContent>
                </Card>
            )}
            {structuredData.expirationDate && (
                <Card className="bg-muted/10">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-red-500"/>Expiration Date</CardTitle></CardHeader>
                    <CardContent><p>{structuredData.expirationDate}</p></CardContent>
                </Card>
            )}
            {structuredData.contractValue && (
                <Card className="bg-muted/10">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center"><Landmark className="mr-2 h-4 w-4 text-primary"/>Contract Value</CardTitle></CardHeader>
                    <CardContent><p>{structuredData.contractValue}</p></CardContent>
                </Card>
            )}
            {structuredData.governingLaw && (
                <Card className="bg-muted/10">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center"><Scale className="mr-2 h-4 w-4 text-primary"/>Governing Law</CardTitle></CardHeader>
                    <CardContent><p>{structuredData.governingLaw}</p></CardContent>
                </Card>
            )}
        </div>
      )}

      {structuredData.keyClauses && structuredData.keyClauses.length > 0 && (
        <div className="p-4 border rounded-md bg-muted/20">
          <h4 className="font-semibold text-lg mb-3 flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary" />Key Clauses</h4>
          <Accordion type="single" collapsible className="w-full">
            {structuredData.keyClauses.map((clause, index) => (
              <AccordionItem value={`clause-${index}`} key={index} className="border-b border-border/60">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span>{clause.title}</span>
                    {renderRiskBadge(clause.riskLevel)}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="prose prose-sm max-w-none dark:prose-invert pt-2 pb-4">
                  {clause.text}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );

  const renderSimpleSummary = (textSummary: string) => (
    <div className="prose prose-sm max-w-none dark:prose-invert rounded-md border bg-muted/30 p-4">
      <p>{textSummary}</p>
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
            AI Contract Insights
          </CardTitle>
          {!summary && !isLoading && (
            <Button onClick={handleGenerateSummary} size="sm" variant="outline" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Sparkles className="mr-2 h-4 w-4" /> Generate Insights
            </Button>
          )}
        </div>
        <CardDescription>
          Key information and clauses automatically extracted from the contract by AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p>Generating insights, please wait...</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="text-destructive flex items-center py-4">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && summary && (
          typeof summary === 'string' ? renderSimpleSummary(summary) : renderStructuredSummary(summary)
        )}
        {!isLoading && !error && !summary && (
          <p className="text-muted-foreground py-4">
            No insights available. Click &quot;Generate Insights&quot; to create them.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
