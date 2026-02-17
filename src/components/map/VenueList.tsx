import { Star, MapPin, CheckSquare, Square } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Activity } from "@/hooks/useActivities";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VenueListProps {
  activities: Activity[];
  isLoading: boolean;
  selectedActivity: Activity | null;
  onSelectActivity: (activity: Activity) => void;
  onNavigateToDetails: (activity: Activity) => void;
  bulkMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  Cafe: "bg-accent",
  Beach: "bg-secondary",
  Park: "bg-green-500",
  Restaurant: "bg-red-500",
  Shopping: "bg-pink-500",
  Museum: "bg-indigo-500",
  Bakery: "bg-amber-500",
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export function VenueList({
  activities,
  isLoading,
  selectedActivity,
  onSelectActivity,
  onNavigateToDetails,
  bulkMode = false,
  selectedIds = new Set(),
  onToggleSelect,
}: VenueListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No places found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          {activities.length} places found
        </p>
        <AnimatePresence mode="popLayout">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={listContainerVariants}
            className="space-y-3"
          >
            {activities.map((activity) => {
              const isSelected = selectedActivity?.id === activity.id;
              const isBulkSelected = selectedIds.has(activity.id);
              return (
                <motion.div
                  key={activity.id}
                  variants={listItemVariants}
                  layout
                  className={cn(
                    "bg-card rounded-xl p-4 cursor-pointer transition-all border-2",
                    bulkMode && isBulkSelected
                      ? "border-destructive shadow-md bg-destructive/5"
                      : isSelected
                      ? "border-primary shadow-md"
                      : "border-transparent hover:border-border hover:shadow-sm"
                  )}
                  onClick={() => {
                    if (bulkMode && onToggleSelect) {
                      onToggleSelect(activity.id);
                    } else {
                      onNavigateToDetails(activity);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex gap-4">
                    {/* Bulk select checkbox */}
                    {bulkMode && (
                      <div className="flex items-center shrink-0">
                        {isBulkSelected ? (
                          <CheckSquare className="w-5 h-5 text-destructive" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    {/* Thumbnail */}
                    <div className="w-28 h-28 rounded-xl bg-muted overflow-hidden shrink-0">
                      {activity.hero_image_url ? (
                        <img
                          src={activity.hero_image_url}
                          alt={activity.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs text-white",
                            categoryColors[activity.category] || "bg-primary"
                          )}
                        >
                          {activity.category}
                        </span>
                        {activity.is_open ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">
                            Open
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">
                            Closed
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground text-base truncate">
                        {activity.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                          <span>{activity.rating?.toFixed(1) || "N/A"}</span>
                        </div>
                        <span>•</span>
                        <span>{activity.review_count} reviews</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
