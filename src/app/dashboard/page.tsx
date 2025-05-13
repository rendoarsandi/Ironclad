
"use client";
import * as React from "react"; // Added React import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth-context";
import { 
  ArrowRight, FileText, FilePlus2, BookOpenCheck, Users, Clock, BarChart3 as BarChart3Icon, UploadCloud, 
  FileSignature, Edit3, AlertTriangle, CheckCircle, ExternalLink, Bell, Eye, Search,
  LogIn, FilePenLine, UserPlus as UserPlusIcon, Settings2, MessageSquare, RotateCcw, History, FileCheck2,
  AlertCircle, TrendingUp, CheckSquare, Archive, Filter, Users2, Folder, Tag, Briefcase, LifeBuoy,
  Columns, LayoutGrid, ListFilter, CalendarClock, Zap, ShieldCheck, Handshake, Lightbulb, Scale as ScaleIcon, SearchCheck, Workflow, SlidersHorizontal, UsersRound, PieChart as PieChartIconLucide
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { KpiCardItem } from "@/components/dashboard/kpi-card-item";
import { OverviewKpiItem } from "@/components/dashboard/overview-kpi-item";
import { ContractStatusOverviewChart } from "@/components/dashboard/contract-status-overview-chart";
import { ContractLifecycleDistributionChart } from "@/components/dashboard/contract-lifecycle-distribution-chart";
// ActivityFeedItem is no longer directly used here, but kept for ActivityFeedDropdown
// QuickActionItem is no longer directly used here, but kept for QuickActionsDropdown
import { RecentlyAccessedItemDisplay } from "@/components/dashboard/recently-accessed-item-display";


import type { ChartConfig } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import type { Icon as LucideIconType } from "lucide-react"; // Renamed to avoid conflict
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useMemo, memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TaskItem } from "@/types"; // Assuming this type might still be used by TaskAlerts
import { ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartContainer } from '@/components/ui/chart';
import { PieChart as RechartsPieChart, Pie, ResponsiveContainer, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { cn } from "@/lib/utils";


// Mock data for Contracts by Status chart
const contractStatusData = [
  { status: "Draft", count: 20, fill: "hsl(var(--chart-4))" }, 
  { status: "Pending Review", count: 5, fill: "hsl(var(--chart-3))" }, 
  { status: "Active", count: 100, fill: "hsl(var(--chart-2))" }, 
  { status: "Archived", count: 25, fill: "hsl(var(--chart-5))" }, 
  { status: "Rejected", count: 10, fill: "hsl(var(--destructive))" }, 
];

const contractStatusChartConfig = {
  count: {
    label: "Contracts",
  },
  draft: { label: "Draft", color: "hsl(var(--chart-4))" },
  pendingReview: { label: "Pending Review", color: "hsl(var(--chart-3))" },
  active: { label: "Active", color: "hsl(var(--chart-2))" },
  archived: { label: "Archived", color: "hsl(var(--chart-5))" },
  rejected: { label: "Rejected", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

// Mock data for contract lifecycle stage distribution
const lifecycleStageData = [
  { name: 'Creation', value: 400, fill: "hsl(var(--chart-1))" },
  { name: 'Negotiation', value: 300, fill: "hsl(var(--chart-2))" },
  { name: 'Approval', value: 300, fill: "hsl(var(--chart-3))" },
  { name: 'Execution', value: 200, fill: "hsl(var(--chart-4))" },
  { name: 'Post-Execution', value: 278, fill: "hsl(var(--chart-5))" },
];

const lifecycleChartConfig = {
  value: { label: "Contracts" },
  Creation: { label: "Creation", color: "hsl(var(--chart-1))" },
  Negotiation: { label: "Negotiation", color: "hsl(var(--chart-2))" },
  Approval: { label: "Approval", color: "hsl(var(--chart-3))" },
  Execution: { label: "Execution", color: "hsl(var(--chart-4))" },
  PostExecution: { label: "Post-Execution", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


interface RecentlyAccessedItem {
  id: string;
  type: 'contract' | 'template' | 'report' | 'workflow' | 'repository_view' | 'clause';
  name: string;
  itemId: string; 
  lastAccessed: string; 
  icon: LucideIconType;
  action?: 'Viewed' | 'Edited' | 'Commented' | 'Created' | 'Generated' | 'Searched' | 'Analyzed';
}

const recentlyAccessedData: RecentlyAccessedItem[] = [
  { id: "rc1", type: 'contract', name: "Master Service Agreement", itemId: "c1", lastAccessed: "5 mins ago", icon: FileText, action: "Viewed" },
  { id: "rc2", type: 'template', name: "Standard Freelance Agreement", itemId: "t1", lastAccessed: "20 mins ago", icon: FilePlus2, action: "Edited" },
  { id: "rc3", type: 'contract', name: "Non-Disclosure Agreement", itemId: "c2", lastAccessed: "1 hour ago", icon: FileText, action: "Viewed" },
  { id: "rc4", type: 'contract', name: "Software License Agreement", itemId: "c3", lastAccessed: "2 hours ago", icon: FileText, action: "Commented"},
  { id: "rc5", type: 'template', name: "Service Level Agreement (SLA)", itemId: "t2", lastAccessed: "1 day ago", icon: FilePlus2, action: "Viewed" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  
  const kpiCards = useMemo(() => [
    { title: "Active Contracts", value: "100", change: "+5 from last month", icon: FileText, color: "text-primary", link: "/dashboard/contracts?status=active" },
    { title: "Pending Reviews", value: "5", link: "/dashboard/reviews?status=pending", icon: BookOpenCheck, color: "text-yellow-500" },
    { title: "Expiring Soon", value: "3", subText: "In next 30 days", icon: AlertTriangle, color: "text-orange-500", link: "/dashboard/contracts?expiry=next_30_days" },
    { title: "Total Value (Active)", value: "$1.2M", subText: "Mocked data", icon: TrendingUp, color: "text-green-500" },
  ], []);
  
  const overviewKpiCards = useMemo(() => [
    { title: "Overdue Tasks", value: "2", link: "/dashboard/tasks?filter=overdue", icon: CalendarClock, color: "text-red-600" },
    { title: "AI Actions This Week", value: "15", subText: "Summaries, insights", icon: Lightbulb, color: "text-purple-500" },
    { title: "Compliance Score", value: "92%", subText: "Based on obligations", icon: ShieldCheck, color: "text-teal-500" },
    { title: "Avg. Negotiation Cycle", value: "7 days", subText: "Last 30 days", icon: Handshake, color: "text-blue-500" },
  ], []);

  // Placeholder for additional dashboard sections
  const teamCollaborationData = [
    { teamMember: "Alice Wonderland", activeContracts: 25, recentActivity: "Uploaded 'MSA Alpha'" },
    { teamMember: "Bob The Builder", activeContracts: 18, recentActivity: "Reviewed 'NDA Beta'" },
    { teamMember: "Carol Danvers", activeContracts: 32, recentActivity: "Commented on 'SLA Gamma'" },
  ];

  const upcomingDeadlinesData = [
    { name: "Contract Omega - Milestone 1", deadline: "3 days", type: "Milestone" },
    { name: "Contract Sigma - Renewal Decision", deadline: "1 week", type: "Renewal" },
    { name: "Contract Epsilon - Compliance Report", deadline: "2 weeks", type: "Obligation" },
  ];


  return (
    <ScrollArea className="h-[calc(100vh-theme(spacing.16))]">
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "User"}!</h1>
          <p className="text-muted-foreground">Here&apos;s your contract management overview for today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/contracts/new?from=template" passHref>
            <Button variant="outline" className="shadow-md hover:shadow-lg transition-shadow">
              <FilePlus2 className="mr-2 h-4 w-4" /> Create Contract
            </Button>
          </Link>
          <Link href="/dashboard/contracts/new" passHref>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-shadow">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Contract
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Dashboard Grid - Now single column that spans full width */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"> {/* Keep lg:grid-cols-3, left content will span 2, new right content will span 1 */}
        
        {/* Left Column Content (Spans 2/3 on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
             {kpiCards.map((card) => (
                <KpiCardItem
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  change={card.change}
                  icon={card.icon}
                  color={card.color}
                  link={card.link}
                  subText={card.subText}
                />
             ))}
          </div>
          
          {/* Enhanced KPI Section */}
           <Card className="shadow-xl border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="flex items-center text-xl"><BarChart3Icon className="mr-2 h-5 w-5 text-primary"/>Key Performance Indicators</CardTitle>
                <Select defaultValue="last_30_days">
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>Track critical metrics for your contract lifecycle.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {overviewKpiCards.map((kpi) => (
                <OverviewKpiItem
                  key={kpi.title}
                  title={kpi.title}
                  value={kpi.value}
                  icon={kpi.icon}
                  color={kpi.color}
                  link={kpi.link}
                  subText={kpi.subText}
                />
              ))}
            </CardContent>
          </Card>


          {/* Tabs for Charts */}
           <Tabs defaultValue="statusOverview">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/60">
              <TabsTrigger value="statusOverview" className="data-[state=active]:bg-background data-[state=active]:shadow-md">Status Overview</TabsTrigger>
              <TabsTrigger value="lifecycleDistribution" className="data-[state=active]:bg-background data-[state=active]:shadow-md">Lifecycle Distribution</TabsTrigger>
            </TabsList>
            <TabsContent value="statusOverview">
             <ContractStatusOverviewChart data={contractStatusData} config={contractStatusChartConfig} />
            </TabsContent>
            <TabsContent value="lifecycleDistribution">
              <ContractLifecycleDistributionChart data={lifecycleStageData} config={lifecycleChartConfig} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column Content (Spans 1/3 on large screens) */}
        <div className="lg:col-span-1 space-y-6">
            {/* Recently Accessed Card */}
            <Card className="shadow-lg border">
                <CardHeader>
                <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5 text-primary"/>Recently Accessed</CardTitle>
                <CardDescription>Quick access to your recent items.</CardDescription>
                </CardHeader>
                <CardContent>
                {recentlyAccessedData.length > 0 ? (
                    <ScrollArea className="h-[200px]">
                    <ul className="space-y-3 pr-3">
                        {recentlyAccessedData.map((item) => (
                        <RecentlyAccessedItemDisplay key={item.id} item={item} />
                        ))}
                    </ul>
                    </ScrollArea>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recently accessed items.</p>
                )}
                </CardContent>
            </Card>

            {/* New Section: Upcoming Deadlines Placeholder */}
            <Card className="shadow-lg border">
                <CardHeader>
                    <CardTitle className="flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-orange-500"/>Upcoming Deadlines</CardTitle>
                    <CardDescription>Key dates and milestones to track.</CardDescription>
                </CardHeader>
                <CardContent>
                    {upcomingDeadlinesData.length > 0 ? (
                        <ul className="space-y-2">
                            {upcomingDeadlinesData.map((item, index) => (
                                <li key={index} className="text-sm p-2 rounded-md bg-muted/50 hover:bg-muted/70">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-foreground">{item.name}</span>
                                        <Badge variant={item.type === "Renewal" ? "destructive" : "secondary"} className="text-xs">{item.type}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Due in: {item.deadline}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>
                    )}
                </CardContent>
                 <CardFooter>
                    <Button variant="link" size="sm" className="w-full" disabled>View All Deadlines</Button>
                </CardFooter>
            </Card>
        </div>
      </div>


      {/* Additional full-width sections below the main grid */}

       {/* New Section: Team Collaboration Placeholder */}
        <Card className="shadow-xl border">
            <CardHeader>
                <CardTitle className="flex items-center"><UsersRound className="mr-2 h-6 w-6 text-primary"/>Team Overview</CardTitle>
                <CardDescription>Summary of team activity and contract ownership.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid md:grid-cols-3 gap-4">
                    {teamCollaborationData.map((member, index) => (
                        <Card key={index} className="p-4 bg-muted/30">
                            <div className="flex items-center gap-3 mb-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://picsum.photos/seed/${member.teamMember.split(' ').join('')}/40`} alt={member.teamMember} data-ai-hint="person avatar" />
                                    <AvatarFallback>{member.teamMember.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-foreground">{member.teamMember}</p>
                                    <p className="text-xs text-muted-foreground">{member.activeContracts} active contracts</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Last activity: {member.recentActivity}</p>
                        </Card>
                    ))}
                 </div>
                 <div className="mt-4 text-center">
                    <Button variant="outline" size="sm" disabled>View Team Performance</Button>
                 </div>
            </CardContent>
        </Card>


      {/* Repository Overview Hint (remains full-width) */}
      <Card className="shadow-xl border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="flex items-center text-xl">
              <Archive className="mr-2 h-6 w-6 text-primary" />
              Contract Repository
            </CardTitle>
             <Link href="/dashboard/repository" passHref>
                <Button variant="outline" size="sm" className="border">
                    Go to Repository <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
            </Link>
          </div>
          <CardDescription>Your central hub for all contracts. Access via the sidebar for advanced search and management.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">Search & Filter</h3>
                <p className="text-muted-foreground text-sm mb-4">
                    Utilize the &quot;Repository&quot; section in the sidebar to search by keywords, filter by metadata (e.g., status, type, counterparty), and manage your contracts effectively. Create custom views and save searches for quick access.
                </p>
                <Link href="/dashboard/repository" passHref>
                    <Button variant="secondary" size="sm">
                        <Search className="mr-2 h-4 w-4"/> Advanced Search
                    </Button>
                </Link>
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-2">Clause Library & AI Analysis</h3>
                 <p className="text-muted-foreground text-sm mb-4">
                    Explore the upcoming Clause Library to manage standard legal language. Leverage AI-powered analysis directly within the repository to identify risks and extract key terms from any contract.
                </p>
                <Link href="/dashboard/clauses" passHref>
                    <Button variant="secondary" size="sm" disabled>
                        <ScaleIcon className="mr-2 h-4 w-4"/> Explore Clause Library (Soon)
                    </Button>
                </Link>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Promotional Banner / Help Section (remains full-width) */}
      <Card className="relative overflow-hidden rounded-lg shadow-xl bg-gradient-to-r from-primary/90 to-accent/80 text-primary-foreground border-none">
        <div className="absolute inset-0 bg-black/10"></div>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between relative z-10">
            <div className="mb-4 sm:mb-0 sm:mr-6">
                <h3 className="text-2xl font-semibold flex items-center"><Lightbulb className="mr-2 h-6 w-6"/>Explore Advanced Features</h3>
                <p className="text-sm opacity-90 mt-1">Unlock AI analytics, workflow automation, and integrations to supercharge your contract management.</p>
            </div>
            <div className="flex gap-2">
                <Link href="/dashboard/ai-tools" passHref> 
                    <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-md">
                        Discover AI Tools <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </Link>
                 <Link href="/dashboard/integrations" passHref> 
                    <Button variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 shadow-md">
                       <Zap className="mr-2 h-4 w-4"/> View Integrations
                    </Button>
                </Link>
            </div>
        </CardContent>
       </Card>
    </div>
    </ScrollArea>
  );
}

// Avatar component for Team Overview - should be in its own file if used elsewhere
const Avatar = ({className, ...props}: React.HTMLAttributes<HTMLDivElement> & {children?: React.ReactNode}) => (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    alt={props.alt || ""}
    {...props}
    width={40} // Default width for consistency
    height={40} // Default height for consistency
  />
));
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback"

