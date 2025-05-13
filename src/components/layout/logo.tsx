
"use client";

import { FileText } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  // The logo will now always link to the landing page.
  const href = "/landing"; 

  return (
    <Link href={href} className={`flex items-center gap-2 text-primary ${className}`}>
      <FileText className="h-8 w-8 text-accent" /> {/* Slightly larger icon */}
      {!iconOnly && (
        <h1 className="text-2xl font-bold tracking-tight text-primary"> {/* Slightly larger text */}
          KontrakPro
        </h1>
      )}
    </Link>
  );
}
