import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserLocation, calculateDistance, formatDistance } from "@/hooks/useUserLocation";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import type { Activity, ActivityDisplay } from "@/hooks/useActivities";
import { transformActivity } from "@/hooks/useActivities";

const SYDNEY_LAT = -33.8688;
const SYDNEY_LNG = 151.2093;

/**
 * Scores and ranks activities based on user preferences and behavioral signals.
 * Falls back to rating-based sorting when no profile/preferences exist.
 */
export function usePersonalizedFeed(limit = 15) {
  const { profile } = useAuth();
  const { location } = useUserLocation();
  const { data: prefs } = useUserPreferences();
  const lat = location?.latitude ?? SYDNEY_LAT;
  const lng = location?.longitude ?? SYDNEY_LNG;

  const profileId = profile?.id;
  const personalizationEnabled = prefs?.personalization_enabled ?? false;

  return useQuery({
    queryKey: ["personalized-feed", profileId, personalizationEnabled, prefs, lat, lng, limit],
    queryFn: async () => {
      // Fetch activities
      const { data: activities, error } = await supabase
        .from("activities")
        .select("*")
        .order("rating", { ascending: false })
        .limit(200);

      if (error) throw error;
      if (!activities?.length) return [];

      // If no personalization, just return by rating + distance
      if (!personalizationEnabled || !profileId) {
        return activities
          .slice(0, limit)
          .map((a) => transformActivity(a, lat, lng));
      }

      // Fetch behavioral signals in parallel
      const [checkInsRes, savedRes] = await Promise.all([
        supabase
          .from("check_ins")
          .select("activity_id, rating, activities(category)")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("saved_items")
          .select("activity_id, activities(category)")
          .eq("user_id", profileId)
          .limit(50),
      ]);

      // Build category affinity from check-ins, saved items
      const categoryScores: Record<string, number> = {};
      const visitedIds = new Set<string>();

      checkInsRes.data?.forEach((ci: any) => {
        visitedIds.add(ci.activity_id);
        const cat = ci.activities?.category;
        if (cat) {
          categoryScores[cat] = (categoryScores[cat] || 0) + (ci.rating >= 4 ? 3 : 1);
        }
      });

      savedRes.data?.forEach((s: any) => {
        const cat = s.activities?.category;
        if (cat) {
          categoryScores[cat] = (categoryScores[cat] || 0) + 2;
        }
      });

      // Boost from onboarding categories
      const prefCategories = (prefs?.categories as string[]) ?? [];
      prefCategories.forEach((cat) => {
        categoryScores[cat] = (categoryScores[cat] || 0) + 5;
      });

      // Boost from vibe preferences
      const vibeToCategory: Record<string, string[]> = {
        outdoors: ["Beach", "Park", "Walks"],
        cultural: ["Museum", "Tourist Attraction", "Library"],
        active: ["Sports & Recreation", "Swimming Pool"],
        quiet: ["Cafe", "Library", "Bakery"],
        lively: ["Restaurant", "Shopping"],
      };

      const vibes = (prefs?.vibe as string[]) ?? [];
      vibes.forEach((v) => {
        vibeToCategory[v]?.forEach((cat) => {
          categoryScores[cat] = (categoryScores[cat] || 0) + 3;
        });
      });

      // Max distance from preferences
      const maxDist = prefs?.max_distance ?? 20;

      // Score each activity
      const scored = activities.map((a) => {
        let score = 0;
        const dist = calculateDistance(lat, lng, a.latitude, a.longitude);

        // Distance penalty (filter out if too far)
        if (dist > maxDist) return { activity: a, score: -1, dist };

        // Category affinity (0-15 points)
        score += categoryScores[a.category] || 0;

        // Rating boost (0-5 points)
        score += (a.rating ?? 0);

        // Popularity boost (0-3 points)
        score += Math.min(a.review_count / 100, 3);

        // Proximity boost (0-5 points, closer = more)
        score += Math.max(0, 5 - dist);

        // Open now bonus
        if (a.is_open) score += 2;

        // Already visited penalty (slight) - we still show them but deprioritize
        if (visitedIds.has(a.id)) score -= 3;

        // Accessibility matching
        const accNeeds = (prefs?.accessibility_needs as string[]) ?? [];
        if (accNeeds.includes("wheelchair") && a.wheelchair_accessible) score += 2;
        if (accNeeds.includes("parking") && a.parking) score += 1;
        if (accNeeds.includes("family") && a.family_friendly) score += 2;
        if (accNeeds.includes("pet") && a.pet_friendly) score += 1;

        return { activity: a, score, dist };
      });

      return scored
        .filter((s) => s.score >= 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((s) => transformActivity(s.activity, lat, lng));
    },
  });
}
