
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed as it's causing an error and not explicitly used
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { DatabaseInitializer } from '@/components/init/database-initializer';

export const metadata: Metadata = {
  title: 'KontrakPro',
  description: 'Smart Contract Lifecycle Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} antialiased font-sans`}> {/* Removed GeistMono.variable */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <DatabaseInitializer />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
