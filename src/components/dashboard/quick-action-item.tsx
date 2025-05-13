"use client";

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickAction {
  href: string;
  label: string;
  icon: LucideIcon;
  sub: string;
  roles?: string[];
}

interface QuickActionItemProps {
  action: QuickAction;
}

const QuickActionItemComponent: React.FC<QuickActionItemProps> = ({ action }) => {
  return (
    <Link href={action.href} className="block" passHref>
      <Button 
        variant="outline" 
        className="w-full h-auto p-4 flex flex-col items-start text-left hover:bg-accent/10 hover:border-accent transition-colors shadow-sm border whitespace-normal"
      >
        <action.icon className="mb-2 h-6 w-6 text-primary" /> {/* Increased icon size and margin */}
        <p className="font-semibold text-sm leading-snug text-foreground">{action.label}</p> {/* Ensure foreground color, adjusted line height */}
        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{action.sub}</p> {/* Adjusted line height and added small top margin */}
      </Button>
    </Link>
  );
};

export const QuickActionItem = React.memo(QuickActionItemComponent);

