"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, CheckCircle, ArrowLeft, Pen, User, Calendar, Clock, Info } from "lucide-react";
import Link from "next/link";

// Mock document data
const documentData = {
  "sig-001": {
    id: "sig-001",
    documentName: "Service Agreement - Acme Corp",
    requestedBy: "John Doe",
    requestedDate: "2025-05-10T10:30:00",
    expiresOn: "2025-05-17T10:30:00",
    status: "pending",
    documentUrl: "/sample-document.pdf",
    signers: [
      { name: "You", email: "you@example.com", status: "pending" },
      { name: "John Doe", email: "john@example.com", status: "completed" },
    ],
  },
  "sig-002": {
    id: "sig-002",
    documentName: "NDA - TechStart Inc.",
    requestedBy: "Jane Smith",
    requestedDate: "2025-05-11T14:45:00",
    expiresOn: "2025-05-18T14:45:00",
    status: "pending",
    documentUrl: "/sample-document.pdf",
    signers: [
      { name: "You", email: "you@example.com", status: "pending" },
      { name: "Jane Smith", email: "jane@example.com", status: "waiting" },
    ],
  },
  "sig-003": {
    id: "sig-003",
    documentName: "Employment Contract - New Hire",
    requestedBy: "Michael Johnson",
    requestedDate: "2025-05-12T09:15:00",
    expiresOn: "2025-05-19T09:15:00",
    status: "pending",
    documentUrl: "/sample-document.pdf",
    signers: [
      { name: "You", email: "you@example.com", status: "pending" },
      { name: "Michael Johnson", email: "michael@example.com", status: "completed" },
      { name: "HR Department", email: "hr@example.com", status: "waiting" },
    ],
  },
  "sig-004": {
    id: "sig-004",
    documentName: "Vendor Agreement - Supplier Co.",
    requestedBy: "Sarah Williams",
    requestedDate: "2025-05-01T11:20:00",
    completedDate: "2025-05-02T15:30:00",
    status: "completed",
    documentUrl: "/sample-document.pdf",
    signers: [
      { name: "You", email: "you@example.com", status: "completed" },
      { name: "Sarah Williams", email: "sarah@example.com", status: "completed" },
    ],
  },
  "sig-005": {
    id: "sig-005",
    documentName: "Consulting Agreement - Consultant LLC",
    requestedBy: "Robert Brown",
    requestedDate: "2025-05-03T13:10:00",
    completedDate: "2025-05-05T10:45:00",
    status: "completed",
    documentUrl: "/sample-document.pdf",
    signers: [
      { name: "You", email: "you@example.com", status: "completed" },
      { name: "Robert Brown", email: "robert@example.com", status: "completed" },
    ],
  },
};

export default function SignatureDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("document");
  const [signature, setSignature] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "waiting":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Waiting</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Fetch document data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (typeof id === "string" && documentData[id as keyof typeof documentData]) {
        setDocument(documentData[id as keyof typeof documentData]);
      } else {
        toast({
          title: "Document not found",
          description: "The requested document could not be found.",
          variant: "destructive",
        });
        router.push("/dashboard/signature");
      }
      setIsLoading(false);
    }, 1000);
  }, [id, router, toast]);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setLastPosition({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling on touch devices
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    
    setLastPosition({ x, y });
  };

  const endDrawing = () => {
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setSignature(canvas.toDataURL());
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const handleSignDocument = () => {
    if (!signature) {
      toast({
        title: "Signature required",
        description: "Please draw your signature before signing the document.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call to sign document
    toast({
      title: "Document signed",
      description: "The document has been successfully signed.",
    });

    // Redirect to signature page after signing
    setTimeout(() => {
      router.push("/dashboard/signature");
    }, 2000);
  };

  if (loading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Document Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested document could not be found.
          </p>
          <Button asChild>
            <Link href="/dashboard/signature">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Signatures
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/signature">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{document.documentName}</h1>
        {getStatusBadge(document.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="document" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="sign" disabled={document.status === "completed"}>
                {document.status === "completed" ? "Signed" : "Sign"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="document" className="space-y-4">
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="bg-gray-100 rounded-md min-h-[500px] flex items-center justify-center">
                    <div className="text-center p-6">
                      <p className="text-muted-foreground mb-4">
                        Document preview would be displayed here.
                      </p>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download Document
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sign" className="space-y-4">
              {document.status === "completed" ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-center mb-4">
                      This document has already been signed.
                    </p>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" /> Download Signed Document
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Sign Document</CardTitle>
                    <CardDescription>
                      Draw your signature below to sign this document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-4 mb-4">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={200}
                        className="border border-dashed border-gray-300 rounded-md w-full touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={endDrawing}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={clearSignature} className="mr-2">
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/signature">Cancel</Link>
                    </Button>
                    <Button onClick={handleSignDocument}>
                      <Pen className="mr-2 h-4 w-4" /> Sign Document
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <div className="flex items-center">
                  {getStatusBadge(document.status)}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Requested By</h3>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{document.requestedBy}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Requested Date</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatDate(document.requestedDate)}</span>
                </div>
              </div>
              
              {document.status === "pending" && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Expires On</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(document.expiresOn)}</span>
                  </div>
                </div>
              )}
              
              {document.status === "completed" && document.completedDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Completed Date</h3>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>{formatDate(document.completedDate)}</span>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Signers</h3>
                <div className="space-y-2">
                  {document.signers.map((signer: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <div>{signer.name}</div>
                          <div className="text-xs text-muted-foreground">{signer.email}</div>
                        </div>
                      </div>
                      {getStatusBadge(signer.status)}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
