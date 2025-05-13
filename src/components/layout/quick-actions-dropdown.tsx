
"use client";

import Link from "next/link";
import { Zap, FileSignature, FilePlus2, Edit3, SearchCheck, BarChart3, Workflow, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth-context";
import { useMemo } from "react";

interface QuickAction {
  href: string;
  label: string;
  icon: LucideIcon;
  sub?: string; // Sub-text or description for the action
  roles?: string[]; // Roles that can see this action
}

export function QuickActionsDropdown() {
  const { user } = useAuth();

  const quickActionsList = useMemo(() => [
      { href: "/dashboard/contracts/new?type=nda", label: "Start NDA", icon: FileSignature },
      { href: "/dashboard/contracts/new?from=template", label: "Use Template", icon: FilePlus2 },
      ...(user?.role === 'admin' ? [{ href: "/dashboard/templates/new", label: "New Template", icon: Edit3 }] : []),
      { href: "/dashboard/repository", label: "Advanced Search", icon: SearchCheck },
      { href: "/dashboard/reports/new", label: "New Report", icon: BarChart3, roles: ['admin'] },
      { href: "/dashboard/workflows/new", label: "New Workflow", icon: Workflow, roles: ['admin'] },
  ].filter(action => !action.roles || action.roles.includes(user?.role || 'user')), [user?.role]);

  if (!user || quickActionsList.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Zap className="h-5 w-5" />
          <span className="sr-only">Quick Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-semibold">Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {quickActionsList.map((action) => (
            <DropdownMenuItem key={action.href} asChild className="cursor-pointer">
              <Link href={action.href} className="flex items-center w-full">
                <action.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{action.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
