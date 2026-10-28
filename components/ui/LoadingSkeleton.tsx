import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-stone-200/80 rounded-lg', className)} />;
}

export function PlaceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-3 shadow-xs">
      <Skeleton className="w-full aspect-[16/10] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <Skeleton className="h-3.5 w-1/2 rounded-md" />
      </div>
      <div className="flex gap-1.5 pt-1">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function PlaceDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <Skeleton className="w-full aspect-[21/9] rounded-3xl" />
      <div className="space-y-3 max-w-xl">
        <Skeleton className="h-8 w-2/3 rounded-xl" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>
    </div>
  );
}
