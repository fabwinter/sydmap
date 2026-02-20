import { useState } from "react";
import { MapPin, Star, Heart, Coffee, Waves, TreePine, Utensils, Wine, Landmark, ShoppingBag, Dumbbell, Cake, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsActivitySaved, useToggleSavedItem } from "@/hooks/useSavedItems";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useToggleWhatsOn } from "@/hooks/useWhatsOnToday";
import { toast } from "sonner";
import type { ActivityDisplay } from "@/hooks/useActivities";

// Re-export for backward compatibility
export type Activity = ActivityDisplay;

// Category icon mapping
const categoryIcons: Record<string, React.ElementType> = {
  Cafe: Coffee,
  Beach: Waves,
  Park: TreePine,
  Restaurant: Utensils,
  Bar: Wine,
  Museum: Landmark,
  Shopping: ShoppingBag,
  Gym: Dumbbell,
  Bakery: Cake,
};

// Category gradient colors
const categoryGradients: Record<string, string> = {
  Cafe: "from-amber-400 to-orange-500",
  Beach: "from-cyan-400 to-blue-500",
  Park: "from-green-400 to-emerald-500",
  Restaurant: "from-red-400 to-rose-500",
  Bar: "from-purple-400 to-violet-500",
  Museum: "from-slate-400 to-slate-600",
  Shopping: "from-pink-400 to-fuchsia-500",
  Gym: "from-orange-400 to-red-500",
  Bakery: "from-yellow-400 to-amber-500",
};

// Determine tag text based on activity properties
function getTagInfo(activity: ActivityDisplay): { text: string; variant: "open" | "popular" | "default" } | null {
  if (activity.isOpen) return { text: "Open", variant: "open" };
  if (activity.reviewCount > 50) return { text: "Popular", variant: "popular" };
  return null;
}

interface ActivityCardProps {
  activity: ActivityDisplay;
  variant?: "default" | "featured";
}

function ImageWithFallback({ 
  src, 
  alt, 
  category,
  className 
}: { 
  src: string; 
  alt: string; 
  category: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const Icon = categoryIcons[category] || MapPin;
  const gradient = categoryGradients[category] || "from-slate-400 to-slate-600";

  if (hasError || !src) {
    return (
      <div className={`bg-gradient-to-br ${gradient} flex items-center justify-center ${className}`}>
        <Icon className="w-12 h-12 text-white/80" />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`absolute inset-0 bg-muted animate-pulse ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}

function WhatsOnButton({ activityId, name, showInWhatsOn }: { activityId: string; name: string; showInWhatsOn?: boolean }) {
  const toggleWhatsOn = useToggleWhatsOn();
  const newState = !showInWhatsOn;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWhatsOn.mutate(
      { activityId, show: newState },
      {
        onSuccess: () => toast.success(newState ? `"${name}" added to What's On` : `"${name}" removed from What's On`),
        onError: (err) => toast.error(err.message || "Failed"),
      }
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleWhatsOn.isPending}
      className={`absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-colors shadow-sm ${
        showInWhatsOn ? "bg-warning/90 text-white" : "bg-white/80 text-muted-foreground hover:text-foreground"
      }`}
      aria-label={showInWhatsOn ? "Remove from What's On" : "Add to What's On"}
      title={showInWhatsOn ? "Remove from What's On" : "Add to What's On"}
    >
      {toggleWhatsOn.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
    </button>
  );
}

function HeartButton({ activityId }: { activityId: string }) {
  const { isAuthenticated } = useAuth();
  const { data: isSaved } = useIsActivitySaved(activityId);
  const toggleSaved = useToggleSavedItem();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    toggleSaved.mutate({ activityId, isSaved: !!isSaved });
  };

  return (
    <button
      onClick={handleClick}
      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
      aria-label={isSaved ? "Remove from saved" : "Save"}
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          isSaved 
            ? "fill-red-500 text-red-500" 
            : "text-foreground/70 hover:text-foreground"
        }`}
      />
    </button>
  );
}

export function ActivityCard({ activity, variant = "default" }: ActivityCardProps) {
  const tag = getTagInfo(activity);
  const isAdmin = useIsAdmin();

  if (variant === "featured") {
    return (
      <Link
        to={activity.isEvent ? `/event/${activity.id}` : `/activity/${activity.id}`}
        className="group flex flex-col"
      >
        {/* Image container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
          <ImageWithFallback
            src={activity.image}
            alt={activity.name}
            category={activity.category}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Tag badge */}
          {tag && !isAdmin && (
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-foreground shadow-sm">
              {tag.text}
            </div>
          )}

          {/* Admin: What's On toggle */}
          {isAdmin && <WhatsOnButton activityId={activity.id} name={activity.name} showInWhatsOn={activity.showInWhatsOn} />}

          {/* Heart button */}
          <HeartButton activityId={activity.id} />
        </div>

        {/* Info below image */}
        <div className="pt-2.5 space-y-0.5">
          <h3 className="font-semibold text-sm text-foreground line-clamp-1">{activity.name}</h3>
          <p className="text-xs text-muted-foreground">{activity.category}</p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
            <span className="text-xs font-medium text-foreground">{activity.rating}</span>
            <span className="text-xs text-muted-foreground">({activity.reviewCount})</span>
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {activity.distance}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card - same Airbnb style
  return (
    <Link
      to={activity.isEvent ? `/event/${activity.id}` : `/activity/${activity.id}`}
      className="group flex flex-col"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        <ImageWithFallback
          src={activity.image}
          alt={activity.name}
          category={activity.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Tag badge */}
        {tag && !isAdmin && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-foreground shadow-sm">
            {tag.text}
          </div>
        )}

        {/* Admin: What's On toggle */}
        {isAdmin && <WhatsOnButton activityId={activity.id} name={activity.name} showInWhatsOn={activity.showInWhatsOn} />}

        {/* Heart button */}
        <HeartButton activityId={activity.id} />
      </div>

      {/* Info below image */}
      <div className="pt-2.5 space-y-0.5">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1">{activity.name}</h3>
        <p className="text-xs text-muted-foreground">{activity.category}</p>
        <div className="flex items-center gap-1.5 pt-0.5">
          <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
          <span className="text-xs font-medium text-foreground">{activity.rating}</span>
          <span className="text-xs text-muted-foreground">({activity.reviewCount})</span>
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {activity.distance}
          </span>
        </div>
      </div>
    </Link>
  );
}
