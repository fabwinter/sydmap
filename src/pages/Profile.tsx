import { useState, useEffect, useMemo, useRef } from "react";
import { MediaLightbox } from "@/components/ui/MediaLightbox";
import { useNavigate, Link } from "react-router-dom";
import { Settings, MapPin, Users, Coffee, Award, ChevronRight, ChevronDown, Loader2, Heart, Bookmark, Plus, Trash2, Star, MessageSquare, Image as ImageIcon, CalendarDays, Flame, Share2, BookmarkPlus, Trophy, Sparkles, Crown, Zap, Camera } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSavedItems, useToggleSavedItem } from "@/hooks/useSavedItems";
import { usePlaylists, useCreatePlaylist, useDeletePlaylist } from "@/hooks/usePlaylists";
import { useCalendarEvents, useDeleteCalendarEvent } from "@/hooks/useCalendarEvents";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, differenceInCalendarDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Achievement definitions ────────────────────────────────────────
const ACHIEVEMENT_DEFS = [
  { key: "explorer", name: "Explorer", emoji: "🧭", description: "Check in to 20 places", target: 20, type: "total" as const },
  { key: "foodie", name: "Foodie", emoji: "🍽️", description: "10 restaurant check-ins", target: 10, type: "category" as const, category: "restaurant" },
  { key: "cafe_connoisseur", name: "Cafe Connoisseur", emoji: "☕", description: "10 cafe check-ins", target: 10, type: "category" as const, category: "cafe" },
  { key: "beach_lover", name: "Beach Lover", emoji: "🏖️", description: "5 beach check-ins", target: 5, type: "category" as const, category: "beach" },
  { key: "park_ranger", name: "Park Ranger", emoji: "🌳", description: "5 park check-ins", target: 5, type: "category" as const, category: "park" },
  { key: "night_owl", name: "Night Owl", emoji: "🦉", description: "5 bar check-ins", target: 5, type: "category" as const, category: "bar" },
  { key: "culture_vulture", name: "Culture Vulture", emoji: "🏛️", description: "5 museum check-ins", target: 5, type: "category" as const, category: "museum" },
  { key: "shopaholic", name: "Shopaholic", emoji: "🛍️", description: "5 shopping check-ins", target: 5, type: "category" as const, category: "shopping" },
];

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
          photo_urls,
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
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // ── Derived data ─────────────────────────────────────────────────
  const categoryCounts = useMemo(() => {
    return recentCheckIns.reduce((acc, ci) => {
      const cat = ci.activities?.category?.toLowerCase() || "";
      if (cat) acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [recentCheckIns]);

  // Streak calculation
  const streak = useMemo(() => {
    if (recentCheckIns.length === 0) return 0;
    const uniqueDays = [...new Set(
      recentCheckIns.map(ci => format(new Date(ci.created_at), "yyyy-MM-dd"))
    )].sort().reverse();
    
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;
    
    let count = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const diff = differenceInCalendarDays(parseISO(uniqueDays[i - 1]), parseISO(uniqueDays[i]));
      if (diff === 1) count++;
      else break;
    }
    return count;
  }, [recentCheckIns]);

  // Achievement progress
  const achievementProgress = useMemo(() => {
    return ACHIEVEMENT_DEFS.map(def => {
      let current = 0;
      if (def.type === "total") {
        current = recentCheckIns.length;
      } else if (def.type === "category" && def.category) {
        current = categoryCounts[def.category] || 0;
      }
      const unlocked = current >= def.target;
      return { ...def, current: Math.min(current, def.target), unlocked };
    });
  }, [recentCheckIns, categoryCounts]);

  const totalProgress = achievementProgress.filter(a => a.unlocked).length;
  const progressPercent = recentCheckIns.length > 0 
    ? Math.min(100, Math.round((recentCheckIns.length / 20) * 100))
    : 0;
  const level = Math.floor(recentCheckIns.length / 5) + 1;

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

  const categoryStickers: Record<string, { emoji: string; color: string }> = {
    cafe: { emoji: "☕", color: "from-amber-400 to-orange-500" },
    restaurant: { emoji: "🍽️", color: "from-red-400 to-rose-500" },
    bar: { emoji: "🍺", color: "from-yellow-400 to-amber-500" },
    beach: { emoji: "🏖️", color: "from-sky-400 to-blue-500" },
    park: { emoji: "🌳", color: "from-emerald-400 to-green-500" },
    museum: { emoji: "🏛️", color: "from-violet-400 to-purple-500" },
    shopping: { emoji: "🛍️", color: "from-pink-400 to-rose-500" },
    bakery: { emoji: "🧁", color: "from-orange-300 to-amber-500" },
    gym: { emoji: "💪", color: "from-slate-400 to-slate-600" },
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
      <div className="max-w-lg lg:max-w-4xl mx-auto pb-8">
        {/* ── Profile Header: Immersive Gradient Hero ────────────── */}
        <div className="relative overflow-hidden rounded-b-[2rem]">
          {/* Animated gradient background */}
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, hsl(210 80% 25%) 0%, hsl(195 85% 35%) 30%, hsl(175 60% 40%) 60%, hsl(160 50% 45%) 100%)",
              backgroundSize: "300% 300%",
              animation: "gradientShift 12s ease infinite",
            }}
          />
          {/* Decorative circles for depth */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/[0.06] blur-sm" />
            <div className="absolute top-10 -left-10 w-40 h-40 rounded-full bg-white/[0.04] blur-sm" />
            <div className="absolute bottom-8 right-10 w-24 h-24 rounded-full bg-white/[0.05]" />
          </div>
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />

          <div className="relative px-5 pt-12 pb-14 text-center">
            {/* Avatar with Progress Ring */}
            <motion.div 
              className="relative inline-block mb-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <svg className="w-28 h-28" viewBox="0 0 112 112">
                {/* Background ring */}
                <circle cx="56" cy="56" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
                {/* Progress ring */}
                <circle
                  cx="56" cy="56" r="52"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - progressPercent / 100)}`}
                  transform="rotate(-90 56 56)"
                  className="transition-all duration-1000"
                  style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.4))" }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(160, 60%, 65%)" />
                    <stop offset="100%" stopColor="hsl(210, 80%, 75%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar className="w-[88px] h-[88px] ring-[3px] ring-white/20 shadow-2xl">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-white/15 text-white font-bold backdrop-blur-md">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Level badge */}
              <motion.div 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white shadow-lg flex items-center gap-1"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-xs font-bold text-primary">Lv.{level}</span>
              </motion.div>
            </motion.div>

            <motion.h1 
              className="text-2xl font-extrabold text-white drop-shadow-lg tracking-tight"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {displayName}
            </motion.h1>
            <motion.p 
              className="text-white/70 text-sm mt-1 max-w-[240px] mx-auto"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {bio}
            </motion.p>

            {/* Streak & Coins row */}
            <motion.div 
              className="flex items-center justify-center gap-2.5 mt-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {streak > 0 && (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/10 text-white text-sm font-semibold shadow-lg">
                  <Flame className="w-4 h-4 text-orange-300 drop-shadow" />
                  <span>{streak}</span>
                  <span className="text-white/60 text-xs font-normal">day streak</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/10 text-white text-sm font-semibold shadow-lg">
                <Sparkles className="w-4 h-4 text-yellow-300 drop-shadow" />
                <span>{recentCheckIns.length}</span>
                <span className="text-white/60 text-xs font-normal">XP</span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div 
              className="flex gap-2.5 mt-5 max-w-xs mx-auto"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <Button 
                variant="outline" 
                className="flex-1 h-11 rounded-full text-sm font-semibold border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md shadow-lg"
                onClick={() => navigate("/settings")}
              >
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-11 w-11 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md shadow-lg" 
                onClick={() => setShowPremium(true)} 
                title="Premium"
              >
                <Crown className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────── */}
        <motion.div 
          className="grid grid-cols-3 mx-4 rounded-2xl bg-card border border-border shadow-lg -mt-8 relative z-10 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <StatItem icon={MapPin} value={stats?.checkIns || 0} label="Check-ins" color="text-primary" />
          <div className="relative">
            <div className="absolute top-4 bottom-4 left-0 w-px bg-border" />
            <div className="absolute top-4 bottom-4 right-0 w-px bg-border" />
            <StatItem icon={Users} value={stats?.friends || 0} label="Friends" color="text-secondary" />
          </div>
          <StatItem icon={Trophy} value={totalProgress} label="Unlocked" color="text-accent" />
        </motion.div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <Tabs defaultValue="overview" className="px-4 pt-5 pb-4">
          <TabsList className="w-full overflow-x-auto flex gap-1.5 bg-transparent p-0 mb-5 scrollbar-hide">
            {["overview", "checkins", "calendar", "saved", "playlists", "friends"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-4 py-2 rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:bg-muted/80 data-[state=inactive]:text-muted-foreground whitespace-nowrap min-h-[40px] transition-all duration-200"
              >
                {tab === "checkins" ? "Check-Ins" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Overview Tab ─────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-7 mt-0">
            {/* Lists Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-foreground">Lists <span className="text-muted-foreground font-normal text-sm ml-1">{(playlists?.length || 0) + 1}</span></h3>
                <button className="text-sm text-primary font-semibold flex items-center gap-0.5 hover:underline">
                  See all
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 p-5 flex flex-col items-center justify-center min-h-[130px] border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2.5">
                    <Bookmark className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Saved places</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{savedItems?.length || 0} places</p>
                </div>
                {playlists?.slice(0, 1).map((playlist) => (
                  <div key={playlist.id} className="rounded-2xl bg-gradient-to-br from-primary/8 to-primary/3 p-5 flex flex-col items-center justify-center min-h-[130px] border border-primary/15 hover:border-primary/30 transition-colors">
                    <span className="text-3xl mb-2">{playlist.emoji || "📍"}</span>
                    <p className="font-semibold text-sm text-foreground">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{playlist.item_count || 0} places</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Achievements Carousel ───────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-foreground">Achievements</h3>
                <span className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-full">{totalProgress}/{ACHIEVEMENT_DEFS.length}</span>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {achievementProgress.map((ach, i) => (
                  <motion.div
                    key={ach.key}
                    className={`shrink-0 w-[150px] rounded-2xl p-4 flex flex-col items-center text-center transition-all ${
                      ach.unlocked 
                        ? "bg-gradient-to-b from-primary/12 to-primary/4 border-2 border-primary/25 shadow-md" 
                        : "bg-card border border-border/80 shadow-sm"
                    }`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 + 0.3 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="relative mb-2.5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                        ach.unlocked 
                          ? "bg-gradient-to-br from-primary/20 to-secondary/20 shadow-inner" 
                          : "bg-muted"
                      }`}>
                        <span className={ach.unlocked ? "" : "grayscale opacity-40"}>{ach.emoji}</span>
                      </div>
                      {ach.unlocked && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-success flex items-center justify-center shadow-md ring-2 ring-card"
                        >
                          <span className="text-[11px] text-white font-bold">✓</span>
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs font-bold line-clamp-1 text-foreground">{ach.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{ach.description}</p>
                    {/* Progress bar */}
                    <div className="w-full mt-2.5">
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${ach.unlocked ? "bg-gradient-to-r from-primary to-secondary" : "bg-muted-foreground/30"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(ach.current / ach.target) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: i * 0.05 + 0.5 }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">{ach.current}/{ach.target}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Category Stickers ──────────────────────────────── */}
            {Object.keys(categoryCounts).length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3 text-foreground">Categories</h3>
                <div className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-1">
                  {Object.entries(categoryCounts).map(([cat, count]) => {
                    const sticker = categoryStickers[cat] || { emoji: "📍", color: "from-slate-400 to-slate-500" };
                    return (
                      <motion.div 
                        key={cat} 
                        className="flex flex-col items-center shrink-0 min-w-[76px]"
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sticker.color} flex items-center justify-center text-3xl shadow-lg ring-2 ring-white/20`}>
                          {sticker.emoji}
                        </div>
                        <p className="text-xs font-semibold mt-2 text-center capitalize line-clamp-1 text-foreground">{cat}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{count}×</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Recent Check-Ins ───────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-foreground">Recent Check-Ins</h3>
              </div>
              
              {recentCheckIns.length > 0 ? (
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  {recentCheckIns.slice(0, 6).map((checkIn, i) => (
                    <motion.div
                      key={checkIn.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <ProfileCheckInCard checkIn={checkIn} categoryStickers={categoryStickers} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<MapPin className="w-10 h-10" />}
                  title="No check-ins yet"
                  subtitle="Start exploring Sydney and share your adventures"
                  action={<Button variant="default" className="rounded-full min-h-[44px] px-6" onClick={() => navigate("/")}>Explore Now</Button>}
                />
              )}
            </div>
          </TabsContent>

          {/* ── Check-Ins Tab ──────────────────────────────────── */}
          <TabsContent value="checkins">
            {recentCheckIns.length > 0 ? (
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {recentCheckIns.map((checkIn, i) => (
                  <motion.div
                    key={checkIn.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ProfileCheckInCard checkIn={checkIn} categoryStickers={categoryStickers} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MapPin className="w-10 h-10" />}
                title="No check-ins yet"
                subtitle="Visit places and check in to build your travel diary"
              />
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
                {savedItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/activity/${item.activity_id}`}
                      className="block relative w-full overflow-hidden rounded-2xl bg-muted aspect-[4/3] group shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={item.activities.hero_image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop"}
                        alt={item.activities.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveSaved(item.activity_id);
                        }}
                        className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-md hover:bg-white/30 transition-colors shadow-sm min-w-[44px] min-h-[44px]"
                      >
                        <Heart className="w-4 h-4 fill-white text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 space-y-1">
                        <h3 className="font-bold text-sm text-white leading-tight line-clamp-1">
                          {item.activities.name}
                        </h3>
                        <p className="text-xs text-white/70 font-medium">{item.activities.category}</p>
                        <p className="text-xs text-white/50 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.activities.address || "Sydney, NSW"}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Heart className="w-10 h-10" />}
                title="No saved places yet"
                subtitle="Tap the heart on places you love to save them here"
                action={<Button variant="default" className="rounded-full min-h-[44px] px-6" onClick={() => navigate("/")}>Browse Places</Button>}
              />
            )}
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">Your Playlists</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 h-10 rounded-full min-h-[44px] font-semibold">
                    <Plus className="w-3.5 h-3.5" />
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
                      className="w-full min-h-[44px] rounded-xl"
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
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : playlists && playlists.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer relative group"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist.mutate(playlist.id);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="text-3xl">{playlist.emoji || "📍"}</span>
                    <h3 className="font-semibold text-sm mt-2 line-clamp-1 text-foreground">{playlist.name}</h3>
                    <p className="text-xs text-muted-foreground">{playlist.item_count || 0} places</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark className="w-10 h-10" />}
                title="No playlists yet"
                subtitle="Create collections of your favorite spots"
                action={<Button variant="default" className="rounded-full min-h-[44px] px-6" onClick={() => setIsDialogOpen(true)}>Create Playlist</Button>}
              />
            )}
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends">
            <EmptyState
              icon={<Users className="w-10 h-10" />}
              title="Connect with friends"
              subtitle="Find friends who explore Sydney and share adventures together"
              action={<Button variant="default" className="rounded-full min-h-[44px] px-6">Find Friends</Button>}
            />
          </TabsContent>
        </Tabs>
      </div>

      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </AppLayout>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function EmptyState({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <motion.div 
      className="text-center py-12 px-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-4 text-muted-foreground/60">
        {icon}
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-[260px] mx-auto">{subtitle}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
  color = "text-primary",
}: {
  icon: any;
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center py-4">
      <div className={`w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center mb-1.5`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <motion.span 
        className="text-xl font-extrabold text-foreground"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {value}
      </motion.span>
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

function ProfileCheckInCard({ checkIn, categoryStickers }: { checkIn: any; categoryStickers: Record<string, { emoji: string; color: string }> }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  
  const photos: string[] = (checkIn as any).photo_urls?.length > 0
    ? (checkIn as any).photo_urls
    : checkIn.photo_url ? [checkIn.photo_url] : [];
  const allImages = photos.length > 0 ? photos : checkIn.activities?.hero_image_url ? [checkIn.activities.hero_image_url] : [];
  const displayImg = allImages[photoIndex] || "/placeholder.svg";
  const hasMultiple = allImages.length > 1;
  const cat = checkIn.activities?.category?.toLowerCase() || "";
  const sticker = categoryStickers[cat];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-[4/3] group shadow-sm hover:shadow-lg transition-shadow">
      <img
        src={displayImg}
        alt={checkIn.activities?.name || "Check-in"}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onClick={() => photos.length > 0 ? setLightbox(photoIndex) : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

      {/* Category badge top-left */}
      {sticker && (
        <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-gradient-to-r ${sticker.color} text-white text-[11px] font-semibold shadow-lg flex items-center gap-1 backdrop-blur-sm`}>
          {sticker.emoji} {checkIn.activities?.category}
        </div>
      )}

      {/* Quick actions top-right */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 min-w-[44px] min-h-[44px] shadow-md">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {hasMultiple && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); setPhotoIndex((photoIndex - 1 + allImages.length) % allImages.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-md"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setPhotoIndex((photoIndex + 1) % allImages.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {hasMultiple && allImages.length <= 8 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {allImages.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIndex ? "bg-white w-3" : "bg-white/40"}`} />
          ))}
        </div>
      )}

      <Link to={`/activity/${checkIn.activities?.id}`} className="absolute bottom-0 left-0 right-0 z-10 p-4 space-y-1">
        <h3 className="font-bold text-sm text-white leading-tight line-clamp-1 drop-shadow">
          {checkIn.activities?.name || "Activity"}
        </h3>
        <div className="flex items-center gap-3 pt-0.5">
          <span className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < checkIn.rating ? "fill-warning text-warning" : "text-white/25"}`}
              />
            ))}
          </span>
          <span className="text-xs text-white/50 font-medium">
            {new Date(checkIn.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
          </span>
        </div>
        {checkIn.comment && (
          <p className="text-xs text-white/60 italic line-clamp-1 mt-0.5">"{checkIn.comment}"</p>
        )}
      </Link>

      {lightbox !== null && (
        <MediaLightbox urls={photos} initialIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
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
        <button onClick={() => onMonthChange(subMonths(month, 1))} className="p-2 rounded-lg hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ChevronDown className="w-5 h-5 rotate-90" />
        </button>
        <h3 className="font-bold text-lg text-foreground">{format(month, "MMMM yyyy")}</h3>
        <button onClick={() => onMonthChange(addMonths(month, 1))} className="p-2 rounded-lg hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ChevronDown className="w-5 h-5 -rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1.5">{d}</div>
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
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all min-w-[44px] ${
                isSelected ? "bg-primary text-primary-foreground shadow-md" :
                isToday ? "bg-primary/10 font-bold ring-1 ring-primary/30" :
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

      <div className="flex gap-4 text-xs text-muted-foreground font-medium">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Planned</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Check-in</span>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="font-semibold text-sm text-foreground">{format(parseISO(selectedDate), "EEEE, d MMMM")}</h4>
            {selectedEvents.length > 0 ? (
              selectedEvents.map((ev, i) => {
                const linkTo = ev.activityId
                  ? (ev.isEvent ? `/event/${ev.activityId}` : `/activity/${ev.activityId}`)
                  : null;
                const content = (
                  <div className="flex items-center justify-between bg-card rounded-xl border border-border p-3.5 hover:border-primary/40 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ev.type === "planned" ? "bg-primary" : "bg-warning"}`} />
                      <span className="text-sm font-medium truncate text-foreground">{ev.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full font-medium">{ev.type === "planned" ? "Planned" : "Visited"}</span>
                    </div>
                    {ev.type === "planned" && ev.id && (
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteEvent(ev.id!); }} className="p-1 text-muted-foreground hover:text-destructive shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
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
          </motion.div>
        )}
      </AnimatePresence>

      {calendarEvents.filter((e: any) => e.event_date >= format(new Date(), "yyyy-MM-dd")).length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2 text-foreground">Upcoming</h4>
          <div className="space-y-2">
            {calendarEvents
              .filter((e: any) => e.event_date >= format(new Date(), "yyyy-MM-dd"))
              .slice(0, 5)
              .map((ev: any) => (
                <Link
                  key={ev.id}
                  to={ev.activity_id ? `/activity/${ev.activity_id}` : "#"}
                  className="flex items-center justify-between bg-card rounded-xl border border-border p-3.5 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{ev.title}</p>
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
