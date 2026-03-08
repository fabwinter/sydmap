export function ActivityCardSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-muted aspect-[4/3] animate-pulse">
      <div className="h-full w-full relative">
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
          <div className="h-4 w-3/4 bg-muted-foreground/10 rounded" />
          <div className="h-3 w-1/2 bg-muted-foreground/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </div>
  );
}
