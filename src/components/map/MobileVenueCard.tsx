import { Star, X, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Activity } from "@/hooks/useActivities";
import { motion, AnimatePresence } from "framer-motion";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface MobileVenueCardProps {
  activity: Activity | null;
  onClose: () => void;
  onNavigate: (activity: Activity) => void;
  onImportToDb?: (activity: Activity) => void;
  isImporting?: boolean;
}

const categoryColors: Record<string, string> = {
  Cafe: "bg-accent",
  Beach: "bg-secondary",
  Park: "bg-green-500",
  Restaurant: "bg-red-500",
  Bar: "bg-purple-500",
  Shopping: "bg-pink-500",
  Gym: "bg-orange-500",
  Museum: "bg-indigo-500",
  Bakery: "bg-amber-500",
  Playground: "bg-yellow-500",
  "Swimming Pool": "bg-cyan-500",
  "tourist attraction": "bg-teal-500",
  "Sports and Recreation": "bg-emerald-600",
  Daycare: "bg-rose-500",
  Education: "bg-violet-500",
  Hotel: "bg-sky-500",
};

export function MobileVenueCard({ activity, onClose, onNavigate, onImportToDb, isImporting }: MobileVenueCardProps) {
  const isAdmin = useIsAdmin();
  const isFoursquare = activity?.id.startsWith("fs-");

  return (
    <AnimatePresence>
      {activity && (
        <motion.div
          key={activity.id}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-3 right-3 z-30 bg-card rounded-xl shadow-xl border border-border p-4 md:hidden max-w-[calc(100vw-1.5rem)]"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-full bg-muted/80 hover:bg-muted"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {isAdmin && (
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${isFoursquare ? "bg-orange-500" : "bg-green-600"}`}>
              {isFoursquare ? "Foursquare" : "In DB"}
            </div>
          )}

          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
              {activity.hero_image_url ? (
                <img src={activity.hero_image_url} alt={activity.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs text-white ${categoryColors[activity.category] || "bg-primary"}`}>
                  {activity.category}
                </span>
                {activity.is_open ? (
                  <span className="text-xs font-medium text-success">Open</span>
                ) : (
                  <span className="text-xs font-medium text-destructive">Closed</span>
                )}
              </div>
              <h3 className="font-semibold text-foreground truncate">{activity.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <Star className="w-3 h-3 fill-warning text-warning" />
                <span>{activity.rating?.toFixed(1) || "N/A"}</span>
                <span className="text-xs">({activity.review_count} reviews)</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            {isAdmin && isFoursquare && onImportToDb && (
              <Button size="sm" variant="outline" className="gap-1 text-xs" disabled={isImporting} onClick={() => onImportToDb(activity)}>
                <Plus className="w-3 h-3" /> Add to DB
              </Button>
            )}
            <Button size="sm" className="flex-1" onClick={() => onNavigate(activity)}>
              View Venue
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}