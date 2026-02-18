import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WhatsOnItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  date?: string;
  source: string;
  activityId?: string; // set if imported into DB
}

async function fetchWhatsOnToday(): Promise<WhatsOnItem[]> {
  const { data, error } = await supabase.functions.invoke("whats-on-today");
  if (error) throw error;
  const items: WhatsOnItem[] = data?.items ?? [];

  // Check which URLs already exist in activities and get their current data
  const urls = items.map((i) => i.url).filter(Boolean);
  if (urls.length > 0) {
    const { data: existing } = await supabase
      .from("activities")
      .select("id, source_url, hero_image_url, event_dates, category, name")
      .in("source_url", urls);

    if (existing?.length) {
      const urlToActivity = new Map(existing.map((e) => [e.source_url, e]));
      for (const item of items) {
        const activity = urlToActivity.get(item.url);
        if (activity) {
          item.activityId = activity.id;
          // Use DB data for thumbnail so edits are reflected
          if (activity.hero_image_url) item.imageUrl = activity.hero_image_url;
          if (activity.event_dates) item.date = activity.event_dates;
          if (activity.category) item.category = activity.category;
          if (activity.name) item.title = activity.name;
        }
      }
    }
  }

  return items;
}

export function useWhatsOnToday(limit = 10) {
  return useQuery({
    queryKey: ["whats-on-today", limit],
    queryFn: async () => {
      const items = await fetchWhatsOnToday();
      return items.slice(0, limit);
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useImportWhatsOnEvents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: WhatsOnItem[]) => {
      const { data, error } = await supabase.functions.invoke("import-whats-on", {
        body: { items },
      });
      if (error) throw error;
      return data as {
        imported: number;
        skipped: number;
        errors: number;
        mappings: Record<string, string>;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whats-on-today"] });
    },
  });
}
