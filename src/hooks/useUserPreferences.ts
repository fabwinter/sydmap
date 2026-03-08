import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserPreferences {
  id: string;
  user_id: string;
  categories: string[];
  explore_with: string;
  max_distance: number;
  onboarding_completed: boolean;
}

export function useUserPreferences() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["user-preferences", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", profile!.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserPreferences | null;
    },
  });
}

export function useSavePreferences() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (prefs: {
      categories: string[];
      explore_with: string;
      max_distance: number;
    }) => {
      const { error } = await supabase.from("user_preferences").upsert(
        {
          user_id: profile!.id,
          categories: prefs.categories as any,
          explore_with: prefs.explore_with,
          max_distance: prefs.max_distance,
          onboarding_completed: true,
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });
}
