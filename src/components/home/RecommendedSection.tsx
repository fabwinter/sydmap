import { useAuth } from "@/hooks/useAuth";
import { usePersonalizedFeed } from "@/hooks/usePersonalizedFeed";
import { useRecommendedActivities } from "@/hooks/useActivities";
import { ActivityCarouselSection } from "./ActivityCarouselSection";

export function RecommendedSection() {
  const { profile } = useAuth();
  
  // Use personalized feed for logged-in users, fallback for guests
  const personalizedQuery = usePersonalizedFeed(15);
  const fallbackQuery = useRecommendedActivities(15);
  
  const isLoggedIn = !!profile;
  const { data: activities, isLoading, error } = isLoggedIn ? personalizedQuery : fallbackQuery;

  if (error) {
    console.error("Failed to load recommended activities:", error);
  }

  return (
    <ActivityCarouselSection
      title={isLoggedIn ? "Recommended For You" : "Popular Near You"}
      activities={activities}
      isLoading={isLoading}
      linkTo="/explore?section=recommended"
    />
  );
}
