'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MdStorage, MdMemory, MdSpeed, MdCloud } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { StaggerList, StaggerItem } from '@/components/motion';

interface HealthItem {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  detail: string;
  icon: React.ReactNode;
}

const STATUS_COLORS = {
  healthy: 'bg-low',
  degraded: 'bg-medium',
  down: 'bg-critical',
};

const healthItems: HealthItem[] = [
  { name: 'Data Ingestion', status: 'healthy', detail: '1,247 records/min', icon: <MdStorage size={16} /> },
  { name: 'ML Pipeline', status: 'healthy', detail: 'Processing normally', icon: <MdMemory size={16} /> },
  { name: 'Alert Engine', status: 'degraded', detail: 'Slight delay (2.3s avg)', icon: <MdSpeed size={16} /> },
  { name: 'External APIs', status: 'healthy', detail: 'All endpoints responsive', icon: <MdCloud size={16} /> },
];

export function SystemHealth() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <StaggerList className="space-y-3">
          {healthItems.map((item) => (
            <StaggerItem key={item.name}>
              <div className="flex items-center gap-3">
                <div className={cn('h-2 w-2 rounded-full', STATUS_COLORS[item.status])} />
                <div className="text-muted-foreground">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
        <p className="text-xs text-muted-foreground pt-2 mt-3 border-t">Last sync: 2 minutes ago</p>
      </CardContent>
    </Card>
  );
}
