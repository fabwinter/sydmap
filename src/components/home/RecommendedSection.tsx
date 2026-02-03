import { ActivityCard } from "./ActivityCard";
import { useRecommendedActivities } from "@/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeleton";

export function RecommendedSection() {
  const { data: activities, isLoading, error } = useRecommendedActivities(12);

  if (error) {
    console.error("Failed to load recommended activities:", error);
  }

  return (
    <section className="space-y-4">
      <h2 className="section-header">Recommended For You</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="aspect-[4/3] rounded-t-xl" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))
        ) : activities && activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="text-muted-foreground text-sm col-span-2">No activities found</p>
        )}
      </div>
    </section>
  );
}
