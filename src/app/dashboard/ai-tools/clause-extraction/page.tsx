
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, SearchCheck, FileText, UploadCloud, ListChecks, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractContractClauses, type ExtractContractClausesOutput } from "@/ai/flows/clause-extraction-flow";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ClauseExtractionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [clausesInput, setClausesInput] = useState<string>("Indemnification, Limitation of Liability, Governing Law");
  const [isLoading, setIsLoading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractContractClausesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setExtractionResult(null); // Reset previous results
      setError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a contract document to analyze.",
        variant: "destructive",
      });
      return;
    }
    const clausesToExtract = clausesInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
    if (clausesToExtract.length === 0) {
      toast({
        title: "No Clauses Specified",
        description: "Please enter at least one clause type to extract (comma-separated).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExtractionResult(null);
    setError(null);

    try {
      const contractDataUri = await fileToDataUri(file);
      const result = await extractContractClauses({ contractDataUri, clausesToExtract });
      setExtractionResult(result);
      toast({
        title: "Clauses Extracted",
        description: result.summaryMessage || "AI clause extraction has been processed.",
      });
    } catch (err) {
      console.error("Error extracting clauses:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during clause extraction.";
      setError(errorMessage);
      toast({
        title: "Clause Extraction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/ai-tools" passHref>
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Tools
        </Button>
      </Link>

      <Card className="shadow-xl border-border/30">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <SearchCheck className="mr-3 h-7 w-7 text-blue-500" />
            Contract Clause Extraction
          </CardTitle>
          <CardDescription>
            Upload a contract and specify clause types to extract their full text.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="contract-file-extract" className="text-base">Contract Document</Label>
              <div className="mt-2 flex items-center justify-center w-full">
                 <label
                  htmlFor="contract-file-extract"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 5MB)</p>
                  </div>
                  <Input
                    id="contract-file-extract"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>
              {fileName && <p className="mt-2 text-sm text-center text-muted-foreground">Selected file: {fileName}</p>}
            </div>

            <div>
              <Label htmlFor="clauses-to-extract" className="text-base">Clauses to Extract</Label>
              <p className="text-sm text-muted-foreground mb-1">Enter clause types, separated by commas (e.g., Indemnification, Term, Payment Terms).</p>
              <Input
                id="clauses-to-extract"
                value={clausesInput}
                onChange={(e) => setClausesInput(e.target.value)}
                placeholder="e.g., Indemnification, Limitation of Liability"
                className="text-base"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading || !file || clausesInput.trim().length === 0}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ListChecks className="mr-2 h-4 w-4" />
              )}
              Extract Clauses
            </Button>
          </form>

          {isLoading && (
            <div className="mt-8 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
              <p className="mt-2 text-muted-foreground">Extracting clauses, please wait...</p>
            </div>
          )}

          {error && (
             <Card className="mt-8 bg-destructive/10 border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/>Extraction Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive-foreground">{error}</p>
              </CardContent>
            </Card>
          )}

          {extractionResult && !isLoading && !error && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-500" /> Extracted Clauses Report
                </CardTitle>
                <CardDescription>{extractionResult.summaryMessage}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {extractionResult.extractedClauses.length > 0 ? (
                  extractionResult.extractedClauses.map((clause, index) => (
                    <Card key={index} className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {clause.clauseType}
                          {clause.pageReference && clause.pageReference !== "N/A" && (
                            <Badge variant="secondary">Ref: {clause.pageReference}</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{clause.extractedText}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground">No clauses were extracted based on your input.</p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
