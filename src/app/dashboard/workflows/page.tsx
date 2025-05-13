
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Workflow, PlayCircle, Eye, Edit3, Trash2, PlusCircle, Settings2, Activity, PauseCircle, StopCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft" | "archived";
  triggerType: "manual" | "contract_created" | "date_reached";
  lastRun?: string; // ISO Date string
  createdDate: string; // ISO Date string
  stepsCount: number;
}

const mockWorkflowsData: WorkflowItem[] = [
  { id: "wf1", name: "New Vendor Onboarding", description: "Automates the process for onboarding new vendors, including NDA and MSA.", status: "active", triggerType: "manual", lastRun: new Date(2024, 4, 1).toISOString(), createdDate: new Date(2023, 10, 15).toISOString(), stepsCount: 5 },
  { id: "wf2", name: "Contract Renewal Reminder", description: "Sends reminders 90, 60, and 30 days before contract expiration.", status: "active", triggerType: "date_reached", createdDate: new Date(2023, 9, 1).toISOString(), stepsCount: 3 },
  { id: "wf3", name: "Standard NDA Approval", description: "Streamlines the approval process for Non-Disclosure Agreements.", status: "draft", triggerType: "contract_created", createdDate: new Date(2024, 1, 20).toISOString(), stepsCount: 4 },
  { id: "wf4", name: "Quarterly Compliance Check", description: "Workflow for periodic compliance review of active contracts.", status: "inactive", triggerType: "manual", createdDate: new Date(2023, 5, 5).toISOString(), stepsCount: 7 },
];

const statusColors: Record<WorkflowItem['status'], string> = {
  active: "bg-green-100 text-green-800 border-green-300",
  inactive: "bg-gray-100 text-gray-800 border-gray-300",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
  archived: "bg-purple-100 text-purple-800 border-purple-300",
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching workflows
    setTimeout(() => {
      setWorkflows(mockWorkflowsData);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Workflow className="h-12 w-12 animate-pulse text-primary" /> <p className="ml-4 text-lg">Loading workflows...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Workflow className="mr-3 h-8 w-8 text-primary" /> Workflows
          </h1>
          <p className="text-muted-foreground">
            Automate your contract lifecycle processes.
          </p>
        </div>
        <Link href="/dashboard/workflows/new" passHref>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Workflow
            </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Workflow Definitions</CardTitle>
          <CardDescription>
            Manage and monitor your automated workflows. 
            {workflows.length > 0 ? ` Showing ${workflows.length} workflows.` : " No workflows defined yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workflows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Trigger</TableHead>
                  <TableHead className="hidden md:table-cell">Last Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((flow) => (
                  <TableRow key={flow.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/workflows/${flow.id}`} className="hover:underline text-primary">
                        {flow.name}
                      </Link>
                       <p className="text-xs text-muted-foreground sm:hidden">{flow.description.substring(0,50)}...</p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{flow.description}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={`${statusColors[flow.status]} capitalize`}>
                        {flow.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{flow.triggerType.replace("_", " ")}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {flow.lastRun ? format(new Date(flow.lastRun), "MMM d, yyyy") : "N/A"}
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
                            <Link href={`/dashboard/workflows/${flow.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <Settings2 className="mr-2 h-4 w-4" /> Configure
                          </DropdownMenuItem>
                           <DropdownMenuItem disabled>
                            <Activity className="mr-2 h-4 w-4" /> View Runs
                          </DropdownMenuItem>
                          {flow.status === 'active' && (
                            <DropdownMenuItem disabled className="text-orange-600 focus:text-orange-600">
                                <PauseCircle className="mr-2 h-4 w-4" /> Pause
                            </DropdownMenuItem>
                          )}
                           {flow.status === 'inactive' && (
                            <DropdownMenuItem disabled className="text-green-600 focus:text-green-600">
                                <PlayCircle className="mr-2 h-4 w-4" /> Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive focus:text-destructive" disabled>
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
              <Workflow className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No Workflows Defined</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create workflows to automate contract tasks.
              </p>
              <Link href="/dashboard/workflows/new" className="mt-4 inline-block">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create First Workflow
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
