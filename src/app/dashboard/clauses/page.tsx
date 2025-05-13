
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Library, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function ClauseLibraryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Scale className="mr-3 h-8 w-8 text-primary" /> Clause Library
          </h1>
          <p className="text-muted-foreground">
            Manage, search, and utilize standardized legal clauses for your contracts.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Clause (Coming Soon)
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Your Centralized Clause Repository</CardTitle>
          <CardDescription>
            Streamline contract drafting and ensure consistency with pre-approved clauses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search clauses by keyword, tag, or category..."
              className="flex-grow"
              disabled
            />
            <Button variant="outline" disabled><Search className="mr-2 h-4 w-4" /> Search</Button>
          </div>

          <div className="text-center p-12 bg-muted/50 rounded-lg">
            <Library className="mx-auto h-16 w-16 text-primary opacity-50 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">Clause Library - Coming Soon!</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              This feature will allow you to create, categorize, and manage a library of standard clauses. 
              You'll be able to easily insert these clauses into your contract templates and documents, 
              track their usage, and manage versions.
            </p>
            <p className="text-sm text-muted-foreground">
              Key upcoming functionalities:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 mb-6 inline-block text-left">
              <li>CRUD operations for clauses</li>
              <li>Categorization and tagging</li>
              <li>Version control for clauses</li>
              <li>AI-powered clause suggestion</li>
              <li>Integration with contract templates</li>
            </ul>
            <div>
              <Link href="/dashboard" passHref>
                  <Button variant="link">Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
