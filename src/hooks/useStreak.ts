import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useStreak() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["user-streak", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { current_streak: 0, longest_streak: 0, last_check_in_date: null };

      const { data, error } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_check_in_date")
        .eq("user_id", profile.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { current_streak: 0, longest_streak: 0, last_check_in_date: null };

      // Check if streak is still active (last check-in was today or yesterday)
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const lastDate = data.last_check_in_date;

      if (lastDate !== today && lastDate !== yesterday) {
        return { current_streak: 0, longest_streak: data.longest_streak, last_check_in_date: lastDate };
      }

      return data;
    },
    enabled: !!profile?.id,
    staleTime: 60_000,
  });
}
