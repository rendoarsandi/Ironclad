
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, type LucideIcon as LucideIconType } from 'lucide-react'; // Changed import alias
import { Button } from '@/components/ui/button';

interface DashboardActivity {
  id: string;
  icon: LucideIconType; // Use aliased type
  description: string;
  user?: string;
  timestamp: string;
  link?: string;
  linkText?: string;
  category: 'Contract' | 'Workflow' | 'Template' | 'User' | 'System' | 'AI Action' | 'Security' | 'Report';
}

interface ActivityFeedItemProps {
  activity: DashboardActivity;
}

const ActivityFeedItemComponent: React.FC<ActivityFeedItemProps> = ({ activity }) => {
  return (
    <li className="flex items-start space-x-3 group">
      <div className="flex-shrink-0 mt-1 bg-muted/50 dark:bg-muted/20 p-1.5 rounded-full shadow-sm">
        <activity.icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-sm flex-grow">
        <p className="text-foreground leading-snug dark:text-foreground">
          {activity.description}
          {activity.user && <span className="font-semibold text-accent"> {activity.user}</span>}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted-foreground flex items-center dark:text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" /> {activity.timestamp}
          </p>
          {activity.link && activity.linkText && (
            <Link href={activity.link} passHref>
              <Button variant="link" size="sm" className="text-xs h-auto p-0 text-accent hover:text-accent/80 dark:text-accent dark:hover:text-accent/80">
                {activity.linkText} <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </li>
  );
};

export const ActivityFeedItem = React.memo(ActivityFeedItemComponent);

