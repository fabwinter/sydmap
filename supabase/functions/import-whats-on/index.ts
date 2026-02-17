import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WhatsOnItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  source: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Use Firecrawl to scrape an event page and extract structured data */
async function scrapeEventPage(
  url: string,
  firecrawlKey: string
): Promise<{ description: string; imageUrl?: string; address?: string } | null> {
  try {
    console.log("Scraping:", url);
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!res.ok) {
      console.error(`Firecrawl error for ${url}: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const markdown = data?.data?.markdown || data?.markdown || "";

    // Extract description (first 500 chars of meaningful content)
    const description = markdown
      .split("\n")
      .filter((l: string) => l.trim().length > 20 && !l.startsWith("#") && !l.startsWith("!["))
      .slice(0, 5)
      .join("\n")
      .slice(0, 500)
      .trim();

    // Try to find an image from the scraped content
    let imageUrl: string | undefined;
    const imgMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (imgMatch) imageUrl = imgMatch[1];

    // Try to find address patterns
    let address: string | undefined;
    const addressMatch = markdown.match(
      /(?:address|location|where|venue)[:\s]*([^\n]{10,80}(?:NSW|Sydney|Australia)[^\n]*)/i
    );
    if (addressMatch) address = stripHtml(addressMatch[1]).slice(0, 200);

    return { description: description || "", imageUrl, address };
  } catch (e) {
    console.error(`Scrape failed for ${url}:`, e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { items } = (await req.json()) as { items: WhatsOnItem[] };
    if (!items?.length) {
      return new Response(
        JSON.stringify({ error: "No items provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check which URLs are already imported
    const urls = items.map((i) => i.url);
    const { data: existing } = await supabase
      .from("activities")
      .select("id, source_url")
      .in("source_url", urls);

    const existingUrls = new Set((existing || []).map((e: any) => e.source_url));
    const toImport = items.filter((i) => !existingUrls.has(i.url));

    console.log(`${toImport.length} new events to import (${existingUrls.size} already exist)`);

    const imported: { url: string; activityId: string }[] = [];
    const errors: { url: string; error: string }[] = [];

    // Import up to 10 at a time to stay within function timeout
    const batch = toImport.slice(0, 10);

    for (const item of batch) {
      try {
        // Scrape the event page for details
        const scraped = await scrapeEventPage(item.url, firecrawlKey);

        const categoryMap: Record<string, string> = {
          "Kids & Family": "Playground",
          "Kids Events": "Playground",
          "Tours & Activities": "tourist attraction",
        };
        const category = categoryMap[item.category || ""] || "tourist attraction";

        // Default Sydney coords
        const latitude = -33.8688;
        const longitude = 151.2093;

        const { data: inserted, error } = await supabase
          .from("activities")
          .insert({
            name: item.title,
            category,
            latitude,
            longitude,
            address: scraped?.address || "Sydney, NSW",
            description: scraped?.description || item.excerpt || item.title,
            hero_image_url:
              scraped?.imageUrl ||
              item.imageUrl ||
              "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop",
            website: item.url,
            source_url: item.url,
            is_open: true,
            rating: 0,
            review_count: 0,
          })
          .select("id")
          .single();

        if (error) {
          console.error(`Insert error for ${item.title}:`, error.message);
          errors.push({ url: item.url, error: error.message });
        } else {
          imported.push({ url: item.url, activityId: inserted.id });
          console.log(`Imported: ${item.title} → ${inserted.id}`);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        errors.push({ url: item.url, error: msg });
      }
    }

    // Return all activity ID mappings (existing + newly imported)
    const allMappings: Record<string, string> = {};
    for (const e of existing || []) {
      allMappings[e.source_url] = e.id;
    }
    for (const i of imported) {
      allMappings[i.url] = i.activityId;
    }

    return new Response(
      JSON.stringify({
        imported: imported.length,
        skipped: existingUrls.size,
        errors: errors.length,
        mappings: allMappings,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("import-whats-on error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
