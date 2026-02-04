import { useState } from "react";
import { MapPin, Star, Clock, Coffee, Waves, TreePine, Utensils, Wine, Landmark, ShoppingBag, Dumbbell, Cake, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
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

export function ActivityCard({ activity, variant = "default" }: ActivityCardProps) {
  if (variant === "featured") {
    return (
      <Link
        to={`/activity/${activity.id}`}
        className="activity-card shrink-0 w-64 overflow-hidden"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
          <ImageWithFallback
            src={activity.image}
            alt={activity.name}
            category={activity.category}
            className="w-full h-full object-cover"
          />
          {activity.isOpen && (
            <div className="absolute top-3 left-3 status-badge open">
              OPEN NOW
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-base line-clamp-1">{activity.name}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-white/80 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {activity.distance}
              </span>
              {activity.closesAt && (
                <span className="text-white/80 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Closes {activity.closesAt}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/activity/${activity.id}`}
      className="activity-card flex flex-col"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        <ImageWithFallback
          src={activity.image}
          alt={activity.name}
          category={activity.category}
          className="w-full h-full object-cover"
        />
        {activity.isOpen && (
          <div className="absolute top-2 left-2 status-badge open text-[10px]">
            OPEN
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">{activity.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{activity.category}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
            <span className="text-xs font-medium">{activity.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({activity.reviewCount})
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {activity.distance}
          </span>
        </div>
      </div>
    </Link>
  );
}
