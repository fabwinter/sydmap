import { MapPin, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export interface Activity {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: string;
  image: string;
  isOpen?: boolean;
  closesAt?: string;
}

interface ActivityCardProps {
  activity: Activity;
  variant?: "default" | "featured";
}

export function ActivityCard({ activity, variant = "default" }: ActivityCardProps) {
  if (variant === "featured") {
    return (
      <Link
        to={`/activity/${activity.id}`}
        className="activity-card shrink-0 w-64 overflow-hidden"
      >
        <div className="relative aspect-[4/3]">
          <img
            src={activity.image}
            alt={activity.name}
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
      <div className="relative aspect-[4/3]">
        <img
          src={activity.image}
          alt={activity.name}
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
