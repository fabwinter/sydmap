import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivityCSVRow {
  ID: string;
  Name: string;
  Category: string;
  Suburb: string;
  Latitude: string;
  Longitude: string;
  Rating: string;
  Reviews: string;
  Description: string;
  Address: string;
  Phone: string;
  Amenities: string;
}

function parseAmenities(amenities: string): {
  wifi: boolean;
  parking: boolean;
  wheelchair_accessible: boolean;
  outdoor_seating: boolean;
  pet_friendly: boolean;
} {
  const amenityList = amenities.toLowerCase().split(",").map(a => a.trim());
  return {
    wifi: amenityList.includes("wifi"),
    parking: amenityList.includes("parking"),
    wheelchair_accessible: amenityList.includes("wheelchair_accessible"),
    outdoor_seating: amenityList.includes("outdoor") || amenityList.includes("outdoor_seating"),
    pet_friendly: amenityList.includes("pet_friendly"),
  };
}

// Generate a category-appropriate image URL
function getHeroImageUrl(category: string, index: number): string {
  const imageMap: Record<string, string[]> = {
    Cafe: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop",
    ],
    Restaurant: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop",
    ],
    Bar: [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=600&fit=crop",
    ],
    Park: [
      "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552083375-1447ce886485?w=800&h=600&fit=crop",
    ],
    Beach: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=800&h=600&fit=crop",
    ],
    Museum: [
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565060299509-89e89b4107f7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop",
    ],
    Gym: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop",
    ],
    Shopping: [
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop",
    ],
  };
  
  const images = imageMap[category] || imageMap.Cafe;
  return images[index % images.length];
}

// Generate operating hours based on category
function getOperatingHours(category: string): { hours_open: string; hours_close: string } {
  const hoursMap: Record<string, { hours_open: string; hours_close: string }> = {
    Cafe: { hours_open: "7:00 AM", hours_close: "5:00 PM" },
    Restaurant: { hours_open: "11:00 AM", hours_close: "10:00 PM" },
    Bar: { hours_open: "4:00 PM", hours_close: "2:00 AM" },
    Park: { hours_open: "6:00 AM", hours_close: "8:00 PM" },
    Beach: { hours_open: "6:00 AM", hours_close: "8:00 PM" },
    Museum: { hours_open: "10:00 AM", hours_close: "5:00 PM" },
    Gym: { hours_open: "5:00 AM", hours_close: "10:00 PM" },
    Shopping: { hours_open: "9:00 AM", hours_close: "6:00 PM" },
  };
  
  return hoursMap[category] || { hours_open: "9:00 AM", hours_close: "5:00 PM" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvData, batchNumber = 1, batchSize = 500 } = await req.json();
    
    if (!csvData) {
      return new Response(
        JSON.stringify({ error: "CSV data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse CSV
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",");
    
    const activities = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Handle quoted fields with commas
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length < 12) continue;
      
      const row: ActivityCSVRow = {
        ID: values[0],
        Name: values[1],
        Category: values[2],
        Suburb: values[3],
        Latitude: values[4],
        Longitude: values[5],
        Rating: values[6],
        Reviews: values[7],
        Description: values[8],
        Address: values[9],
        Phone: values[10],
        Amenities: values[11],
      };
      
      const amenities = parseAmenities(row.Amenities);
      const hours = getOperatingHours(row.Category);
      
      activities.push({
        name: row.Name,
        category: row.Category,
        latitude: parseFloat(row.Latitude),
        longitude: parseFloat(row.Longitude),
        rating: parseFloat(row.Rating),
        review_count: parseInt(row.Reviews) || 0,
        description: row.Description,
        address: `${row.Address}, ${row.Suburb}`,
        phone: row.Phone,
        hero_image_url: getHeroImageUrl(row.Category, i),
        hours_open: hours.hours_open,
        hours_close: hours.hours_close,
        is_open: true,
        ...amenities,
      });
    }
    
    // Insert in batch
    const { data, error } = await supabase
      .from("activities")
      .insert(activities)
      .select("id");
    
    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message, details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: data?.length || 0,
        batchNumber,
        message: `Batch ${batchNumber}: Inserted ${data?.length || 0} activities`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
