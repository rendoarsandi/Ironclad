"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Search, AlertTriangle, Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractClauses } from "@/ai/flows/clause-extraction-flow";

interface ClauseExtractionProps {
  documentUrl: string;
  documentName: string;
  onExtractComplete?: (clauses: Clause[]) => void;
  className?: string;
}

export interface Clause {
  id: string;
  title: string;
  content: string;
  category: string;
  importance: "high" | "medium" | "low";
}

export function ClauseExtraction({
  documentUrl,
  documentName,
  onExtractComplete,
  className = "",
}: ClauseExtractionProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Extract clauses from document
  const handleExtractClauses = async () => {
    if (isExtracting) return;

    setIsExtracting(true);

    try {
      // Call AI service to extract clauses
      const result = await extractClauses({
        documentUrl,
        documentName,
      });

      setClauses(result.clauses);
      
      if (onExtractComplete) {
        onExtractComplete(result.clauses);
      }

      toast({
        title: "Ekstraksi Selesai",
        description: `${result.clauses.length} klausa berhasil diekstrak dari dokumen.`,
      });
    } catch (error) {
      console.error("Error extracting clauses:", error);
      toast({
        title: "Error",
        description: "Gagal mengekstrak klausa dari dokumen. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Copy clause to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Disalin",
      description: "Teks telah disalin ke clipboard.",
    });
  };

  // Filter clauses based on active tab
  const filteredClauses = activeTab === "all" 
    ? clauses 
    : clauses.filter(clause => 
        activeTab === "high" 
          ? clause.importance === "high" 
          : activeTab === "medium" 
            ? clause.importance === "medium" 
            : clause.importance === "low"
      );

  // Get importance badge
  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Penting</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Sedang</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Rendah</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Ekstraksi Klausa
        </CardTitle>
        <CardDescription>
          Ekstrak klausa penting dari dokumen Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clauses.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-6">
              Klik tombol di bawah untuk mengekstrak klausa dari dokumen Anda.
            </p>
            <Button onClick={handleExtractClauses} disabled={isExtracting}>
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengekstrak...
                </>
              ) : (
                "Ekstrak Klausa"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  Semua ({clauses.length})
                </TabsTrigger>
                <TabsTrigger value="high">
                  Penting ({clauses.filter(c => c.importance === "high").length})
                </TabsTrigger>
                <TabsTrigger value="medium">
                  Sedang ({clauses.filter(c => c.importance === "medium").length})
                </TabsTrigger>
                <TabsTrigger value="low">
                  Rendah ({clauses.filter(c => c.importance === "low").length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                <div className="space-y-4">
                  {filteredClauses.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        Tidak ada klausa dalam kategori ini.
                      </p>
                    </div>
                  ) : (
                    filteredClauses.map((clause) => (
                      <Card key={clause.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{clause.title}</CardTitle>
                              <CardDescription className="text-xs">
                                Kategori: {clause.category}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              {getImportanceBadge(clause.importance)}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => copyToClipboard(clause.content)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="text-sm bg-muted/30 p-3 rounded-md">
                            {clause.content}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      {clauses.length > 0 && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleExtractClauses} 
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengekstrak Ulang...
              </>
            ) : (
              "Ekstrak Ulang"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
