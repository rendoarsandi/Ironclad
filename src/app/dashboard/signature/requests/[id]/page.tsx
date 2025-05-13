"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, ArrowLeft, User, Calendar, Clock, Info, Mail, Send, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

// Mock request data
const requestData = {
  "req-001": {
    id: "req-001",
    documentName: "Partnership Agreement - Partner Inc.",
    requestedTo: "David Wilson",
    requestedToEmail: "david@example.com",
    requestedDate: "2025-05-09T16:20:00",
    expiresOn: "2025-05-16T16:20:00",
    status: "waiting",
    documentUrl: "/sample-document.pdf",
    message: "Please review and sign this partnership agreement at your earliest convenience.",
    signers: [
      { name: "You (Sender)", email: "you@example.com", status: "completed" },
      { name: "David Wilson", email: "david@example.com", status: "waiting" },
    ],
  },
  "req-002": {
    id: "req-002",
    documentName: "Sales Contract - Customer Ltd.",
    requestedTo: "Emily Davis",
    requestedToEmail: "emily@example.com",
    requestedDate: "2025-05-08T14:30:00",
    expiresOn: "2025-05-15T14:30:00",
    status: "viewed",
    documentUrl: "/sample-document.pdf",
    message: "Here's the sales contract we discussed. Please sign to confirm our agreement.",
    signers: [
      { name: "You (Sender)", email: "you@example.com", status: "completed" },
      { name: "Emily Davis", email: "emily@example.com", status: "viewed" },
    ],
    viewedDate: "2025-05-09T10:15:00",
  },
  "req-003": {
    id: "req-003",
    documentName: "Lease Agreement - Property Management",
    requestedTo: "Thomas Anderson",
    requestedToEmail: "thomas@example.com",
    requestedDate: "2025-05-07T11:15:00",
    expiresOn: "2025-05-14T11:15:00",
    status: "declined",
    documentUrl: "/sample-document.pdf",
    message: "Please sign the attached lease agreement.",
    signers: [
      { name: "You (Sender)", email: "you@example.com", status: "completed" },
      { name: "Thomas Anderson", email: "thomas@example.com", status: "declined" },
    ],
    declinedDate: "2025-05-08T09:30:00",
    declineReason: "The terms need to be revised. I'll contact you to discuss the changes.",
  },
  "req-004": {
    id: "req-004",
    documentName: "Software License - Software Corp.",
    requestedTo: "Jennifer Martin",
    requestedToEmail: "jennifer@example.com",
    requestedDate: "2025-05-06T09:45:00",
    status: "completed",
    documentUrl: "/sample-document.pdf",
    message: "Please sign this software license agreement.",
    signers: [
      { name: "You (Sender)", email: "you@example.com", status: "completed" },
      { name: "Jennifer Martin", email: "jennifer@example.com", status: "completed" },
    ],
    completedDate: "2025-05-07T14:20:00",
  },
};

export default function SignatureRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      case "waiting":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Waiting</Badge>;
      case "viewed":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Viewed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "viewed":
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "declined":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  // Fetch request data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (typeof id === "string" && requestData[id as keyof typeof requestData]) {
        setRequest(requestData[id as keyof typeof requestData]);
      } else {
        toast({
          title: "Request not found",
          description: "The requested signature request could not be found.",
          variant: "destructive",
        });
        router.push("/dashboard/signature");
      }
      setIsLoading(false);
    }, 1000);
  }, [id, router, toast]);

  const handleResendRequest = () => {
    toast({
      title: "Request Resent",
      description: `Signature request has been resent to ${request.requestedTo}.`,
    });
  };

  const handleCancelRequest = () => {
    toast({
      title: "Request Cancelled",
      description: "The signature request has been cancelled.",
    });
    
    // Redirect to signature page after cancelling
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

  if (!request) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Request Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested signature request could not be found.
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
        <h1 className="text-2xl font-bold tracking-tight">{request.documentName}</h1>
        {getStatusBadge(request.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>
                Preview of the document sent for signature
              </CardDescription>
            </CardHeader>
            <CardContent>
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

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{request.message}</p>
              </CardContent>
            </Card>
          </div>

          {request.status === "declined" && request.declineReason && (
            <div className="mt-6">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700">
                    <XCircle className="h-5 w-5 mr-2" /> Decline Reason
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700">{request.declineReason}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  {getStatusBadge(request.status)}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Recipient</h3>
                <div className="flex items-center mb-1">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{request.requestedTo}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{request.requestedToEmail}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Requested Date</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatDate(request.requestedDate)}</span>
                </div>
              </div>
              
              {request.status !== "completed" && request.expiresOn && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Expires On</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(request.expiresOn)}</span>
                  </div>
                </div>
              )}
              
              {request.status === "viewed" && request.viewedDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Viewed On</h3>
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-purple-500" />
                    <span>{formatDate(request.viewedDate)}</span>
                  </div>
                </div>
              )}
              
              {request.status === "completed" && request.completedDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Completed Date</h3>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>{formatDate(request.completedDate)}</span>
                  </div>
                </div>
              )}
              
              {request.status === "declined" && request.declinedDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Declined Date</h3>
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    <span>{formatDate(request.declinedDate)}</span>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Signers</h3>
                <div className="space-y-2">
                  {request.signers.map((signer: any, index: number) => (
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
            
            {(request.status === "waiting" || request.status === "viewed") && (
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" onClick={handleResendRequest}>
                  <Send className="mr-2 h-4 w-4" /> Resend Request
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleCancelRequest}>
                  Cancel Request
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
