
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, BookOpenCheck, CheckCircle, XCircle, Eye } from "lucide-react";
import type { Review } from "@/types"; // Assuming Review type exists
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const mockReviewsData: Review[] = [
  { id: "r1", contractId: "c2", contractName: "Non-Disclosure Agreement", status: "pending", submittedDate: new Date(2023, 11, 2).toISOString() },
  { id: "r2", contractId: "c5", contractName: "Consulting Agreement", status: "pending", submittedDate: new Date(2024, 1, 10).toISOString() },
  { id: "r3", contractId: "c6", contractName: "Lease Agreement", status: "approved", reviewerId: "Admin User", submittedDate: new Date(2024, 0, 5).toISOString(), reviewDate: new Date(2024, 0, 7).toISOString() },
];

const statusColors: Record<Review['status'], string> = {
  pending: "bg-blue-100 text-blue-800 border-blue-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};


export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching reviews
    setTimeout(() => {
      setReviews(mockReviewsData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleReviewAction = (reviewId: string, action: 'approve' | 'reject') => {
    console.log(`Review ${reviewId} action: ${action}`);
    // Mock update status
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId ? { ...review, status: action === 'approve' ? 'approved' : 'rejected', reviewDate: new Date().toISOString() } : review
      )
    );
    toast({
      title: `Review ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      description: `Contract "${reviews.find(r=>r.id===reviewId)?.contractName}" has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
    });
  };

  if (isLoading) {
     return <div className="flex justify-center items-center h-64"><BookOpenCheck className="h-12 w-12 animate-pulse text-primary" /> <p className="ml-4 text-lg">Loading reviews...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Reviews</h1>
          <p className="text-muted-foreground">Manage pending and completed contract reviews.</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
          <CardDescription>
            {reviews.length > 0 ? `Showing ${reviews.length} contract reviews.` : "No reviews found."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Submitted Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Reviewed Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                       <Link href={`/dashboard/contracts/${review.contractId}`} className="hover:underline text-primary">
                        {review.contractName}
                       </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{format(new Date(review.submittedDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[review.status]} capitalize`}>
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {review.reviewDate ? format(new Date(review.reviewDate), "MMM d, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={review.status !== 'pending'}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem asChild>
                             <Link href={`/dashboard/contracts/${review.contractId}`}>
                               <Eye className="mr-2 h-4 w-4" /> View Contract
                             </Link>
                          </DropdownMenuItem>
                          {review.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleReviewAction(review.id, 'approve')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReviewAction(review.id, 'reject')} className="text-destructive">
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <BookOpenCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No reviews pending</h3>
              <p className="mt-1 text-sm text-muted-foreground">The review queue is currently empty.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
