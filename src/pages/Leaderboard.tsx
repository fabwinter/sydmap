import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Flame, User, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/layout/PageTransition";

const periods = [
  { key: "week" as const, label: "This Week" },
  { key: "month" as const, label: "This Month" },
  { key: "all" as const, label: "All Time" },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
        <Trophy className="w-4 h-4 text-yellow-500" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-slate-300/20 flex items-center justify-center">
        <Medal className="w-4 h-4 text-slate-400" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center">
        <Medal className="w-4 h-4 text-amber-600" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <span className="text-xs font-bold text-muted-foreground">{rank}</span>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "all">("all");
  const { data: entries, isLoading } = useLeaderboard(period);

  const myEntry = entries?.find((e) => e.profile_id === profile?.id);

  return (
    <PageTransition className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Top Explorers</h1>
          <p className="text-xs text-muted-foreground">See who's discovering the most</p>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="px-5 pb-4">
        <div className="flex gap-2 bg-muted rounded-xl p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 relative py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                period === p.key ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {period === p.key && (
                <motion.div
                  layoutId="period-tab"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* My Rank */}
      {myEntry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <RankBadge rank={Number(myEntry.rank)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Your Rank</p>
            <p className="text-xs text-muted-foreground">
              #{myEntry.rank} · {myEntry.check_in_count} check-ins
            </p>
          </div>
          <Flame className="w-5 h-5 text-primary" />
        </motion.div>
      )}

      {/* List */}
      <div className="flex-1 px-5 pb-24">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-3 w-1/4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : entries && entries.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={period}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {entries.map((entry, i) => {
                const isMe = entry.profile_id === profile?.id;
                return (
                  <motion.div
                    key={entry.profile_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isMe ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/50"
                    }`}
                  >
                    <RankBadge rank={Number(entry.rank)} />
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0 ring-2 ring-border">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {entry.name || "Explorer"}
                        {isMe && <span className="text-primary ml-1 text-xs">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.check_in_count} check-in{entry.check_in_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No check-ins yet for this period</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Be the first explorer!</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
