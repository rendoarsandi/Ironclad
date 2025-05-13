import { UserNav } from "./user-nav";
import { cn } from "@/lib/utils";
import { TaskAlerts } from "./task-alerts";
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { ActivityFeedDropdown } from "./activity-feed-dropdown";
import { QuickActionsDropdown } from "./quick-actions-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  className?: string;
  onToggleSidebar: () => void; // Callback to toggle sidebar
  isSidebarOpen: boolean; // State of the sidebar
}

export function Header({ className, onToggleSidebar, isSidebarOpen }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 dark:bg-neutral-900 dark:border-neutral-700",
        className
      )}
    >
      {/* Mobile Sidebar Trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <Menu />
      </Button>

      {/* Desktop Sidebar Toggle - Moved from DashboardLayout to Header for consistency */}
      <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8 p-0 hidden md:flex text-muted-foreground hover:text-foreground"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </Button>

      <div className="flex-1">
        {/* Add breadcrumbs or page title here if needed */}
      </div>
      <div className="flex items-center gap-1 sm:gap-2"> {/* Adjusted gap */}
        <QuickActionsDropdown />
        <ActivityFeedDropdown />
        <TaskAlerts />
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
