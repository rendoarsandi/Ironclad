"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Upload, FileText, Clock, CheckCircle, XCircle, AlertCircle, Pen } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Mock data for pending signatures
const pendingSignatures = [
  {
    id: "sig-001",
    documentName: "Service Agreement - Acme Corp",
    requestedBy: "John Doe",
    requestedDate: "2025-05-10T10:30:00",
    expiresOn: "2025-05-17T10:30:00",
    status: "pending",
  },
  {
    id: "sig-002",
    documentName: "NDA - TechStart Inc.",
    requestedBy: "Jane Smith",
    requestedDate: "2025-05-11T14:45:00",
    expiresOn: "2025-05-18T14:45:00",
    status: "pending",
  },
  {
    id: "sig-003",
    documentName: "Employment Contract - New Hire",
    requestedBy: "Michael Johnson",
    requestedDate: "2025-05-12T09:15:00",
    expiresOn: "2025-05-19T09:15:00",
    status: "pending",
  },
];

// Mock data for completed signatures
const completedSignatures = [
  {
    id: "sig-004",
    documentName: "Vendor Agreement - Supplier Co.",
    requestedBy: "Sarah Williams",
    requestedDate: "2025-05-01T11:20:00",
    completedDate: "2025-05-02T15:30:00",
    status: "completed",
  },
  {
    id: "sig-005",
    documentName: "Consulting Agreement - Consultant LLC",
    requestedBy: "Robert Brown",
    requestedDate: "2025-05-03T13:10:00",
    completedDate: "2025-05-05T10:45:00",
    status: "completed",
  },
];

// Mock data for signature requests
const signatureRequests = [
  {
    id: "req-001",
    documentName: "Partnership Agreement - Partner Inc.",
    requestedTo: "David Wilson",
    requestedDate: "2025-05-09T16:20:00",
    status: "waiting",
  },
  {
    id: "req-002",
    documentName: "Sales Contract - Customer Ltd.",
    requestedTo: "Emily Davis",
    requestedDate: "2025-05-08T14:30:00",
    status: "viewed",
  },
  {
    id: "req-003",
    documentName: "Lease Agreement - Property Management",
    requestedTo: "Thomas Anderson",
    requestedDate: "2025-05-07T11:15:00",
    status: "declined",
  },
  {
    id: "req-004",
    documentName: "Software License - Software Corp.",
    requestedTo: "Jennifer Martin",
    requestedDate: "2025-05-06T09:45:00",
    status: "completed",
  },
];

export default function SignaturePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

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
      case "viewed":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Viewed</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "waiting":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "viewed":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Handle request signature button click
  const handleRequestSignature = () => {
    router.push("/dashboard/signature/request");
  };

  // Handle upload document button click
  const handleUploadDocument = () => {
    router.push("/dashboard/signature/upload");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signature</h1>
          <p className="text-muted-foreground">
            Manage your electronic signatures and signature requests
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleRequestSignature}>
            Request Signature
          </Button>
          <Button variant="outline" onClick={handleUploadDocument}>
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/signature/manage">
              <Pen className="mr-2 h-4 w-4" /> Kelola Tanda Tangan
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search signatures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Signatures</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="requests">Signature Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSignatures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No pending signatures found. Documents that need your signature will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingSignatures.map((signature) => (
              <Card key={signature.id}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/dashboard/signature/${signature.id}`} className="hover:underline">
                          {signature.documentName}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Requested by {signature.requestedBy} on {formatDate(signature.requestedDate)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(signature.status)}
                      {getStatusBadge(signature.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Expires on {formatDate(signature.expiresOn)}
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/signature/${signature.id}`}>
                        Sign Document
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedSignatures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No completed signatures found. Documents you've signed will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            completedSignatures.map((signature) => (
              <Card key={signature.id}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/dashboard/signature/${signature.id}`} className="hover:underline">
                          {signature.documentName}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Requested by {signature.requestedBy} on {formatDate(signature.requestedDate)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(signature.status)}
                      {getStatusBadge(signature.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Completed on {formatDate(signature.completedDate)}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/signature/${signature.id}`}>
                        View Document
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {signatureRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No signature requests found. Documents you've sent for signature will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            signatureRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/dashboard/signature/requests/${request.id}`} className="hover:underline">
                          {request.documentName}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Requested to {request.requestedTo} on {formatDate(request.requestedDate)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {request.status === "completed"
                        ? "Completed"
                        : request.status === "declined"
                          ? "Declined"
                          : "Waiting for signature"}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/signature/requests/${request.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
