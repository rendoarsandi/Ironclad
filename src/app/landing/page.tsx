
"use client";

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import Link from 'next/link';
import { LogIn, UserPlus, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth-context';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Hero } from '@/components/blocks/hero'; // Import the new Hero component

export default function LandingPage() {
  const { user, loading } = useAuth();

  let heroActions = [];
  if (!loading) {
    if (user) {
      heroActions.push({
        label: "Go to Dashboard",
        href: "/dashboard",
        variant: "default" as const,
      });
    } else {
      heroActions.push({
        label: "Get Started Free",
        href: "/auth/signup",
        variant: "default" as const,
      });
      heroActions.push({
        label: "Learn More",
        href: "#features-placeholder", // Placeholder, actual features section removed for now
        variant: "outline" as const,
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 dark:bg-background/70 backdrop-blur-md border-b border-border/20 dark:border-border/30 shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {!loading && user ? (
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-shadow">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
                </Link>
              </Button>
            ) : !loading && !user ? (
              <>
                <Button variant="ghost" asChild className="text-primary hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors">
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Link>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up Free
                  </Link>
                </Button>
              </>
            ) : null}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content using Hero component */}
      <main className="flex-1">
        <Hero
          title={<>KontrakPro: <span className="text-primary">Intelligent</span> CLM</>}
          subtitle="Streamline your entire contract lifecycle with AI-powered automation, robust security, and seamless collaboration. From creation to e-signature, KontrakPro simplifies complexity and empowers your legal team."
          actions={heroActions}
          titleClassName="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
          subtitleClassName="text-lg md:text-xl max-w-3xl"
          actionsClassName="mt-10"
        />
        {/* Placeholder for future sections like features or testimonials */}
        {/* <section id="features-placeholder" className="py-16 sm:py-24 bg-muted/30 dark:bg-muted/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Features Coming Soon...</h2>
          </div>
        </section> */}
      </main>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border/20 dark:border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo className="justify-center mb-4"/>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm">
            © {new Date().getFullYear()} KontrakPro. All rights reserved. Elevating Legal Operations.
          </p>
          <div className="mt-4 space-x-4">
            <Link href="/terms" className="text-sm text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:underline">Privacy Policy</Link>
             <Link href="#contact" className="text-sm text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:underline">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
