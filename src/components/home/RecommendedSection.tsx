import { ActivityCard } from "./ActivityCard";
import { useRecommendedActivities } from "@/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedList, AnimatedListItem } from "@/components/ui/AnimatedList";

export function RecommendedSection() {
  const { data: activities, isLoading, error } = useRecommendedActivities(15);

  if (error) {
    console.error("Failed to load recommended activities:", error);
  }

  return (
    <section className="space-y-4">
      <h2 className="section-header">Recommended For You</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <div className="pt-2.5 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : activities && activities.length > 0 ? (
        <AnimatedList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5" staggerDelay={0.06}>
          {activities.map((activity) => (
            <AnimatedListItem key={activity.id}>
              <ActivityCard activity={activity} />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      ) : (
        <p className="text-muted-foreground text-sm">No activities found</p>
      )}
    </section>
  );
}
