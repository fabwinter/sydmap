import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Settings, MapPin, Users, Coffee, Award, ChevronRight, ChevronDown, Loader2, Heart, Bookmark, Plus, Trash2, Star, MessageSquare, Image as ImageIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useSavedItems, useToggleSavedItem } from "@/hooks/useSavedItems";
import { usePlaylists, useCreatePlaylist, useDeletePlaylist } from "@/hooks/usePlaylists";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const [showPremium, setShowPremium] = useState(false);
  const { user, isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  // Saved items & playlists
  const { data: savedItems, isLoading: savedLoading } = useSavedItems();
  const { data: playlists, isLoading: playlistsLoading } = usePlaylists();
  const toggleSaved = useToggleSavedItem();
  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistEmoji, setNewPlaylistEmoji] = useState("📍");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      
      const { count: checkInCount } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

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

  // Fetch recent check-ins with full details
  const { data: recentCheckIns = [] } = useQuery({
    queryKey: ["recent-checkins", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("check_ins")
        .select(`
          id,
          rating,
          comment,
          created_at,
          photo_url,
          activities (
            id,
            name,
            category,
            hero_image_url,
            address,
            rating,
            review_count
          )
        `)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(20);
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

  const getInitials = () => {
    if (displayName.includes(" ")) {
      return displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return displayName.slice(0, 2).toUpperCase();
  };

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

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist.mutate(
      { name: newPlaylistName, emoji: newPlaylistEmoji },
      {
        onSuccess: () => {
          setNewPlaylistName("");
          setNewPlaylistEmoji("📍");
          setIsDialogOpen(false);
        },
      }
    );
  };

  const handleRemoveSaved = (activityId: string) => {
    toggleSaved.mutate({ activityId, isSaved: true });
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
          <StatItem icon={MapPin} value={stats?.checkIns || 0} label="Check-ins" />
          <StatItem icon={Users} value={stats?.friends || 0} label="Friends" />
          <StatItem icon={Coffee} value={stats?.topCategory?.count || 0} label={stats?.topCategory?.name || "Activities"} />
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="overview" className="px-4 py-4">
          <TabsList className="w-full grid grid-cols-5 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
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
          
          {/* Check-Ins Tab */}
          <TabsContent value="checkins">
            {recentCheckIns.length > 0 ? (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn) => (
                  <CheckInCard key={checkIn.id} checkIn={checkIn} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No check-ins yet</p>
              </div>
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="space-y-4 mt-0">
            {savedLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : savedItems && savedItems.length > 0 ? (
              <div className="space-y-3">
                {savedItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/activity/${item.activity_id}`}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary transition-colors"
                  >
                    <img
                      src={item.activities.hero_image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop"}
                      alt={item.activities.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.activities.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.activities.category}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {item.activities.address || "Sydney, NSW"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveSaved(item.activity_id);
                      }}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                      <Heart className="w-5 h-5 fill-destructive text-destructive" />
                    </button>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saved places yet</p>
                <p className="text-sm">Start exploring and save your favorite spots!</p>
              </div>
            )}
          </TabsContent>
          
          {/* Playlists Tab */}
          <TabsContent value="playlists" className="space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Your Playlists</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1 h-8">
                    <Plus className="w-3 h-3" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="emoji">Emoji</Label>
                      <Input
                        id="emoji"
                        value={newPlaylistEmoji}
                        onChange={(e) => setNewPlaylistEmoji(e.target.value)}
                        maxLength={2}
                        className="w-20 text-2xl text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Weekend Vibes"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleCreatePlaylist}
                      className="w-full"
                      disabled={!newPlaylistName.trim() || createPlaylist.isPending}
                    >
                      {createPlaylist.isPending ? "Creating..." : "Create Playlist"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {playlistsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : playlists && playlists.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-card rounded-xl p-4 border border-border hover:border-primary transition-colors cursor-pointer relative group"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist.mutate(playlist.id);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="text-3xl">{playlist.emoji || "📍"}</span>
                    <h3 className="font-semibold text-sm mt-2 line-clamp-1">{playlist.name}</h3>
                    <p className="text-xs text-muted-foreground">{playlist.item_count || 0} places</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No playlists yet</p>
                <Button variant="link" className="mt-2 text-primary" onClick={() => setIsDialogOpen(true)}>
                  Create your first playlist
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Friends Tab */}
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

function CheckInCard({ checkIn }: { checkIn: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Summary row - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <img
          src={checkIn.photo_url || checkIn.activities?.hero_image_url || "/placeholder.svg"}
          alt={checkIn.activities?.name || "Check-in"}
          className="w-16 h-16 rounded-lg object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{checkIn.activities?.name || "Activity"}</p>
          <p className="text-xs text-muted-foreground">{checkIn.activities?.category}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(checkIn.created_at).toLocaleDateString("en-AU", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < checkIn.rating
                    ? "fill-warning text-warning"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          {/* Comment */}
          {checkIn.comment && (
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground italic">"{checkIn.comment}"</p>
            </div>
          )}

          {/* Photo */}
          {checkIn.photo_url && (
            <div className="flex items-start gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <img
                src={checkIn.photo_url}
                alt="Check-in photo"
                className="w-full max-w-xs rounded-lg object-cover"
              />
            </div>
          )}

          {/* Activity info */}
          {checkIn.activities && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{checkIn.activities.name}</span>
                {checkIn.activities.rating && (
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    {checkIn.activities.rating.toFixed(1)}
                  </span>
                )}
              </div>
              {checkIn.activities.address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {checkIn.activities.address}
                </p>
              )}
              <Link
                to={`/activity/${checkIn.activities.id}`}
                className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1"
              >
                View activity
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
