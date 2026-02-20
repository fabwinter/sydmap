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
  // 1. Fetch scraped items from edge function
  let scrapedItems: WhatsOnItem[] = [];
  try {
    const { data, error } = await supabase.functions.invoke("whats-on-today");
    if (!error) {
      scrapedItems = data?.items ?? [];
    }
  } catch {
    // Edge function may fail; continue with DB items
  }

  // 2. Fetch all DB activities with show_in_whats_on = true
  const { data: dbActivities } = await supabase
    .from("activities")
    .select("id, name, category, description, hero_image_url, event_dates, source_url, is_event")
    .eq("show_in_whats_on", true)
    .order("created_at", { ascending: false });

  // 3. Cross-reference scraped items with DB
  const urls = scrapedItems.map((i) => i.url).filter(Boolean);
  const dbBySourceUrl = new Map<string, typeof dbActivities extends (infer T)[] | null ? T : never>();
  const dbIds = new Set<string>();

  if (dbActivities?.length) {
    for (const a of dbActivities) {
      dbIds.add(a.id);
      if (a.source_url) dbBySourceUrl.set(a.source_url, a);
    }
  }

  // Update scraped items with DB data
  for (const item of scrapedItems) {
    const activity = dbBySourceUrl.get(item.url);
    if (activity) {
      item.activityId = activity.id;
      if (activity.hero_image_url) item.imageUrl = activity.hero_image_url;
      if (activity.event_dates) item.date = activity.event_dates;
      if (activity.category) item.category = activity.category;
      if (activity.name) item.title = activity.name;
    }
  }

  // 4. Add DB activities that aren't already in scraped items
  const scrapedActivityIds = new Set(scrapedItems.filter(i => i.activityId).map(i => i.activityId));
  const scrapedUrls = new Set(scrapedItems.map(i => i.url));

  if (dbActivities?.length) {
    for (const a of dbActivities) {
      if (scrapedActivityIds.has(a.id)) continue;
      if (a.source_url && scrapedUrls.has(a.source_url)) continue;

      scrapedItems.push({
        id: `db-${a.id}`,
        title: a.name,
        url: a.source_url || "",
        category: a.category,
        excerpt: a.description?.slice(0, 200) || undefined,
        imageUrl: a.hero_image_url || undefined,
        date: a.event_dates || undefined,
        source: "database",
        activityId: a.id,
      });
    }
  }

  return scrapedItems;
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

/** Toggle show_in_whats_on for an activity */
export function useToggleWhatsOn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, show }: { activityId: string; show: boolean }) => {
      const { error } = await supabase.rpc("admin_update_activity", {
        p_activity_id: activityId,
        p_updates: { show_in_whats_on: show } as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whats-on-today"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
