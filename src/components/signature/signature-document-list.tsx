"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";

interface Signer {
  name: string;
  email: string;
  status: string;
}

interface SignatureDocument {
  id: string;
  documentName: string;
  requestedBy?: string;
  requestedTo?: string;
  requestedDate: string;
  expiresOn?: string;
  completedDate?: string;
  status: string;
  signers?: Signer[];
}

interface SignatureDocumentListProps {
  pendingDocuments: SignatureDocument[];
  completedDocuments: SignatureDocument[];
  requestedDocuments: SignatureDocument[];
  className?: string;
}

export function SignatureDocumentList({
  pendingDocuments,
  completedDocuments,
  requestedDocuments,
  className = "",
}: SignatureDocumentListProps) {
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
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Filter documents based on search query
  const filterDocuments = (documents: SignatureDocument[]) => {
    if (!searchQuery) return documents;
    
    return documents.filter(doc => 
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.requestedBy && doc.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.requestedTo && doc.requestedTo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
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
          {filterDocuments(pendingDocuments).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No pending signatures found. Documents that need your signature will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            filterDocuments(pendingDocuments).map((document) => (
              <Card key={document.id}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/dashboard/signature/${document.id}`} className="hover:underline">
                          {document.documentName}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Requested by {document.requestedBy} on {formatDate(document.requestedDate)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.status)}
                      {getStatusBadge(document.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {document.expiresOn && `Expires on ${formatDate(document.expiresOn)}`}
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/signature/${document.id}`}>
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
          {filterDocuments(completedDocuments).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No completed signatures found. Documents you've signed will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            filterDocuments(completedDocuments).map((document) => (
              <Card key={document.id}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/dashboard/signature/${document.id}`} className="hover:underline">
                          {document.documentName}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Requested by {document.requestedBy} on {formatDate(document.requestedDate)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.status)}
                      {getStatusBadge(document.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {document.completedDate && `Completed on ${formatDate(document.completedDate)}`}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/signature/${document.id}`}>
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
          {filterDocuments(requestedDocuments).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No signature requests found. Documents you've sent for signature will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            filterDocuments(requestedDocuments).map((document) => (
              <Card key={document.id}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/dashboard/signature/requests/${document.id}`} className="hover:underline">
                          {document.documentName}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Requested to {document.requestedTo} on {formatDate(document.requestedDate)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.status)}
                      {getStatusBadge(document.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {document.status === "completed" 
                        ? "Completed" 
                        : document.status === "declined" 
                          ? "Declined" 
                          : "Waiting for signature"}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/signature/requests/${document.id}`}>
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
