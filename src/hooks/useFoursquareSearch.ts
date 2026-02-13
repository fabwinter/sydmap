import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  lat = -33.8688,
  lng = 151.2093,
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

export function useFoursquareSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ["foursquare", query],
    queryFn: () => searchFoursquare(query),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}
