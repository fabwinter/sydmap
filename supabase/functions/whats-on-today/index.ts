import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RSS_URL = "https://www.whatsonsydney.com/rssloader?catid=14";
const CACHE_SECONDS = 600; // 10 minutes

interface WhatsOnItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  date?: string;
  source: "whatsonsydney";
}

// Simple in-memory cache
let cache: { items: WhatsOnItem[]; fetchedAt: string } | null = null;
let cacheTime = 0;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim();
}

function extractFirstImageFromHtml(html: string): string | undefined {
  // Try <img src="...">
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch?.[1] || undefined;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getTagContent(item: string, tag: string): string | undefined {
  // Handle both <tag>...</tag> and <tag><![CDATA[...]]></tag>
  const regex = new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`, "i");
  const match = item.match(regex);
  return match?.[1]?.trim() || undefined;
}

function parseItems(xml: string): WhatsOnItem[] {
  const items: WhatsOnItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = getTagContent(block, "title");
    const link = getTagContent(block, "link");
    if (!title || !link) continue;

    const guid = getTagContent(block, "guid");
    const pubDate = getTagContent(block, "pubDate");
    const category = getTagContent(block, "category");
    const description = getTagContent(block, "description") || "";

    // Try enclosure url first
    let imageUrl: string | undefined;
    const enclosureMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    if (enclosureMatch) {
      imageUrl = enclosureMatch[1];
    }
    // Try media:content
    if (!imageUrl) {
      const mediaMatch = block.match(/<media:content[^>]+url=["']([^"']+)["']/i);
      if (mediaMatch) imageUrl = mediaMatch[1];
    }
    // Try first img in description
    if (!imageUrl) {
      imageUrl = extractFirstImageFromHtml(description);
    }

    let date: string | undefined;
    if (pubDate) {
      try {
        date = new Date(pubDate).toISOString();
      } catch {
        // ignore
      }
    }

    items.push({
      id: simpleHash(guid || link),
      title: stripHtml(title),
      url: link.trim(),
      category: category ? stripHtml(category) : undefined,
      excerpt: description ? stripHtml(description).slice(0, 200) : undefined,
      imageUrl,
      date,
      source: "whatsonsydney",
    });
  }

  return items;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    if (cache && now - cacheTime < CACHE_SECONDS * 1000) {
      return new Response(JSON.stringify(cache), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
        },
      });
    }

    const res = await fetch(RSS_URL, {
      headers: { "User-Agent": "SYDMAP/1.0" },
    });

    if (!res.ok) {
      throw new Error(`RSS fetch failed: ${res.status}`);
    }

    const xml = await res.text();
    const items = parseItems(xml);

    const result = { items, fetchedAt: new Date().toISOString() };
    cache = result;
    cacheTime = now;

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error("whats-on-today error:", error);
    // Return cached data if available even on error
    if (cache) {
      return new Response(JSON.stringify(cache), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: error.message, items: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
