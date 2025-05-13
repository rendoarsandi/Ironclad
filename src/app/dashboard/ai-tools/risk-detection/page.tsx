
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2, AlertTriangle, UploadCloud, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { detectContractRisks, type DetectContractRisksOutput } from "@/ai/flows/risk-detection-flow";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function RiskDetectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [riskAnalysisResult, setRiskAnalysisResult] = useState<DetectContractRisksOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setRiskAnalysisResult(null); // Reset previous results
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

    setIsLoading(true);
    setRiskAnalysisResult(null);
    setError(null);

    try {
      const contractDataUri = await fileToDataUri(file);
      const result = await detectContractRisks({ contractDataUri });
      setRiskAnalysisResult(result);
      toast({
        title: "Risk Analysis Processed",
        description: "AI risk assessment has been generated.",
      });
    } catch (err) {
      console.error("Error detecting risks:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during risk analysis.";
      setError(errorMessage);
      toast({
        title: "Risk Analysis Failed",
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
            <Wand2 className="mr-3 h-7 w-7 text-purple-500" />
            Contract Risk Detection
          </CardTitle>
          <CardDescription>
            Upload a contract document to automatically identify potential risks and problematic clauses.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="contract-file-risk" className="text-base">Contract Document</Label>
              <div className="mt-2 flex items-center justify-center w-full">
                <label
                  htmlFor="contract-file-risk"
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
                    id="contract-file-risk"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>
              {fileName && <p className="mt-2 text-sm text-center text-muted-foreground">Selected file: {fileName}</p>}
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading || !file}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Analyze for Risks
            </Button>
          </form>

          {isLoading && (
            <div className="mt-8 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-500" />
              <p className="mt-2 text-muted-foreground">Analyzing contract, please wait...</p>
            </div>
          )}

          {error && (
            <Card className="mt-8 bg-destructive/10 border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/>Analysis Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive-foreground">{error}</p>
              </CardContent>
            </Card>
          )}

          {riskAnalysisResult && !isLoading && !error && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-purple-500" /> Risk Analysis Report
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>{riskAnalysisResult.riskAnalysis}</p>
                {/* If using structured output later:
                <h4 className="font-semibold mt-4">Overall Risk Level: {riskAnalysisResult.overallRiskLevel}</h4>
                {riskAnalysisResult.identifiedRisks && riskAnalysisResult.identifiedRisks.length > 0 && (
                  <>
                    <h4 className="font-semibold mt-4">Identified Risks:</h4>
                    <ul>
                      {riskAnalysisResult.identifiedRisks.map((risk, index) => (
                        <li key={index}>
                          <strong>{risk.riskType} ({risk.severity}):</strong> {risk.description}
                          {risk.clauseReference && <em className="text-xs"> (Ref: {risk.clauseReference})</em>}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                */}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
