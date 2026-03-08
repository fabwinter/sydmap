import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  MapPin,
  Calendar,
  Sparkles,
  Clock,
  Search,
  User,
  Flame,
  CloudSun,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStreak } from "@/hooks/useStreak";
import { useWeather } from "@/hooks/useWeather";
import { useNearbyActivities } from "@/hooks/useNearbyActivities";
import { formatDistance } from "@/hooks/useUserLocation";

const quickActions = [
  {
    icon: Search,
    label: "Explore",
    description: "Discover something new",
    path: "/home",
    color: "from-[hsl(var(--primary))] to-[hsl(210,80%,50%)]",
    emoji: "🔍",
  },
  {
    icon: MessageCircle,
    label: "Chat",
    description: "Ask SYDMAP anything",
    path: "/chat",
    color: "from-[hsl(260,70%,55%)] to-[hsl(280,60%,50%)]",
    emoji: "💬",
  },
  {
    icon: Calendar,
    label: "What's On",
    description: "Events happening now",
    path: "/whats-on",
    color: "from-[hsl(20,80%,55%)] to-[hsl(340,70%,50%)]",
    emoji: "🎉",
  },
  {
    icon: MapPin,
    label: "Check In",
    description: "Share your visit",
    path: "/map",
    color: "from-[hsl(152,60%,38%)] to-[hsl(160,50%,45%)]",
    emoji: "📍",
  },
  {
    icon: Sparkles,
    label: "Surprise Me",
    description: "Spin the wheel",
    path: "/home#surprise",
    color: "from-[hsl(36,95%,55%)] to-[hsl(20,80%,55%)]",
    emoji: "🎲",
  },
  {
    icon: Clock,
    label: "Timeline",
    description: "Relive your adventures",
    path: "/timeline",
    color: "from-[hsl(195,60%,50%)] to-[hsl(160,50%,45%)]",
    emoji: "⏳",
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getWeatherSuggestion(desc: string, temp: number): { text: string; emoji: string; path: string } | null {
  const d = desc.toLowerCase();
  if (d.includes("clear") || d.includes("sunny")) {
    if (temp >= 25) return { text: "Perfect beach weather — hit the sand!", emoji: "🏖️", path: "/home?category=Beach" };
    return { text: "Beautiful day — explore a park!", emoji: "🌳", path: "/home?category=Park" };
  }
  if (d.includes("rain") || d.includes("storm")) {
    return { text: "Rainy day — cozy up in a café", emoji: "☕", path: "/home?category=Cafe" };
  }
  if (d.includes("cloud")) {
    return { text: "Cloudy skies — perfect for a museum", emoji: "🏛️", path: "/home?category=Museum" };
  }
  return null;
}

export default function Hub() {
  const navigate = useNavigate();
  const { profile, isLoading, isAuthenticated } = useAuth();
  const { data: streak } = useStreak();
  const weather = useWeather();
  const { data: nearbyVenues } = useNearbyActivities(2, 2);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    if (!isLoading) setReady(true);
  }, [isLoading, isAuthenticated, navigate]);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-xl bg-primary/20 animate-pulse" />
      </div>
    );
  }

  const firstName = profile?.name?.split(" ")[0] || "Explorer";
  const currentStreak = streak?.current_streak || 0;
  const weatherSuggestion = weather ? getWeatherSuggestion(weather.description, weather.temp) : null;

  const hasContextCards = currentStreak > 0 || weatherSuggestion || (nearbyVenues && nearbyVenues.length > 0);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-8 pb-2 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-muted-foreground text-sm font-medium">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-foreground">{firstName} 👋</h1>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/profile")}
          className="w-11 h-11 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-border"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </motion.button>
      </div>

      {/* Context Cards */}
      {hasContextCards && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-5 pb-2 pt-1"
        >
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Streak Card */}
            {currentStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="flex-shrink-0 bg-gradient-to-br from-orange-500/15 to-red-500/10 border border-orange-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[180px]"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{currentStreak}-day streak</p>
                  <p className="text-[11px] text-muted-foreground">Keep it going!</p>
                </div>
              </motion.div>
            )}

            {/* Weather Suggestion Card */}
            {weatherSuggestion && weather && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => navigate(weatherSuggestion.path)}
                className="flex-shrink-0 bg-gradient-to-br from-sky-500/15 to-blue-500/10 border border-sky-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[220px] text-left"
              >
                <div className="text-2xl">{weather.icon}</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {weather.temp}° — {weatherSuggestion.text}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                    Tap to explore <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </motion.button>
            )}

            {/* Nearby Venues */}
            {nearbyVenues?.map((venue, i) => (
              <motion.button
                key={venue.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                onClick={() => navigate(`/activity/${venue.id}`)}
                className="flex-shrink-0 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[200px] text-left"
              >
                {venue.hero_image_url ? (
                  <img
                    src={venue.hero_image_url}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{venue.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDistance(venue.distance)} away · Open
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Prompt */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-5 text-muted-foreground text-base mb-4"
      >
        What are you in the mood for?
      </motion.p>

      {/* Action Grid */}
      <div className="px-5 flex-1">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.4, ease: "easeOut" }}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 active:scale-[0.97] hover:shadow-lg"
              style={{ minHeight: 130 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:opacity-100 transition-opacity`}
              />
              <span className="absolute -bottom-2 -right-2 text-5xl opacity-20 group-hover:opacity-30 transition-opacity select-none">
                {action.emoji}
              </span>
              <div className="relative z-10">
                <action.icon className="w-6 h-6 text-white/90 mb-3" />
                <h3 className="text-white font-semibold text-base leading-tight">
                  {action.label}
                </h3>
                <p className="text-white/70 text-xs mt-1 leading-snug">
                  {action.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Leaderboard Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="px-5 pb-2"
      >
        <button
          onClick={() => navigate("/leaderboard")}
          className="w-full flex items-center gap-3 bg-muted/50 hover:bg-muted rounded-2xl p-4 transition-colors active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Top Explorers</p>
            <p className="text-xs text-muted-foreground">See how you rank</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </motion.div>

      {/* Bottom branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="py-6 text-center"
      >
        <span className="text-muted-foreground/50 text-xs font-semibold tracking-widest">
          SYDMAP
        </span>
      </motion.div>
    </div>
  );
}
