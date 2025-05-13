"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-context';
import { Loader2, FileText, PanelLeftClose, PanelRightClose, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar, SidebarBody, SidebarLink, useSidebar, SidebarProvider } from "@/components/ui/sidebar"; // Ensure SidebarProvider is exported and imported
import { Header } from "@/components/layout/header";
import { mainNavItems } from "@/config/nav";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { KontrakProChatbot } from '@/components/chatbot/kontrakpro-chatbot'; // Import the chatbot

const KontrakProLogo = () => {
  const { animate } = useSidebar();
  return (
    <Link
      href="/landing"
      className="font-normal flex space-x-2 items-center text-sm py-1 px-2 relative z-20" // Added px-2
    >
      <FileText className="h-7 w-7 text-accent flex-shrink-0" />
      <motion.span
        initial={{ opacity: animate ? 0 : 1 }}
        animate={{ opacity: animate ? 1 : 1, display: animate ? 'inline-block' : 'inline-block' }}
        transition={{ duration: 0.3, delay: animate ? 0.1 : 0 }}
        className="font-semibold text-xl text-primary dark:text-primary-foreground whitespace-pre"
      >
        KontrakPro
      </motion.span>
    </Link>
  );
};

const KontrakProLogoIcon = () => {
  return (
    <Link
      href="/landing"
      className="font-normal flex items-center justify-center text-sm py-1 relative z-20 h-[36px] w-[52px]" // Ensure consistent height and width for collapsed state
    >
      <FileText className="h-7 w-7 text-accent flex-shrink-0" />
    </Link>
  );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarManuallyToggled, setIsSidebarManuallyToggled] = useState(false); 
  // Default to true for desktop, false for mobile needs to be handled by CSS or a hook
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 


  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);
  
  // This effect ensures that on mobile, the sidebar is closed by default after navigation.
  useEffect(() => {
    if (window.innerWidth < 768) { // md breakpoint
      setIsSidebarOpen(false);
    }
  }, [pathname]);


  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const userCanView = (itemRoles?: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true;
    return user.role && itemRoles.includes(user.role);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsSidebarManuallyToggled(true); // User has interacted
  };


  return (
    // Wrap with SidebarProvider here
    <SidebarProvider open={isSidebarOpen} setOpen={setIsSidebarOpen} animate={!isSidebarManuallyToggled}>
      <div className="flex h-screen bg-muted/20 dark:bg-background">
        <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} animate={!isSidebarManuallyToggled}>
          <SidebarBody className="justify-between flex flex-col gap-6 py-3 px-1 bg-card dark:bg-neutral-900 border-r border-border dark:border-neutral-700">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <div className="flex items-center justify-between px-2 mb-4">
                {isSidebarOpen ? <KontrakProLogo /> : <KontrakProLogoIcon />}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar} 
                  className="h-8 w-8 p-0 md:flex hidden text-muted-foreground hover:text-foreground"
                  aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                </Button>
              </div>
              
              <nav className="mt-2 flex flex-col gap-1">
                {mainNavItems.filter(item => userCanView(item.roles)).map((item) => (
                  <SidebarLink
                    key={item.href}
                    link={{
                      label: item.title,
                      href: item.href,
                      icon: <item.icon className={cn("h-5 w-5 flex-shrink-0", (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) ? "text-accent" : "text-muted-foreground group-hover/sidebar:text-foreground" )} />,
                    }}
                    className={cn(
                      "hover:bg-muted dark:hover:bg-muted/50 rounded-md mx-1", // Added mx-1 for slight inset
                      (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) && "bg-muted dark:bg-muted/50 text-accent dark:text-accent font-medium"
                    )}
                  />
                ))}
              </nav>
            </div>
            
            {user && (
              <div className="px-1 py-2 border-t border-border dark:border-neutral-700">
                <SidebarLink
                  link={{
                    label: user.name || user.email || "Profile",
                    href: "/dashboard/settings",
                    icon: (
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage src={user.avatarUrl} alt={user.name || user.email} data-ai-hint="user avatar"/>
                        <AvatarFallback>
                          {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                        </AvatarFallback>
                      </Avatar>
                    ),
                  }}
                  className="hover:bg-muted dark:hover:bg-muted/50 rounded-md mx-1"
                />
              </div>
            )}
          </SidebarBody>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-muted/30 dark:bg-muted/10">
            {children}
          </main>
        </div>
        <KontrakProChatbot />
      </div>
    </SidebarProvider>
  );
}
