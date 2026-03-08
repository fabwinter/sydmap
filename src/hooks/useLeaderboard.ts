import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LeaderboardEntry = {
  profile_id: string;
  name: string | null;
  avatar_url: string | null;
  check_in_count: number;
  rank: number;
};

export function useLeaderboard(period: "week" | "month" | "all" = "all") {
  return useQuery({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard", {
        p_period: period,
        p_limit: 20,
      });
      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
    staleTime: 60_000,
  });
}
