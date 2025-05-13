"use client";

import React from 'react';
import Link from 'next/link';
import type { Icon as LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OverviewKpiItemProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: string;
  link?: string;
  subText?: string;
}

const OverviewKpiItemComponent: React.FC<OverviewKpiItemProps> = ({ title, value, icon: Icon, color, link, subText }) => {
  return (
    <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors shadow-sm hover:shadow-md">
      <Icon className={`mx-auto h-7 w-7 mb-2 ${color || 'text-primary'}`} />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {link ? (
        <Link href={link} passHref>
          <Button variant="link" size="sm" className="p-0 h-auto text-xs text-accent hover:underline">{subText || "Details"}</Button>
        </Link>
      ) : (
        subText && <p className="text-xs text-muted-foreground/80">{subText}</p>
      )}
    </div>
  );
};

export const OverviewKpiItem = React.memo(OverviewKpiItemComponent);
