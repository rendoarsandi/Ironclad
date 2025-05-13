"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle, Shield, Info, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { detectRisks } from "@/ai/flows/risk-detection-flow";

interface RiskDetectionProps {
  documentUrl: string;
  documentName: string;
  onDetectComplete?: (risks: Risk[], score: number) => void;
  className?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  category: string;
  location: string;
  recommendation: string;
}

export function RiskDetection({
  documentUrl,
  documentName,
  onDetectComplete,
  className = "",
}: RiskDetectionProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const { toast } = useToast();

  // Detect risks in document
  const handleDetectRisks = async () => {
    if (isDetecting) return;

    setIsDetecting(true);

    try {
      // Call AI service to detect risks
      const result = await detectRisks({
        documentUrl,
        documentName,
      });

      setRisks(result.risks);
      setRiskScore(result.riskScore);
      
      if (onDetectComplete) {
        onDetectComplete(result.risks, result.riskScore);
      }

      toast({
        title: "Deteksi Selesai",
        description: `${result.risks.length} risiko terdeteksi dalam dokumen.`,
      });
    } catch (error) {
      console.error("Error detecting risks:", error);
      toast({
        title: "Error",
        description: "Gagal mendeteksi risiko dalam dokumen. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  // Get risk score color
  const getRiskScoreColor = (score: number) => {
    if (score < 30) return "text-green-500";
    if (score < 70) return "text-yellow-500";
    return "text-red-500";
  };

  // Get risk score label
  const getRiskScoreLabel = (score: number) => {
    if (score < 30) return "Rendah";
    if (score < 70) return "Sedang";
    return "Tinggi";
  };

  // Get risk score progress color
  const getRiskScoreProgressColor = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Tinggi</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Sedang</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Rendah</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "low":
        return <Info className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Deteksi Risiko
        </CardTitle>
        <CardDescription>
          Identifikasi risiko potensial dalam dokumen Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        {risks.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-6">
              Klik tombol di bawah untuk mendeteksi risiko dalam dokumen Anda.
            </p>
            <Button onClick={handleDetectRisks} disabled={isDetecting}>
              {isDetecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendeteksi...
                </>
              ) : (
                "Deteksi Risiko"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Risk Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Skor Risiko</h3>
                <span className={`text-lg font-bold ${getRiskScoreColor(riskScore || 0)}`}>
                  {riskScore}/100 ({getRiskScoreLabel(riskScore || 0)})
                </span>
              </div>
              <Progress 
                value={riskScore || 0} 
                max={100} 
                className="h-2"
                indicatorClassName={getRiskScoreProgressColor(riskScore || 0)}
              />
              <p className="text-xs text-muted-foreground">
                {riskScore && riskScore < 30 ? (
                  "Dokumen ini memiliki risiko rendah. Sebagian besar ketentuan standar dan wajar."
                ) : riskScore && riskScore < 70 ? (
                  "Dokumen ini memiliki beberapa risiko yang perlu diperhatikan. Tinjau dengan hati-hati."
                ) : (
                  "Dokumen ini memiliki risiko tinggi. Disarankan untuk berkonsultasi dengan ahli hukum."
                )}
              </p>
            </div>

            <Separator />

            {/* Risks List */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Risiko Terdeteksi ({risks.length})</h3>
              
              {risks.map((risk) => (
                <Card key={risk.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(risk.severity)}
                        <div>
                          <CardTitle className="text-base">{risk.title}</CardTitle>
                          <CardDescription className="text-xs">
                            Kategori: {risk.category} | Lokasi: {risk.location}
                          </CardDescription>
                        </div>
                      </div>
                      <div>
                        {getSeverityBadge(risk.severity)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-3">
                    <div>
                      <p className="text-sm">{risk.description}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <h4 className="text-xs font-medium mb-1">Rekomendasi:</h4>
                      <p className="text-sm">{risk.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {risks.length > 0 && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleDetectRisks} 
            disabled={isDetecting}
          >
            {isDetecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendeteksi Ulang...
              </>
            ) : (
              "Deteksi Ulang"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
