import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, MapPin, Users, Coffee, Award, ChevronRight, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const [showPremium, setShowPremium] = useState(false);
  const { user, isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch user profile from database
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user badges
  const { data: badges = [] } = useQuery({
    queryKey: ["badges", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", profile.id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch check-in stats
  const { data: stats } = useQuery({
    queryKey: ["profile-stats", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { checkIns: 0, friends: 0, topCategory: { name: "None", count: 0 } };
      
      // Get check-in count
      const { count: checkInCount } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      // Get friends count
      const { count: friendCount } = await supabase
        .from("friends")
        .select("*", { count: "exact", head: true })
        .or(`user_id.eq.${profile.id},friend_id.eq.${profile.id}`)
        .eq("status", "accepted");

      return {
        checkIns: checkInCount || 0,
        friends: friendCount || 0,
        topCategory: { name: "Activities", count: checkInCount || 0 },
      };
    },
    enabled: !!profile?.id,
  });

  // Fetch recent check-ins
  const { data: recentCheckIns = [] } = useQuery({
    queryKey: ["recent-checkins", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("check_ins")
        .select(`
          id,
          rating,
          created_at,
          photo_url,
          activities (
            id,
            name,
            category,
            hero_image_url
          )
        `)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Loading state
  if (authLoading || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const bio = profile?.bio || "Exploring Sydney ☕";

  // Get user initials
  const getInitials = () => {
    if (displayName.includes(" ")) {
      return displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return displayName.slice(0, 2).toUpperCase();
  };

  // Badge emoji mapping
  const badgeEmojis: Record<string, string> = {
    "Explorer": "🧭",
    "Foodie": "🍽️",
    "Night Owl": "🦉",
    "Beach Lover": "🏖️",
    "Cafe Connoisseur": "☕",
    "Early Bird": "🌅",
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        {/* Header Section */}
        <div className="px-4 py-6 text-center border-b border-border">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 ring-4 ring-primary/20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h1 className="text-xl font-bold mt-4">{displayName}</h1>
          <p className="text-muted-foreground text-sm mt-1">{bio}</p>
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {badges.slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className="px-3 py-1.5 bg-primary/10 rounded-full text-sm flex items-center gap-1.5"
                  title={badge.description || ""}
                >
                  <span>{badgeEmojis[badge.badge_name] || "🏅"}</span>
                  <span className="font-medium text-primary">{badge.badge_name}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setShowPremium(true)}>
              <Award className="w-4 h-4 mr-2" />
              {profile?.is_premium ? "Premium" : "Upgrade"}
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("/settings")} title="Settings">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 border-b border-border">
          <StatItem
            icon={MapPin}
            value={stats?.checkIns || 0}
            label="Check-ins"
          />
          <StatItem
            icon={Users}
            value={stats?.friends || 0}
            label="Friends"
          />
          <StatItem
            icon={Coffee}
            value={stats?.topCategory?.count || 0}
            label={stats?.topCategory?.name || "Activities"}
          />
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="overview" className="px-4 py-4">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Check-Ins</h3>
              {recentCheckIns.length > 0 && (
                <button className="text-sm text-primary font-medium flex items-center gap-1">
                  See all
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {recentCheckIns.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {recentCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="activity-card">
                    <div className="relative aspect-square">
                      <img
                        src={checkIn.photo_url || checkIn.activities?.hero_image_url || "/placeholder.svg"}
                        alt={checkIn.activities?.name || "Check-in"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-medium line-clamp-1">
                          {checkIn.activities?.name || "Activity"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No check-ins yet</p>
                <Button variant="link" className="mt-2 text-primary" onClick={() => navigate("/")}>
                  Start exploring
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="checkins">
            {recentCheckIns.length > 0 ? (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                  >
                    <img
                      src={checkIn.photo_url || checkIn.activities?.hero_image_url || "/placeholder.svg"}
                      alt={checkIn.activities?.name || "Check-in"}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{checkIn.activities?.name || "Activity"}</p>
                      <p className="text-xs text-muted-foreground">{checkIn.activities?.category}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(checkIn.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {"⭐".repeat(checkIn.rating)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No check-ins yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="playlists">
            <div className="text-center py-8 text-muted-foreground">
              <p>No playlists yet</p>
              <Button variant="link" className="mt-2 text-primary">
                Create your first playlist
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="friends">
            <div className="text-center py-8 text-muted-foreground">
              <p>Connect with friends</p>
              <Button variant="link" className="mt-2 text-primary">
                Find friends
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </AppLayout>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center py-4">
      <Icon className="w-5 h-5 text-primary mb-1" />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}