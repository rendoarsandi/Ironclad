
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Zap, Settings, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface IntegrationApp {
  name: string;
  description: string;
  logoUrl: string;
  category: string;
  status: "Connected" | "Not Connected" | "Coming Soon";
}

const mockIntegrations: IntegrationApp[] = [
  { name: "Salesforce", description: "Sync contract data with your CRM.", logoUrl: "https://picsum.photos/seed/salesforce/64/64", category: "CRM", status: "Coming Soon" },
  { name: "HubSpot", description: "Connect contracts to marketing and sales workflows.", logoUrl: "https://picsum.photos/seed/hubspot/64/64", category: "CRM", status: "Coming Soon" },
  { name: "Slack", description: "Receive contract notifications and alerts in Slack.", logoUrl: "https://picsum.photos/seed/slack/64/64", category: "Communication", status: "Coming Soon" },
  { name: "Google Drive", description: "Store and manage contract documents in Google Drive.", logoUrl: "https://picsum.photos/seed/gdrive/64/64", category: "Storage", status: "Not Connected" },
  { name: "DocuSign", description: "Seamless e-signature integration.", logoUrl: "https://picsum.photos/seed/docusign/64/64", category: "E-Signature", status: "Coming Soon" },
  { name: "Zapier", description: "Connect KontrakPro to thousands of other apps.", logoUrl: "https://picsum.photos/seed/zapier/64/64", category: "Automation", status: "Coming Soon" },
];


export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Share2 className="mr-3 h-8 w-8 text-primary" /> Integrations
          </h1>
          <p className="text-muted-foreground">
            Connect KontrakPro with your favorite tools and streamline your workflows.
          </p>
        </div>
         <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
          <PlusCircle className="mr-2 h-4 w-4" /> Request New Integration
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Available & Upcoming Integrations</CardTitle>
          <CardDescription>
            Extend the power of KontrakPro by connecting it to other services you use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockIntegrations.map(app => (
              <Card key={app.name} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <Image src={app.logoUrl} alt={`${app.name} logo`} width={48} height={48} className="rounded-md" data-ai-hint={`${app.name} logo`} />
                  <div>
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <CardDescription className="text-xs">{app.category}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-3">{app.description}</p>
                </CardContent>
                <div className="p-4 border-t">
                   <Button 
                    variant={app.status === "Connected" ? "destructive" : "outline"} 
                    className="w-full"
                    disabled={app.status === "Coming Soon" || app.status === "Connected"}
                  >
                    {app.status === "Connected" ? <><Settings className="mr-2 h-4 w-4"/>Manage</> : 
                     app.status === "Coming Soon" ? <><Zap className="mr-2 h-4 w-4"/>Coming Soon</> : 
                     <><PlusCircle className="mr-2 h-4 w-4"/>Connect</>}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
           <div className="text-center p-6 bg-muted/50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Building a Connected Ecosystem</h3>
            <p className="text-muted-foreground">
              We are actively working on expanding our list of integrations. If you don't see an app you need,
              please let us know by clicking the "Request New Integration" button.
            </p>
             <Link href="/dashboard" passHref className="mt-4 inline-block">
                <Button variant="link">Back to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
