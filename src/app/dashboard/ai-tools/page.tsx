
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Lightbulb, Wand2, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AiToolsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Brain className="mr-3 h-8 w-8 text-primary" /> AI Tools
          </h1>
          <p className="text-muted-foreground">
            Leverage Artificial Intelligence to enhance your contract management.
          </p>
        </div>
      </div>

      <Card className="shadow-xl border-border/30">
        <CardHeader>
          <CardTitle className="text-2xl">AI-Powered Contract Analysis</CardTitle>
          <CardDescription>
            Unlock deeper insights and automate tasks with our suite of AI tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out border flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Lightbulb className="mr-2 h-6 w-6 text-yellow-500" />
                  Contract Summarization
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-6">
                  Automatically generate concise summaries of lengthy contracts, highlighting key terms and obligations.
                </p>
              </CardContent>
              <div className="p-4 border-t">
                <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground">
                  <Link href="/dashboard/ai-tools/summarize">Access Summarizer</Link>
                </Button>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out border flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Wand2 className="mr-2 h-6 w-6 text-purple-500" />
                  Risk Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-6">
                  Identify potential risks, non-standard clauses, and deviations from your templates using AI analysis.
                </p>
              </CardContent>
              <div className="p-4 border-t">
                 <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground">
                  <Link href="/dashboard/ai-tools/risk-detection">Analyze Risks</Link>
                </Button>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out border flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <SearchCheck className="mr-2 h-6 w-6 text-blue-500" />
                  Clause Extraction
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-6">
                  Quickly extract specific clauses (e.g., indemnification, limitation of liability) from any contract document.
                </p>
              </CardContent>
               <div className="p-4 border-t">
                <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground">
                  <Link href="/dashboard/ai-tools/clause-extraction">Extract Clauses</Link>
                </Button>
              </div>
            </Card>
          </div>

          <div className="text-center p-8 bg-muted/50 rounded-lg mt-10">
            <h3 className="text-xl font-semibold mb-3">More AI Features on the Horizon!</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We are continuously developing new AI-driven functionalities to streamline your contract lifecycle.
              Stay tuned for updates on AI-assisted drafting, negotiation insights, and more.
            </p>
             <Link href="/dashboard" passHref className="mt-6 inline-block">
                <Button variant="link" className="text-primary hover:text-primary/80">Back to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
