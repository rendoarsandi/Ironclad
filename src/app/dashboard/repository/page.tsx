
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Archive, Filter, Folder, Search, SlidersHorizontal, Tag, UsersRound, AlertCircle, FilePlus2 } from "lucide-react";
import Link from "next/link";

export default function RepositoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Archive className="mr-3 h-8 w-8 text-primary" /> Contract Repository
          </h1>
          <p className="text-muted-foreground">
            Access, search, and manage all your organization's contracts.
          </p>
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Advanced Search & Filtering</CardTitle>
          <CardDescription>
            Use the options below to find specific contracts or groups of contracts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search all contracts (e.g., by name, party, keyword, clause text)..."
              className="flex-grow text-base py-3"
              data-ai-hint="search contracts"
            />
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-6 py-3">
              <Search className="mr-2 h-5 w-5" /> Search
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start h-auto py-3 text-base hover:border-accent hover:text-accent">
                <Folder className="mr-2 h-5 w-5" /> By Department
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 text-base hover:border-accent hover:text-accent">
                <UsersRound className="mr-2 h-5 w-5" /> By Counterparty
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 text-base hover:border-accent hover:text-accent">
                <Tag className="mr-2 h-5 w-5" /> By Tag
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 text-base hover:border-accent hover:text-accent">
                <Filter className="mr-2 h-5 w-5" /> By Status (e.g., Active, Expired)
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 text-base hover:border-accent hover:text-accent">
                <FilePlus2 className="mr-2 h-5 w-5" /> By Contract Type
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 text-base hover:border-destructive hover:text-destructive group">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500 group-hover:text-destructive" /> High Risk Contracts
              </Button>
               <Button variant="outline" className="justify-start h-auto py-3 text-base hover:border-accent hover:text-accent">
                <SlidersHorizontal className="mr-2 h-5 w-5" /> Custom Saved Views
              </Button>
            </div>
          </div>
          
          {/* Placeholder for search results or contract list component */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>Contracts matching your criteria will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-muted rounded-md">
              <p className="text-muted-foreground">Enter search terms or apply filters to see results.</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
            <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
            <Link href="/dashboard/contracts" passHref>
                <Button variant="link">View All Contracts List</Button>
            </Link>
             <Link href="/dashboard/contracts/new?from=template" passHref>
                <Button variant="link">Create Contract from Template</Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}

