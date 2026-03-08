import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface FreemiumLimits {
  checkInsToday: number;
  checkInLimit: number;
  chatMessagesToday: number;
  chatLimit: number;
  playlistCount: number;
  playlistLimit: number;
  isPremium: boolean;
}

export function useFreemiumLimits() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["freemium-limits", profile?.id],
    queryFn: async (): Promise<FreemiumLimits> => {
      if (!profile?.id) {
        return { checkInsToday: 0, checkInLimit: 3, chatMessagesToday: 0, chatLimit: 5, playlistCount: 0, playlistLimit: 3, isPremium: false };
      }

      const isPremium = profile.is_premium;

      // Today's check-ins
      const today = new Date().toISOString().split("T")[0];
      const { count: checkInsToday } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .gte("created_at", today);

      // Today's chat messages (user messages only)
      const { count: chatMessagesToday } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("message_type", "user")
        .gte("created_at", today);

      // Total playlists
      const { count: playlistCount } = await supabase
        .from("playlists")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      return {
        checkInsToday: checkInsToday || 0,
        checkInLimit: isPremium ? Infinity : 3,
        chatMessagesToday: chatMessagesToday || 0,
        chatLimit: isPremium ? Infinity : 5,
        playlistCount: playlistCount || 0,
        playlistLimit: isPremium ? Infinity : 3,
        isPremium,
      };
    },
    enabled: !!profile?.id,
    staleTime: 30_000,
  });
}
