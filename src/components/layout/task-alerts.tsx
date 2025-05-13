
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Bell, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TaskItem } from "@/types";
import { useAuth } from "@/hooks/use-auth-context";


// Mock data for tasks - this should ideally come from a shared source or API
const taskData: TaskItem[] = [
  { id: "task1", title: "Review MSA with 'Tech Solutions Inc.'", dueDate: "2 days", priority: "High", link: "/dashboard/reviews/r1", type: "Review", contractName: "Tech Solutions MSA", status: "Pending" },
  { id: "task2", title: "Follow up on NDA with 'Innovate Labs'", dueDate: "5 days", priority: "Medium", link: "/dashboard/contracts/c2", type: "Follow-up", contractName: "Innovate Labs NDA", status: "In Progress" },
  { id: "task3", title: "Contract 'Service Agreement Q1' expiring", dueDate: "15 days", priority: "High", link: "/dashboard/contracts/c4", type: "Renewal", contractName: "Service Agreement Q1", status: "Pending" },
  { id: "task4", title: "Request e-signature for 'Project Zeta SOW'", dueDate: "Tomorrow", priority: "High", link: "/dashboard/contracts/c5", type: "Signature", contractName: "Project Zeta SOW", status: "Overdue" },
  { id: "task5", title: "Check compliance for 'Data Processing Addendum'", dueDate: "1 week", priority: "Medium", type: "Obligation", contractName: "Data Processing Addendum", status: "In Progress" },
];

export function TaskAlerts() {
  const { user } = useAuth();
  const [taskFilter, setTaskFilter] = useState<string>("All");

  const pendingOrOverdueTasks = useMemo(() => {
    return taskData.filter(task => task.status === "Pending" || task.status === "Overdue");
  }, []);

  const filteredTasks = useMemo(() => {
    if (taskFilter === "All") return pendingOrOverdueTasks;
    return pendingOrOverdueTasks.filter(task => task.type === taskFilter);
  }, [pendingOrOverdueTasks, taskFilter]);

  const getPriorityBadgeVariant = (priority: TaskItem["priority"]) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "default";
    }
  };
  
  const pendingTasksCount = pendingOrOverdueTasks.length;

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {pendingTasksCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {pendingTasksCount}
            </Badge>
          )}
          <span className="sr-only">Task Alerts</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <Card className="border-0 shadow-none bg-background text-foreground">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg text-foreground">Your Tasks & Reminders</CardTitle>
            <CardDescription className="text-muted-foreground">
              {pendingTasksCount > 0 ? `You have ${pendingTasksCount} pending or overdue tasks.` : "No pending tasks."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {pendingTasksCount > 0 ? (
              <ScrollArea className="h-[280px] p-3">
                <div className="space-y-2">
                  {filteredTasks.map(task => (
                    <Card key={task.id} className="p-2.5 bg-muted/40 hover:shadow-sm transition-shadow border border-border">
                      <div className="flex items-start justify-between">
                          <div className="flex-grow space-y-0.5">
                            <Link href={task.link || "#"} passHref>
                              <span className="font-semibold text-foreground hover:text-primary dark:text-foreground dark:hover:text-primary-foreground/80 hover:underline cursor-pointer text-sm">{task.title}</span>
                            </Link>
                            {task.contractName && <p className="text-xs text-muted-foreground flex items-center"><FileText className="mr-1 h-3 w-3"/>{task.contractName}</p>}
                            <p className="text-xs text-muted-foreground flex items-center"><Clock className="mr-1 h-3 w-3"/>Due: {task.dueDate}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1 shrink-0 ml-2">
                              <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs">{task.priority}</Badge>
                              {task.status && <Badge variant={task.status === "Overdue" ? "destructive" : "outline"} className="text-xs bg-opacity-80">{task.status}</Badge>}
                          </div>
                      </div>
                    </Card>
                  ))}
                   {filteredTasks.length === 0 && taskFilter !== "All" && (
                     <p className="text-sm text-muted-foreground text-center py-4">No tasks for &quot;{taskFilter}&quot; type.</p>
                   )}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center p-6">All caught up! No pending tasks.</p>
            )}
             {user?.role === 'admin' && pendingTasksCount > 0 && (
              <div className="border-t border-border p-3">
                  <Link href="/dashboard/workflows" passHref> 
                      <Button variant="outline" size="sm" className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground">View All Tasks & Workflows</Button>
                  </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

