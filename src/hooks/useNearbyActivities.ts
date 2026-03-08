import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserLocation, calculateDistance } from "./useUserLocation";

export function useNearbyActivities(radiusKm = 2, limit = 3) {
  const { location } = useUserLocation();

  return useQuery({
    queryKey: ["nearby-activities", location?.latitude, location?.longitude, radiusKm],
    queryFn: async () => {
      if (!location) return [];

      // Fetch activities and filter by distance client-side
      const { data, error } = await supabase
        .from("activities")
        .select("id, name, category, hero_image_url, rating, address, latitude, longitude, is_open")
        .eq("is_open", true)
        .eq("is_event", false)
        .limit(200);

      if (error) throw error;

      return (data || [])
        .map(a => ({
          ...a,
          distance: calculateDistance(location.latitude, location.longitude, Number(a.latitude), Number(a.longitude)),
        }))
        .filter(a => a.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    },
    enabled: !!location,
    staleTime: 5 * 60_000,
  });
}
