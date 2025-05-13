
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PlusCircle, FileText, Download, Filter, CalendarDays } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ReportItem {
  id: string;
  name: string;
  description: string;
  category: "Compliance" | "Performance" | "Financial" | "Custom";
  lastGenerated?: string; // ISO Date string
  generatedBy?: string;
  schedule?: "Daily" | "Weekly" | "Monthly" | "Ad-hoc";
}

const mockReportsData: ReportItem[] = [
  { id: "rep1", name: "Q1 Contract Expiry Report", description: "Lists all contracts expiring in Q1 2024.", category: "Performance", lastGenerated: new Date(2024,3,1).toISOString(), generatedBy: "Admin", schedule: "Monthly" },
  { id: "rep2", name: "Active MSA Summary", description: "Summary of all active Master Service Agreements.", category: "Custom", lastGenerated: new Date(2024,4,5).toISOString(), generatedBy: "Alice", schedule: "Weekly" },
  { id: "rep3", name: "NDA Compliance Audit", description: "Audit trail for NDAs signed in the last 6 months.", category: "Compliance", generatedBy: "System", schedule: "Ad-hoc" },
  { id: "rep4", name: "Vendor Spend Analysis", description: "Tracks spending across all vendor contracts.", category: "Financial", lastGenerated: new Date(2024,2,28).toISOString(), generatedBy: "Bob", schedule: "Monthly" },
];


export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-primary" /> Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Gain insights from your contract data.
          </p>
        </div>
         <Link href="/dashboard/reports/new" passHref>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Report
            </Button>
        </Link>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Report Library</CardTitle>
          <CardDescription>
            Access pre-defined and custom-generated reports.
             {mockReportsData.length > 0 ? ` Showing ${mockReportsData.length} reports.` : " No reports available."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockReportsData.length > 0 ? (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Generated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReportsData.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/reports/${report.id}`} className="hover:underline text-primary">
                        {report.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{report.description}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{report.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {report.lastGenerated ? format(new Date(report.lastGenerated), "MMM d, yyyy, HH:mm") : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled><Download className="mr-2 h-4 w-4" /> Download</Button>
                        <Button variant="outline" size="sm" className="ml-2" disabled><Filter className="mr-2 h-4 w-4" /> View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No Reports Available</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create a new report to get started.
                </p>
                 <Link href="/dashboard/reports/new" className="mt-4 inline-block">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Report
                    </Button>
                </Link>
            </div>
          )}
        </CardContent>
      </Card>

       <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary"/>Scheduled Reports</CardTitle>
          <CardDescription>Reports that are generated automatically based on a schedule.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Scheduled reporting feature is not yet implemented.</p>
            {/* Placeholder for scheduled reports list */}
        </CardContent>
      </Card>
    </div>
  );
}
