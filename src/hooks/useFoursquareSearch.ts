import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserLocation } from "@/hooks/useUserLocation";

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

export function useFoursquareSearch(query: string, enabled = true) {
  const { location } = useUserLocation();
  const lat = location?.latitude ?? SYDNEY_LAT;
  const lng = location?.longitude ?? SYDNEY_LNG;

  return useQuery({
    queryKey: ["foursquare", query, lat, lng],
    queryFn: () => searchFoursquare(query, lat, lng),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}
