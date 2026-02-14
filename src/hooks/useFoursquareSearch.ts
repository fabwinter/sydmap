import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserLocation, calculateDistance } from "@/hooks/useUserLocation";
import { useSearchFilters, type SearchFilters } from "@/hooks/useSearchFilters";

export interface FoursquareVenue {
  id: string;
  name: string;
  category: string;
  tags: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  photos: string[];
  rating: number | null;
  phone: string | null;
  website: string | null;
  source: "foursquare";
}

async function searchFoursquare(
  query: string,
  lat: number,
  lng: number,
  radius = 10000,
  limit = 20
): Promise<FoursquareVenue[]> {
  const { data, error } = await supabase.functions.invoke("search-foursquare", {
    body: { query, lat, lng, radius, limit },
  });

  if (error) {
    console.error("Foursquare search error:", error);
    throw error;
  }

  return data as FoursquareVenue[];
}

const SYDNEY_LAT = -33.8688;
const SYDNEY_LNG = 151.2093;

/** Map app categories to Foursquare category name fragments for matching */
const categoryMatchMap: Record<string, string[]> = {
  Cafe: ["cafe", "coffee", "tea"],
  Restaurant: ["restaurant", "dining", "food", "eatery", "bistro", "grill"],
  Bar: ["bar", "pub", "lounge", "cocktail", "brewery", "tavern"],
  Beach: ["beach"],
  Park: ["park", "garden", "trail", "nature"],
  Museum: ["museum", "gallery", "art", "exhibit"],
  Shopping: ["shop", "store", "mall", "market", "boutique"],
  Gym: ["gym", "fitness", "sport", "yoga", "pilates"],
  Bakery: ["bakery", "pastry", "bread", "patisserie"],
};

function matchesCategory(venue: FoursquareVenue, category: string): boolean {
  const keywords = categoryMatchMap[category];
  if (!keywords) return false;
  const venueCat = venue.category.toLowerCase();
  const venueTags = venue.tags.toLowerCase();
  return keywords.some((kw) => venueCat.includes(kw) || venueTags.includes(kw));
}

function applyFiltersToVenues(
  venues: FoursquareVenue[],
  filters: SearchFilters,
  userLat: number,
  userLng: number
): FoursquareVenue[] {
  return venues.filter((v) => {
    // Category filter
    if (filters.category && !matchesCategory(v, filters.category)) return false;
    // Min rating
    if (filters.minRating !== null && (v.rating ?? 0) < filters.minRating) return false;
    // Distance
    if (filters.maxDistance !== null) {
      const dist = calculateDistance(userLat, userLng, v.latitude, v.longitude);
      if (dist > filters.maxDistance) return false;
    }
    return true;
  });
}

export function useFoursquareSearch(query: string, enabled = true) {
  const { location } = useUserLocation();
  const { filters } = useSearchFilters();
  const lat = location?.latitude ?? SYDNEY_LAT;
  const lng = location?.longitude ?? SYDNEY_LNG;
  // Use maxDistance as API radius (convert km to meters), default 10km
  const radiusMeters = filters.maxDistance ? filters.maxDistance * 1000 : 10000;

  return useQuery({
    queryKey: ["foursquare", query, lat, lng, radiusMeters],
    queryFn: async () => {
      const raw = await searchFoursquare(query, lat, lng, radiusMeters, 30);
      return applyFiltersToVenues(raw, filters, lat, lng);
    },
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}
