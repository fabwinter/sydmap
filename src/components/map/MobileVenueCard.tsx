import { Star, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Activity } from "@/hooks/useActivities";
import { motion, AnimatePresence } from "framer-motion";

interface MobileVenueCardProps {
  activity: Activity | null;
  onClose: () => void;
  onNavigate: (activity: Activity) => void;
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
};

export function MobileVenueCard({ activity, onClose, onNavigate }: MobileVenueCardProps) {
  return (
    <AnimatePresence>
      {activity && (
        <motion.div
          key={activity.id}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-3 right-3 z-30 bg-card rounded-xl shadow-xl border border-border p-4 md:hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-full bg-muted/80 hover:bg-muted"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex gap-3">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
              {activity.hero_image_url ? (
                <img
                  src={activity.hero_image_url}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs text-white ${
                    categoryColors[activity.category] || "bg-primary"
                  }`}
                >
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

          <Button
            size="sm"
            className="w-full mt-3"
            onClick={() => onNavigate(activity)}
          >
            View Details
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
