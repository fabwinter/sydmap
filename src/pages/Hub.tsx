import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle,
  MapPin,
  Calendar,
  Sparkles,
  Clock,
  Search,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const quickActions = [
  {
    icon: Search,
    label: "Explore",
    description: "Discover something new",
    path: "/home",
    color: "from-[hsl(195,85%,40%)] to-[hsl(210,80%,50%)]",
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

export default function Hub() {
  const navigate = useNavigate();
  const { profile, isLoading, isAuthenticated } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If not authenticated, redirect to landing
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

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
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

      {/* Prompt */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-5 text-muted-foreground text-base mb-6"
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
              onClick={() => {
                navigate(action.path);
              }}
              className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 active:scale-[0.97] hover:shadow-lg"
              style={{ minHeight: 130 }}
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:opacity-100 transition-opacity`}
              />

              {/* Decorative emoji */}
              <span className="absolute -bottom-2 -right-2 text-5xl opacity-20 group-hover:opacity-30 transition-opacity select-none">
                {action.emoji}
              </span>

              {/* Content */}
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
