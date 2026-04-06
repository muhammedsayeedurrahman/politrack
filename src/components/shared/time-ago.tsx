'use client';

import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface TimeAgoProps {
  timestamp: string;
  className?: string;
}

export function TimeAgo({ timestamp, className }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');
  const date = new Date(timestamp);

  useEffect(() => {
    setTimeAgo(getTimeAgo(date));
    const interval = setInterval(() => setTimeAgo(getTimeAgo(date)), 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <Tooltip>
      <TooltipTrigger render={<time dateTime={timestamp} className={cn('text-xs text-muted-foreground whitespace-nowrap', className)} />}>
        {timeAgo}
      </TooltipTrigger>
      <TooltipContent>
        {date.toLocaleDateString('en-IN', { dateStyle: 'long' })} at {date.toLocaleTimeString('en-IN', { timeStyle: 'short' })}
      </TooltipContent>
    </Tooltip>
  );
}
