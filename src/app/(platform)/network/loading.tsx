import { Skeleton } from '@/components/ui/skeleton';

export default function NetworkLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        <Skeleton className="w-72 shrink-0" />
        <Skeleton className="flex-1" />
      </div>
    </div>
  );
}
