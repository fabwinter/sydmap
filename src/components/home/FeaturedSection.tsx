import { Sparkles } from "lucide-react";
import { useFeaturedActivities } from "@/hooks/useActivities";
import { ActivityCarouselSection } from "./ActivityCarouselSection";

export function FeaturedSection() {
  const { data: activities, isLoading, error } = useFeaturedActivities(10);

  if (error) {
    console.error("Failed to load featured activities:", error);
  }

  return (
    <ActivityCarouselSection
      title="What's On Today"
      subtitle="Right now, close to you"
      icon={<Sparkles className="w-5 h-5 text-warning" />}
      activities={activities}
      isLoading={isLoading}
      linkTo="/explore?section=whats-on"
    />
  );
}
