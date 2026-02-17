import { useQuery } from "@tanstack/react-query";
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
}

async function fetchWhatsOnToday(): Promise<WhatsOnItem[]> {
  const { data, error } = await supabase.functions.invoke("whats-on-today");
  if (error) throw error;
  return data?.items ?? [];
}

export function useWhatsOnToday(limit = 10) {
  return useQuery({
    queryKey: ["whats-on-today", limit],
    queryFn: async () => {
      const items = await fetchWhatsOnToday();
      return items.slice(0, limit);
    },
    staleTime: 10 * 60 * 1000, // 10 min
    retry: 2,
  });
}
