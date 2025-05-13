"use client";

import React from 'react';
import Link from 'next/link';
import type { Icon as LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface KpiCardItemProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  color: string;
  link?: string;
  subText?: string;
}

const KpiCardItemComponent: React.FC<KpiCardItemProps> = ({ title, value, change, icon: Icon, color, link, subText }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out border-l-4" style={{ borderColor: color.startsWith('text-') ? `var(--${color.substring(5)})` : color }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {link ? (
          <Link href={link} passHref>
            <Button variant="link" className="p-0 h-auto text-xs text-accent hover:underline">{change || subText || "View Details"}</Button>
          </Link>
        ) : (
          <p className="text-xs text-muted-foreground">{change || subText}</p>
        )}
      </CardContent>
    </Card>
  );
};

export const KpiCardItem = React.memo(KpiCardItemComponent);
