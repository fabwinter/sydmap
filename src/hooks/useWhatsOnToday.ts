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

  // Check which URLs already exist in activities
  const urls = items.map((i) => i.url).filter(Boolean);
  if (urls.length > 0) {
    const { data: existing } = await supabase
      .from("activities")
      .select("id, source_url")
      .in("source_url", urls);

    if (existing?.length) {
      const urlToId = new Map(existing.map((e) => [e.source_url, e.id]));
      for (const item of items) {
        const activityId = urlToId.get(item.url);
        if (activityId) item.activityId = activityId;
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
