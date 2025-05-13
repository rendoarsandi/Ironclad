
import { Logo } from '@/components/layout/logo';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary/10 via-background to-background">
      <header className="p-4 sm:p-6 absolute top-0 left-0">
        {/* Logo will now always link to /landing */}
        <Logo /> 
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md transform transition-all duration-500 ease-out ">
          {children}
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} KontrakPro. All rights reserved.
      </footer>
    </div>
  );
}
