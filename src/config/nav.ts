
import type { UserRole } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpenCheck,
  FilePlus2,
  Settings,
  Archive,
  Workflow,
  BarChart3,
  AlertTriangle,
  FileSearch,
  FileUp,
  History,
  UsersRound,
  SlidersHorizontal,
  ListChecks,
  ClipboardEdit,
  BellDot,
  Brain, // For AI Tools
  PieChart as PieChartIcon, // Renamed to avoid conflict with component
  Share2, // For Integrations
  Scale, // For Clause Library
  PenLine // For Signature
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  roles?: UserRole[]; // Roles that can see this item
  description?: string; // Optional description for tooltips or extended display
  badge?: string | number; // Optional badge content
  children?: NavItem[]; // For nested navigation
}

export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your contract activities and key metrics."
  },
  {
    title: "Contracts",
    href: "/dashboard/contracts",
    icon: FileText,
    description: "Manage and view all your contracts."
  },
  {
    title: "Signature",
    href: "/dashboard/signature",
    icon: PenLine,
    description: "Manage electronic signatures and signature requests."
  },
  {
    title: "Repository",
    href: "/dashboard/repository",
    icon: Archive,
    description: "Advanced search and centralized access to all contracts."
  },
  {
    title: "Reviews",
    href: "/dashboard/reviews",
    icon: BookOpenCheck,
    description: "Track and manage contract review cycles."
  },
  {
    title: "AI Tools",
    href: "/dashboard/ai-tools",
    icon: Brain,
    description: "Access AI-powered contract analysis and insights.",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: PieChartIcon,
    description: "Visualize contract data and performance metrics.",
    roles: ['admin'],
  },
  {
    title: "Clause Library",
    href: "/dashboard/clauses",
    icon: Scale,
    description: "Manage and utilize standard legal clauses.",
    roles: ['admin'],
  },
   {
    title: "Integrations",
    href: "/dashboard/integrations",
    icon: Share2,
    description: "Connect KontrakPro with other applications.",
    roles: ['admin'],
  },
  {
    title: "Templates",
    href: "/dashboard/templates",
    icon: FilePlus2,
    roles: ['admin'],
    description: "Create and manage reusable contract templates."
  },
  {
    title: "Workflows",
    href: "/dashboard/workflows",
    icon: Workflow,
    roles: ['admin'],
    description: "Automate and manage contract approval and lifecycle processes."
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ['admin'],
    description: "Generate and view reports on contract data and performance."
  },
];

export const userNavItems: NavItem[] = [
   {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    children: [
      {
        title: "Profile",
        href: "/dashboard/settings/profile",
        icon: UsersRound,
        description: "Manage your personal profile settings."
      },
      {
        title: "Team",
        href: "/dashboard/settings/team",
        icon: Users,
        description: "Manage your team members and permissions."
      },
      {
        title: "Preferences",
        href: "/dashboard/settings/preferences",
        icon: SlidersHorizontal,
        description: "Customize your application preferences."
      },
      {
        title: "Notifications",
        href: "/dashboard/settings/notifications",
        icon: BellDot,
        description: "Configure your notification settings."
      }
    ]
  },
];

