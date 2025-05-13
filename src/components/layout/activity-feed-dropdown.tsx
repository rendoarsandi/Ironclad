
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Bell, Clock, ListFilter, UploadCloud, FileCheck2, FilePenLine, LogIn, MessageSquare, Settings2, RotateCcw, Lightbulb, ShieldCheck, BarChart3, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth-context";
import { ActivityFeedItem } from "@/components/dashboard/activity-feed-item";

interface DashboardActivity {
  id: string;
  icon: LucideIcon;
  description: string; 
  user?: string; 
  timestamp: string; 
  link?: string; 
  linkText?: string; 
  category: 'Contract' | 'Workflow' | 'Template' | 'User' | 'System' | 'AI Action' | 'Security' | 'Report';
}

// Mock data - this should ideally come from a shared source or API
const recentActivityData: DashboardActivity[] = [
  { id: "ra1", icon: UploadCloud, description: "Contract 'Alpha Project MSA' was uploaded.", user: "Alice Wonderland", timestamp: "2 hours ago", link: "/dashboard/contracts/c1", linkText: "View Contract", category: "Contract" },
  { id: "ra2", icon: FileCheck2, description: "Workflow for 'Beta NDA' was started.", user: "Admin", timestamp: "5 hours ago", link: "/dashboard/workflows/wf1", linkText: "Track Workflow", category: "Workflow"},
  { id: "ra3", icon: FilePenLine, description: "Template 'Freelancer Agreement' was updated.", user: "Admin", timestamp: "1 day ago", link: "/dashboard/templates/t1/edit", linkText: "Edit Template", category: "Template" },
  { id: "ra4", icon: LogIn, description: "User 'Bob The Builder' logged in.", user: "Bob The Builder", timestamp: "2 days ago", category: "User" },
  { id: "ra5", icon: MessageSquare, description: "New comment added to 'Gamma SLA' discussion.", user: "Carol Danvers", timestamp: "3 days ago", link: "/dashboard/contracts/c3#comments", linkText: "View Comment", category: "Contract"},
];

export function ActivityFeedDropdown() {
  const { user } = useAuth();
  const [activityFilter, setActivityFilter] = useState<string>("All");

  const filteredActivity = useMemo(() => {
    return recentActivityData.filter(
      (act) => activityFilter === "All" || act.category === act.category // simplified filter for dropdown
    );
  }, [activityFilter]);
  
  const activityCount = filteredActivity.length;

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Activity className="h-5 w-5" />
          <span className="sr-only">Activity Feed</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Activity Feed</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="xs" className="text-xs text-muted-foreground px-2 h-7">
                        <ListFilter className="mr-1 h-3 w-3" /> {activityFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {["All", "Contract", "Workflow", "Template", "User", "System", "AI Action", "Security", "Report"].map(cat => (
                        <DropdownMenuCheckboxItem key={cat} checked={activityFilter === cat} onCheckedChange={() => setActivityFilter(cat)}>
                          {cat}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
            </div>
            <CardDescription>
              {activityCount > 0 ? `Showing latest ${activityCount} activities.` : "No recent activity."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activityCount > 0 ? (
              <ScrollArea className="h-[280px] p-3">
                <ul className="space-y-3">
                  {filteredActivity.slice(0, 10).map((activity) => ( // Limit to 10 items for dropdown
                    <ActivityFeedItem key={activity.id} activity={activity} />
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center p-6">
                {activityFilter === "All" ? "No recent activity." : `No activity for "${activityFilter}" category.`}
              </p>
            )}
            {recentActivityData.length > 0 && (
              <CardFooter className="border-t pt-3 pb-3">
                 <Button variant="outline" size="sm" className="w-full text-foreground hover:bg-accent hover:text-accent-foreground" disabled> 
                    View Full Audit Log <ArrowRight className="ml-2 h-3.5 w-3.5"/>
                </Button>
              </CardFooter>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
