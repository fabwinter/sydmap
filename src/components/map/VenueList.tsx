import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Activity } from "@/hooks/useActivities";
import { cn } from "@/lib/utils";

interface VenueListProps {
  activities: Activity[];
  isLoading: boolean;
  selectedActivity: Activity | null;
  onSelectActivity: (activity: Activity) => void;
  onNavigateToDetails: (activity: Activity) => void;
}

const categoryColors: Record<string, string> = {
  Cafe: "bg-accent",
  Beach: "bg-secondary",
  Park: "bg-green-500",
  Restaurant: "bg-red-500",
  Bar: "bg-purple-500",
  Shopping: "bg-pink-500",
  Gym: "bg-orange-500",
  Museum: "bg-indigo-500",
  Bakery: "bg-amber-500",
};

export function VenueList({
  activities,
  isLoading,
  selectedActivity,
  onSelectActivity,
  onNavigateToDetails,
}: VenueListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No places found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          {activities.length} places found
        </p>
        {activities.map((activity) => {
          const isSelected = selectedActivity?.id === activity.id;
          return (
            <div
              key={activity.id}
              className={cn(
                "bg-card rounded-xl p-4 cursor-pointer transition-all border-2",
                isSelected
                  ? "border-primary shadow-md"
                  : "border-transparent hover:border-border hover:shadow-sm"
              )}
              onClick={() => onSelectActivity(activity)}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {activity.hero_image_url ? (
                    <img
                      src={activity.hero_image_url}
                      alt={activity.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs text-white",
                        categoryColors[activity.category] || "bg-primary"
                      )}
                    >
                      {activity.category}
                    </span>
                    {activity.is_open ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">
                        Open
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">
                        Closed
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground truncate">
                    {activity.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      <span>{activity.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                    <span>•</span>
                    <span>{activity.review_count} reviews</span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToDetails(activity);
                  }}
                >
                  View Details
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
