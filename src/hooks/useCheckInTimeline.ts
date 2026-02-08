import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type TimelineCheckIn = Tables<"check_ins"> & {
  activities: Tables<"activities">;
};

export type GroupedCheckIns = {
  date: string;
  label: string;
  checkIns: TimelineCheckIn[];
};

export function useCheckInTimeline(search?: string, category?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["check-in-timeline", user?.id, search, category],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (!profile) return [];

      let query = supabase
        .from("check_ins")
        .select(`
          *,
          activities (*)
        `)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let items = (data || []) as TimelineCheckIn[];

      // Client-side filtering for search and category
      if (search) {
        const lowerSearch = search.toLowerCase();
        items = items.filter(
          (item) =>
            item.activities?.name?.toLowerCase().includes(lowerSearch) ||
            item.activities?.address?.toLowerCase().includes(lowerSearch) ||
            item.activities?.category?.toLowerCase().includes(lowerSearch)
        );
      }

      if (category && category !== "all") {
        items = items.filter(
          (item) => item.activities?.category?.toLowerCase() === category.toLowerCase()
        );
      }

      // Group by date
      const grouped = new Map<string, TimelineCheckIn[]>();
      for (const item of items) {
        const date = new Date(item.created_at).toLocaleDateString("en-AU", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        const dateKey = new Date(item.created_at).toISOString().split("T")[0];
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(item);
      }

      const result: GroupedCheckIns[] = [];
      for (const [dateKey, checkIns] of grouped) {
        const d = new Date(dateKey);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let label: string;
        if (d.toDateString() === today.toDateString()) {
          label = "Today";
        } else if (d.toDateString() === yesterday.toDateString()) {
          label = "Yesterday";
        } else {
          label = d.toLocaleDateString("en-AU", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        }

        result.push({ date: dateKey, label, checkIns });
      }

      return result;
    },
    enabled: !!user,
  });
}
