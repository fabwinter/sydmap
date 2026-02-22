import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Settings, MapPin, Users, Coffee, Award, ChevronRight, ChevronDown, Loader2, Heart, Bookmark, Plus, Trash2, Star, MessageSquare, Image as ImageIcon, CalendarDays } from "lucide-react";
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
import { useCalendarEvents, useDeleteCalendarEvent } from "@/hooks/useCalendarEvents";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
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
  const { data: calendarEvents } = useCalendarEvents();
  const deleteCalendarEvent = useDeleteCalendarEvent();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
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

  // Category sticker data from check-ins
  const categoryStickers: Record<string, { emoji: string; bg: string }> = {
    cafe: { emoji: "☕", bg: "bg-amber-50" },
    restaurant: { emoji: "🍽️", bg: "bg-red-50" },
    bar: { emoji: "🍺", bg: "bg-yellow-50" },
    beach: { emoji: "🏖️", bg: "bg-blue-50" },
    park: { emoji: "🌳", bg: "bg-green-50" },
    museum: { emoji: "🏛️", bg: "bg-purple-50" },
    shopping: { emoji: "🛍️", bg: "bg-pink-50" },
    bakery: { emoji: "🧁", bg: "bg-orange-50" },
    gym: { emoji: "💪", bg: "bg-slate-50" },
  };

  // Build category counts from check-ins
  const categoryCounts = recentCheckIns.reduce((acc, ci) => {
    const cat = ci.activities?.category?.toLowerCase() || "";
    if (cat) acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
      <div className="max-w-lg lg:max-w-4xl mx-auto">
        {/* Profile Header — modern gradient hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-background" />
          <div className="relative px-4 pt-8 pb-6 text-center">
            <div className="relative inline-block">
              <Avatar className="w-20 h-20 ring-4 ring-background shadow-xl">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <h1 className="text-xl font-bold mt-3">{displayName}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{bio}</p>
            
            {badges.length > 0 && (
              <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
                {badges.slice(0, 4).map((badge) => (
                  <span
                    key={badge.id}
                    className="px-2.5 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary"
                    title={badge.description || ""}
                  >
                    {badgeEmojis[badge.badge_name] || "🏅"} {badge.badge_name}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex gap-2.5 mt-4 max-w-xs mx-auto">
              <Button variant="outline" className="flex-1 h-9 rounded-full text-sm" onClick={() => navigate("/settings")}>
                Edit Profile
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => setShowPremium(true)} title="Premium">
                <Award className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-3 mx-4 rounded-2xl bg-card border border-border shadow-sm -mt-1 mb-2">
          <StatItem icon={MapPin} value={stats?.checkIns || 0} label="Check-ins" />
          <StatItem icon={Users} value={stats?.friends || 0} label="Friends" />
          <StatItem icon={Coffee} value={stats?.topCategory?.count || 0} label={stats?.topCategory?.name || "Activities"} />
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="overview" className="px-4 pt-3 pb-4">
          <TabsList className="w-full overflow-x-auto flex gap-1 bg-transparent p-0 mb-4 scrollbar-hide">
            {["overview", "checkins", "calendar", "saved", "playlists", "friends"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-3 py-1.5 rounded-full text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted whitespace-nowrap"
              >
                {tab === "checkins" ? "Check-Ins" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Lists Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Lists <span className="text-muted-foreground font-normal text-sm">{(playlists?.length || 0) + 1}</span></h3>
                <button className="text-sm text-primary font-medium flex items-center gap-1">
                  See all
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-muted/60 p-6 flex flex-col items-center justify-center min-h-[120px]">
                  <Bookmark className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="font-semibold text-sm">Saved places</p>
                  <p className="text-xs text-muted-foreground">{savedItems?.length || 0} places</p>
                </div>
                {playlists?.slice(0, 1).map((playlist) => (
                  <div key={playlist.id} className="rounded-2xl bg-amber-50 p-6 flex flex-col items-center justify-center min-h-[120px]">
                    <span className="text-3xl mb-2">{playlist.emoji || "📍"}</span>
                    <p className="font-semibold text-sm">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">{playlist.item_count || 0} places</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements / Category Stickers */}
            <div>
              <h3 className="font-bold text-lg mb-3">Achievements</h3>
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-sm">Categories <span className="text-muted-foreground font-normal">{Object.keys(categoryCounts).length}/100</span></span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                {Object.keys(categoryCounts).length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
                    {Object.entries(categoryCounts).map(([cat, count]) => {
                      const sticker = categoryStickers[cat] || { emoji: "📍", bg: "bg-muted" };
                      return (
                        <div key={cat} className="flex flex-col items-center shrink-0 min-w-[72px]">
                          <div className={`w-16 h-16 rounded-2xl ${sticker.bg} flex items-center justify-center text-3xl shadow-sm`}>
                            {sticker.emoji}
                          </div>
                          <p className="text-xs font-medium mt-1.5 text-center capitalize line-clamp-2">{cat}</p>
                          <p className="text-[10px] text-muted-foreground">{count} Check-in{count !== 1 ? "s" : ""}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Check in to unlock category stickers!</p>
                )}
              </div>

              {/* Stickers - unlocked per check-in */}
              <div className="bg-card rounded-2xl border border-border p-4 mt-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">Stickers <span className="text-muted-foreground font-normal">{recentCheckIns.length}</span></span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                {recentCheckIns.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {recentCheckIns.slice(0, 8).map((ci) => {
                      const cat = ci.activities?.category?.toLowerCase() || "";
                      const sticker = categoryStickers[cat] || { emoji: "📍", bg: "bg-muted" };
                      return (
                        <div key={ci.id} className={`w-14 h-14 rounded-2xl ${sticker.bg} flex items-center justify-center text-2xl shadow-sm`}>
                          {sticker.emoji}
                        </div>
                      );
                    })}
                    {recentCheckIns.length > 8 && (
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                        +{recentCheckIns.length - 8}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3">Check in to earn stickers!</p>
                )}
              </div>

              {/* Earned Badges */}
              {badges.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-4 mt-3">
                  <span className="font-semibold text-sm">Badges <span className="text-muted-foreground font-normal">{badges.length}</span></span>
                  <div className="flex gap-4 mt-3 overflow-x-auto scrollbar-hide pb-1">
                    {badges.map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center shrink-0 min-w-[72px]">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shadow-sm">
                          {badgeEmojis[badge.badge_name] || "🏅"}
                        </div>
                        <p className="text-xs font-medium mt-1.5 text-center line-clamp-2">{badge.badge_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Check-Ins */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Recent Check-Ins</h3>
              </div>
              
              {recentCheckIns.length > 0 ? (
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  {recentCheckIns.slice(0, 6).map((checkIn) => (
                    <Link key={checkIn.id} to={`/activity/${checkIn.activities?.id}`} className="block relative w-full overflow-hidden rounded-2xl bg-muted aspect-[4/3] group">
                      <img
                        src={checkIn.photo_url || checkIn.activities?.hero_image_url || "/placeholder.svg"}
                        alt={checkIn.activities?.name || "Check-in"}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-0.5">
                        <h3 className="font-bold text-sm text-white leading-tight line-clamp-1">
                          {checkIn.activities?.name || "Activity"}
                        </h3>
                        <p className="text-xs text-white/70">{checkIn.activities?.category}</p>
                      </div>
                    </Link>
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
            </div>
          </TabsContent>
          
          {/* Check-Ins Tab */}
          <TabsContent value="checkins">
            {recentCheckIns.length > 0 ? (
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
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

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4 mt-0">
            <ProfileCalendar
              calendarEvents={calendarEvents || []}
              checkIns={recentCheckIns}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              onDeleteEvent={(id) => deleteCalendarEvent.mutate(id)}
            />
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="space-y-4 mt-0">
            {savedLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))
            ) : savedItems && savedItems.length > 0 ? (
              <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {savedItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/activity/${item.activity_id}`}
                    className="block relative w-full overflow-hidden rounded-2xl bg-muted aspect-[4/3] group"
                  >
                    <img
                      src={item.activities.hero_image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop"}
                      alt={item.activities.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveSaved(item.activity_id);
                      }}
                      className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors shadow-sm"
                    >
                      <Heart className="w-4 h-4 fill-white text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-0.5">
                      <h3 className="font-bold text-sm text-white leading-tight line-clamp-1">
                        {item.activities.name}
                      </h3>
                      <p className="text-xs text-white/70">{item.activities.category}</p>
                      <p className="text-xs text-white/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.activities.address || "Sydney, NSW"}
                      </p>
                    </div>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
    <div className="flex flex-col items-center py-3">
      <Icon className="w-4 h-4 text-primary mb-0.5" />
      <span className="text-lg font-bold">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function CheckInCard({ checkIn }: { checkIn: any }) {
  return (
    <Link
      to={`/activity/${checkIn.activities?.id}`}
      className="block relative w-full overflow-hidden rounded-2xl bg-muted aspect-[4/3] group"
    >
      <img
        src={checkIn.photo_url || checkIn.activities?.hero_image_url || "/placeholder.svg"}
        alt={checkIn.activities?.name || "Check-in"}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-0.5">
        <h3 className="font-bold text-sm text-white leading-tight line-clamp-1">
          {checkIn.activities?.name || "Activity"}
        </h3>
        <p className="text-xs text-white/70">{checkIn.activities?.category}</p>
        <div className="flex items-center gap-3 pt-0.5">
          <span className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < checkIn.rating ? "fill-warning text-warning" : "text-white/30"}`}
              />
            ))}
          </span>
          <span className="text-xs text-white/60">
            {new Date(checkIn.created_at).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        {checkIn.comment && (
          <p className="text-xs text-white/60 italic line-clamp-1 mt-0.5">"{checkIn.comment}"</p>
        )}
      </div>
    </Link>
  );
}

function ProfileCalendar({
  calendarEvents,
  checkIns,
  month,
  onMonthChange,
  onDeleteEvent,
}: {
  calendarEvents: any[];
  checkIns: any[];
  month: Date;
  onMonthChange: (d: Date) => void;
  onDeleteEvent: (id: string) => void;
}) {
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });
  const firstDayOfWeek = getDay(startOfMonth(month));
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const eventsByDate = new Map<string, { type: "planned" | "checkin"; title: string; id?: string; activityId?: string; isEvent?: boolean }[]>();
  
  calendarEvents.forEach((ev: any) => {
    const key = ev.event_date;
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key)!.push({ type: "planned", title: ev.title || ev.activities?.name || "Event", id: ev.id, activityId: ev.activity_id || undefined });
  });
  
  checkIns.forEach((ci: any) => {
    const key = format(new Date(ci.created_at), "yyyy-MM-dd");
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key)!.push({ type: "checkin", title: ci.activities?.name || "Check-in", activityId: ci.activities?.id, isEvent: ci.activities?.is_event });
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) || [] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => onMonthChange(subMonths(month, 1))} className="p-2 rounded-lg hover:bg-muted">
          <ChevronDown className="w-5 h-5 rotate-90" />
        </button>
        <h3 className="font-bold text-lg">{format(month, "MMMM yyyy")}</h3>
        <button onClick={() => onMonthChange(addMonths(month, 1))} className="p-2 rounded-lg hover:bg-muted">
          <ChevronDown className="w-5 h-5 -rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const events = eventsByDate.get(key);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(isSelected ? null : key)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                isSelected ? "bg-primary text-primary-foreground" :
                isToday ? "bg-primary/10 font-bold" :
                "hover:bg-muted"
              }`}
            >
              {format(day, "d")}
              {events && (
                <div className="flex gap-0.5 mt-0.5">
                  {events.some(e => e.type === "planned") && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  {events.some(e => e.type === "checkin") && <span className="w-1.5 h-1.5 rounded-full bg-warning" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Planned</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> Check-in</span>
      </div>

      {selectedDate && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{format(parseISO(selectedDate), "EEEE, d MMMM")}</h4>
          {selectedEvents.length > 0 ? (
            selectedEvents.map((ev, i) => {
              const linkTo = ev.activityId
                ? (ev.isEvent ? `/event/${ev.activityId}` : `/activity/${ev.activityId}`)
                : null;
              const content = (
                <div className="flex items-center justify-between bg-card rounded-xl border border-border p-3 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${ev.type === "planned" ? "bg-primary" : "bg-warning"}`} />
                    <span className="text-sm font-medium truncate">{ev.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{ev.type === "planned" ? "Planned" : "Visited"}</span>
                  </div>
                  {ev.type === "planned" && ev.id && (
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteEvent(ev.id!); }} className="p-1 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
              return linkTo ? (
                <Link key={i} to={linkTo}>{content}</Link>
              ) : (
                <div key={i}>{content}</div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No events on this day</p>
          )}
        </div>
      )}

      {calendarEvents.filter((e: any) => e.event_date >= format(new Date(), "yyyy-MM-dd")).length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Upcoming</h4>
          <div className="space-y-2">
            {calendarEvents
              .filter((e: any) => e.event_date >= format(new Date(), "yyyy-MM-dd"))
              .slice(0, 5)
              .map((ev: any) => (
                <Link
                  key={ev.id}
                  to={ev.activity_id ? `/activity/${ev.activity_id}` : "#"}
                  className="flex items-center justify-between bg-card rounded-xl border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(ev.event_date), "EEE d MMM")}
                      {ev.event_time && ` at ${ev.event_time.slice(0, 5)}`}
                    </p>
                  </div>
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
