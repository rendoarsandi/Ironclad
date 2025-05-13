"use client";

import { useState, useEffect, useMemo } from "react";
import { ContractUploadDialog } from "@/components/contracts/contract-upload-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Eye, Edit3, Trash2, PlayCircle, Search } from "lucide-react";
import type { Contract, ContractStatus } from "@/types";
import Link from "next/link";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";

const mockContractsData: Contract[] = [
  { id: "c1", name: "Master Service Agreement", uploadedBy: "Alice Wonderland", uploadDate: new Date(2023, 10, 15).toISOString(), status: "active", version: 2, filePath: "contracts/msa.pdf" },
  { id: "c2", name: "Non-Disclosure Agreement", uploadedBy: "Bob The Builder", uploadDate: new Date(2023, 11, 1).toISOString(), status: "pending_review", version: 1, filePath: "contracts/nda.pdf" },
  { id: "c3", name: "Software License Agreement", uploadedBy: "Carol Danvers", uploadDate: new Date(2024, 0, 20).toISOString(), status: "draft", version: 1, filePath: "contracts/sla.docx" },
  { id: "c4", name: "Partnership Agreement", uploadedBy: "Alice Wonderland", uploadDate: new Date(2024, 1, 5).toISOString(), status: "archived", version: 3, filePath: "contracts/partnership.pdf" },
];

const statusColors: Record<ContractStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
  pending_review: "bg-blue-100 text-blue-800 border-blue-300",
  active: "bg-green-100 text-green-800 border-green-300",
  archived: "bg-gray-100 text-gray-800 border-gray-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};


export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoading(true);

      try {
        // Try to fetch from Supabase if user is logged in
        if (user) {
          const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            // Transform Supabase data to match Contract type
            const transformedData: Contract[] = data.map(item => ({
              id: item.id,
              name: item.title,
              uploadedBy: item.created_by === user.id ? 'You' : 'Other User',
              uploadDate: item.created_at,
              status: item.status as ContractStatus,
              version: item.version,
              filePath: item.metadata?.file_url || '',
              summary: item.content || ''
            }));

            setContracts(transformedData);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to mock data
        setContracts(mockContractsData);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        // Fallback to mock data on error
        setContracts(mockContractsData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

  const handleUploadSuccess = (newContract: Contract) => {
    setContracts(prevContracts => [newContract, ...prevContracts]);
  };

  const handleStartReview = async (contractId: string) => {
    if (!user) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('contracts')
        .update({ status: 'pending' })
        .eq('id', contractId);

      if (error) {
        throw error;
      }

      // Update local state
      setContracts(prev => prev.map(c => c.id === contractId ? {...c, status: 'pending_review'} : c));
    } catch (error) {
      console.error('Error updating contract status:', error);
    }
  };

  const filteredContracts = useMemo(() => {
    if (!searchTerm) return contracts;
    return contracts.filter(contract =>
      contract.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contracts, searchTerm]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><FileText className="h-12 w-12 animate-pulse text-primary" /> <p className="ml-4 text-lg">Loading contracts...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground">Manage your organization's contracts.</p>
        </div>
        <ContractUploadDialog onUploadSuccess={handleUploadSuccess} />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Contract Repository</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardDescription>
              {filteredContracts.length > 0 ? `Showing ${filteredContracts.length} of ${contracts.length} contracts.` : "No contracts found matching your search, or no contracts uploaded yet."}
            </CardDescription>
            <div className="relative sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search contracts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Uploaded By</TableHead>
                  <TableHead className="hidden md:table-cell">Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                       <Link href={`/dashboard/contracts/${contract.id}`} className="hover:underline text-primary">
                        {contract.name}
                       </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{contract.uploadedBy}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(contract.uploadDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[contract.status]} capitalize`}>
                        {contract.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                             <Link href={`/dashboard/contracts/${contract.id}`}>
                               <Eye className="mr-2 h-4 w-4" /> View Details
                             </Link>
                          </DropdownMenuItem>
                          {contract.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleStartReview(contract.id)}>
                              <PlayCircle className="mr-2 h-4 w-4" /> Start Review
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem disabled> {/* Placeholder */}
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" disabled> {/* Placeholder */}
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">
                {searchTerm ? "No contracts match your search" : "No contracts yet"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? "Try a different search term." : "Get started by uploading a new contract."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
