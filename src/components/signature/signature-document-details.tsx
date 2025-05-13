"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { User, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Download, Mail } from "lucide-react";
import Link from "next/link";

interface Signer {
  name: string;
  email: string;
  status: string;
}

interface SignatureDocumentDetailsProps {
  id: string;
  documentName: string;
  requestedBy?: string;
  requestedTo?: string;
  requestedDate: string;
  expiresOn?: string;
  completedDate?: string;
  viewedDate?: string;
  declinedDate?: string;
  declineReason?: string;
  status: string;
  signers?: Signer[];
  onResend?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function SignatureDocumentDetails({
  id,
  documentName,
  requestedBy,
  requestedTo,
  requestedDate,
  expiresOn,
  completedDate,
  viewedDate,
  declinedDate,
  declineReason,
  status,
  signers = [],
  onResend,
  onCancel,
  className = "",
}: SignatureDocumentDetailsProps) {
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
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "waiting":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "viewed":
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      case "declined":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Document Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
          <div className="flex items-center">
            {getStatusBadge(status)}
          </div>
        </div>
        
        <Separator />
        
        {requestedBy && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Requested By</h3>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{requestedBy}</span>
            </div>
          </div>
        )}
        
        {requestedTo && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Requested To</h3>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{requestedTo}</span>
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Requested Date</h3>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formatDate(requestedDate)}</span>
          </div>
        </div>
        
        {status !== "completed" && expiresOn && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Expires On</h3>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(expiresOn)}</span>
            </div>
          </div>
        )}
        
        {status === "viewed" && viewedDate && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Viewed On</h3>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-purple-500" />
              <span>{formatDate(viewedDate)}</span>
            </div>
          </div>
        )}
        
        {status === "completed" && completedDate && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Completed Date</h3>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>{formatDate(completedDate)}</span>
            </div>
          </div>
        )}
        
        {status === "declined" && declinedDate && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Declined Date</h3>
            <div className="flex items-center">
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              <span>{formatDate(declinedDate)}</span>
            </div>
          </div>
        )}
        
        <Separator />
        
        {signers && signers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Signers</h3>
            <div className="space-y-2">
              {signers.map((signer, index) => (
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
        )}
        
        {status === "declined" && declineReason && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-red-600 mb-1">Decline Reason</h3>
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                {declineReason}
              </div>
            </div>
          </>
        )}
        
        {(status === "waiting" || status === "viewed") && onResend && onCancel && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={onResend}>
                Resend Request
              </Button>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={onCancel}>
                Cancel Request
              </Button>
            </div>
          </>
        )}
        
        <Separator />
        
        <div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="#" onClick={(e) => e.preventDefault()}>
              <Download className="mr-2 h-4 w-4" /> Download Document
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
