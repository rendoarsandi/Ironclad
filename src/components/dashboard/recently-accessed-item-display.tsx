"use client";

import React from 'react';
import Link from 'next/link';
import { Eye, type LucideIcon } from 'lucide-react';

interface RecentlyAccessedItem {
  id: string;
  type: 'contract' | 'template' | 'report' | 'workflow' | 'repository_view' | 'clause';
  name: string;
  itemId: string;
  lastAccessed: string;
  icon: LucideIcon;
  action?: 'Viewed' | 'Edited' | 'Commented' | 'Created' | 'Generated' | 'Searched' | 'Analyzed';
}

interface RecentlyAccessedItemDisplayProps {
  item: RecentlyAccessedItem;
}

const RecentlyAccessedItemDisplayComponent: React.FC<RecentlyAccessedItemDisplayProps> = ({ item }) => {
  const getLinkHref = () => {
    switch (item.type) {
      case 'contract': return `/dashboard/contracts/${item.itemId}`;
      case 'template': return `/dashboard/templates/${item.itemId}/edit`;
      case 'report': return `/dashboard/reports/${item.itemId}`;
      case 'workflow': return `/dashboard/workflows/${item.itemId}`;
      case 'repository_view': return `/dashboard/repository?view=${item.itemId}`;
      case 'clause': return `/dashboard/clauses/${item.itemId}`;
      default: return '#';
    }
  };

  return (
    <li className="flex items-center justify-between group p-2 -m-2 rounded-md hover:bg-muted/50 transition-colors">
      <Link href={getLinkHref()} className="flex items-center space-x-3 flex-grow min-w-0">
        <item.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.action || 'Accessed'} {item.lastAccessed}
          </p>
        </div>
      </Link>
      <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
    </li>
  );
};

export const RecentlyAccessedItemDisplay = React.memo(RecentlyAccessedItemDisplayComponent);
