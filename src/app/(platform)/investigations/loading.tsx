import { Skeleton } from '@/components/ui/skeleton';

export default function InvestigationsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-0 h-[calc(100vh-12rem)] border rounded-lg overflow-hidden">
        <Skeleton className="w-72 shrink-0" />
        <Skeleton className="flex-1" />
        <Skeleton className="w-72 shrink-0" />
      </div>
    </div>
  );
}
