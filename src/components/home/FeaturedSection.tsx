import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ActivityCard } from "./ActivityCard";
import { useFeaturedActivities } from "@/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedList, AnimatedListItem } from "@/components/ui/AnimatedList";

export function FeaturedSection() {
  const { data: activities, isLoading, error } = useFeaturedActivities(10);

  if (error) {
    console.error("Failed to load featured activities:", error);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-warning" />
          <h2 className="section-header mb-0">What's On Today</h2>
        </div>
        <Link
          to="/search?filter=open"
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">Right now, close to you</p>
      
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
              <ActivityCard activity={activity} variant="featured" />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      ) : (
        <p className="text-muted-foreground text-sm">No activities found</p>
      )}
    </section>
  );
}
