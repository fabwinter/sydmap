import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ActivityCard } from "./ActivityCard";
import { useFeaturedActivities } from "@/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px]">
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
        <div className="relative group">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {activities.map((activity) => (
                <CarouselItem 
                  key={activity.id} 
                  className="pl-3 md:pl-4 basis-[200px] sm:basis-[220px] md:basis-[240px] lg:basis-[260px]"
                >
                  <ActivityCard activity={activity} variant="featured" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm border-border shadow-lg" />
            <CarouselNext className="hidden md:flex -right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm border-border shadow-lg" />
          </Carousel>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No activities found</p>
      )}
    </section>
  );
}
