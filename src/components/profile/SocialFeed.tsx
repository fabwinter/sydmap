import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export function SocialFeed() {
  const { profile } = useAuth();

  const { data: feedItems, isLoading } = useQuery({
    queryKey: ["social-feed", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Get accepted friend IDs
      const { data: friendships } = await supabase
        .from("friends")
        .select("user_id, friend_id")
        .or(`user_id.eq.${profile.id},friend_id.eq.${profile.id}`)
        .eq("status", "accepted");

      const friendProfileIds = (friendships || []).map(f =>
        f.user_id === profile.id ? f.friend_id : f.user_id
      );

      if (friendProfileIds.length === 0) return [];

      // Get friend check-ins that are shared
      const { data: checkIns } = await supabase
        .from("check_ins")
        .select(`
          id, rating, comment, created_at, photo_url,
          user_id,
          activities(id, name, category, hero_image_url, address)
        `)
        .in("user_id", friendProfileIds)
        .eq("share_with_friends", true)
        .order("created_at", { ascending: false })
        .limit(30);

      // Fetch friend profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, username")
        .in("id", friendProfileIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return (checkIns || []).map(ci => ({
        ...ci,
        userProfile: profileMap.get(ci.user_id) || { name: "Friend", avatar_url: null },
      }));
    },
    enabled: !!profile?.id,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!feedItems?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="font-medium">No friend activity yet</p>
        <p className="text-sm mt-1">Add friends to see their check-ins here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedItems.map((item: any) => (
        <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
          {/* User header */}
          <div className="flex items-center gap-2.5 p-3 pb-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={item.userProfile.avatar_url || undefined} />
              <AvatarFallback>{item.userProfile.name?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.userProfile.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: item.rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-warning text-warning" />
              ))}
            </div>
          </div>

          {/* Activity link */}
          <Link to={`/activity/${item.activities?.id}`} className="block">
            {(item.photo_url || item.activities?.hero_image_url) && (
              <img
                src={item.photo_url || item.activities?.hero_image_url}
                alt={item.activities?.name}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-3 pt-2">
              <p className="font-semibold text-sm">{item.activities?.name}</p>
              {item.activities?.address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {item.activities.address}
                </p>
              )}
              {item.comment && (
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">"{item.comment}"</p>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
