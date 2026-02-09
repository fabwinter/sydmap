import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch activities from database to provide context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: activities } = await supabase
      .from("activities")
      .select("name, category, address, description, rating, review_count, hours_open, hours_close, wifi, parking, pet_friendly, outdoor_seating, wheelchair_accessible, is_open")
      .order("rating", { ascending: false })
      .limit(100);

    const activityContext = activities
      ?.map(
        (a) =>
          `- ${a.name} (${a.category}): ${a.address || "Sydney"}. Rating: ${a.rating ?? "N/A"}/5 (${a.review_count} reviews). ${a.description || ""}. Hours: ${a.hours_open || "N/A"}-${a.hours_close || "N/A"}. ${a.is_open ? "OPEN NOW" : "Currently closed"}. Amenities: ${[a.wifi && "WiFi", a.parking && "Parking", a.pet_friendly && "Pet Friendly", a.outdoor_seating && "Outdoor Seating", a.wheelchair_accessible && "Wheelchair Accessible"].filter(Boolean).join(", ") || "None listed"}`
      )
      .join("\n") || "No activities found in database.";

    const systemPrompt = `You are the Sydney Planner AI Assistant — a friendly, knowledgeable guide to Sydney, Australia. Your ONLY purpose is to help users discover venues, activities, and experiences in Sydney.

CRITICAL RULES:
1. You can ONLY recommend places and activities that exist in the database provided below. Never invent or hallucinate venues.
2. If asked about topics unrelated to Sydney activities, venues, food, or experiences, politely redirect: "I'm your Sydney Planner assistant! I can help you find amazing cafes, beaches, parks, restaurants, and more across Sydney. What are you in the mood for?"
3. Keep responses concise and conversational. Use emojis sparingly for personality.
4. When recommending places, ALWAYS bold the venue name using markdown **Name (Location)** format so they can be displayed as clickable cards. Include category, rating (if available), and a brief reason why.
5. If you can't find a match in the database, say so honestly: "I don't have a perfect match right now, but here are some similar options..."
6. Never discuss pricing, make reservations, or provide information not in the database.
7. Format recommendations as a short list (max 3-5 items) unless the user asks for more.

DATABASE OF SYDNEY VENUES & ACTIVITIES:
${activityContext}

Remember: You are ONLY a Sydney activity discovery assistant. Stay on topic and only use data from the database above.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
