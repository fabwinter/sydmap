import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useSearchFilters, type SearchFilters } from "@/hooks/useSearchFilters";

export type Activity = Tables<"activities">;

export interface ActivityDisplay {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: string;
  image: string;
  isOpen: boolean;
  closesAt?: string;
}

// Helper to calculate fake distance (since we don't have user location yet)
function calculateFakeDistance(lat: number, lng: number): string {
  // Random distance based on coordinates for demo purposes
  const distance = Math.abs(lat + lng) % 10 + 0.5;
  return `${distance.toFixed(1)} km`;
}

// Helper to extract closing time from hours_close
function extractClosingTime(hoursClose: string | null): string | undefined {
  if (!hoursClose) return undefined;
  return hoursClose.replace(":00", "").toLowerCase();
}

// Transform database activity to display format
export function transformActivity(activity: Activity): ActivityDisplay {
  return {
    id: activity.id,
    name: activity.name,
    category: activity.category,
    rating: activity.rating ?? 0,
    reviewCount: activity.review_count,
    distance: calculateFakeDistance(activity.latitude, activity.longitude),
    image: activity.hero_image_url ?? "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
    isOpen: activity.is_open,
    closesAt: extractClosingTime(activity.hours_close),
  };
}

// Map tags to database boolean columns
const tagToColumn: Record<string, string> = {
  "pet-friendly": "pet_friendly",
  "accessible": "wheelchair_accessible",
  "wifi": "wifi",
  "parking": "parking",
  "outdoor-seating": "outdoor_seating",
};

// Apply filters to query builder
function applyFilters(queryBuilder: any, filters: SearchFilters) {
  let query = queryBuilder;

  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,category.ilike.%${filters.query}%`);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.isOpen) {
    query = query.eq("is_open", true);
  }

  if (filters.minRating !== null) {
    query = query.gte("rating", filters.minRating);
  }

  // Apply tag-based boolean filters
  for (const tag of filters.tags) {
    const column = tagToColumn[tag];
    if (column) {
      query = query.eq(column, true);
    }
  }

  // Category-based tag filters (outdoor/indoor mapped to categories)
  if (filters.tags.includes("outdoor")) {
    query = query.in("category", ["Beach", "Park"]);
  }
  if (filters.tags.includes("indoor")) {
    query = query.in("category", ["Museum", "Gym", "Shopping"]);
  }

  return query;
}

export function useFeaturedActivities(limit = 10) {
  const { filters } = useSearchFilters();
  
  return useQuery({
    queryKey: ["activities", "featured", limit, filters],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select("*")
        .eq("is_open", true) as any;

      // Apply category, rating, and tag filters
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.minRating !== null) {
        query = query.gte("rating", filters.minRating);
      }
      // Apply tag-based boolean filters
      for (const tag of filters.tags) {
        const column = tagToColumn[tag];
        if (column) {
          query = query.eq(column, true);
        }
      }

      const { data, error } = await query
        .order("rating", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as Activity[]).map(transformActivity);
    },
  });
}

export function useRecommendedActivities(limit = 12) {
  const { filters } = useSearchFilters();
  
  return useQuery({
    queryKey: ["activities", "recommended", limit, filters],
    queryFn: async () => {
      let queryBuilder = supabase
        .from("activities")
        .select("*");

      // Apply all filters including search query
      queryBuilder = applyFilters(queryBuilder, filters);

      const { data, error } = await queryBuilder
        .order("review_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data.map(transformActivity);
    },
  });
}

export function useActivityById(id: string) {
  return useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useActivitiesByCategory(category: string, limit = 20) {
  return useQuery({
    queryKey: ["activities", "category", category, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("category", category)
        .order("rating", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data.map(transformActivity);
    },
    enabled: !!category,
  });
}

export function useSearchActivities(query: string, filters?: { category?: string; isOpen?: boolean }) {
  return useQuery({
    queryKey: ["activities", "search", query, filters],
    queryFn: async () => {
      let queryBuilder = supabase
        .from("activities")
        .select("*");

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
      }

      if (filters?.category) {
        queryBuilder = queryBuilder.eq("category", filters.category);
      }

      if (filters?.isOpen) {
        queryBuilder = queryBuilder.eq("is_open", true);
      }

      const { data, error } = await queryBuilder
        .order("rating", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data.map(transformActivity);
    },
    enabled: query.length > 0 || !!filters?.category || !!filters?.isOpen,
  });
}

export function useAllActivities(limit = 100) {
  return useQuery({
    queryKey: ["activities", "all", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
