import { useState } from "react";
import { Search, Map, Clock, Star, MapPin, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckInTimeline } from "@/hooks/useCheckInTimeline";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "cafe", label: "Café" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "beach", label: "Beach" },
  { value: "park", label: "Park" },
  { value: "museum", label: "Museum" },
  { value: "shopping", label: "Shopping" },
];

// Category icon mapping
const categoryIcons: Record<string, string> = {
  cafe: "☕",
  restaurant: "🍽️",
  bar: "🍸",
  beach: "🏖️",
  park: "🌳",
  museum: "🏛️",
  shopping: "🛍️",
  pub: "🍺",
};

export default function Timeline() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: groupedCheckIns, isLoading } = useCheckInTimeline(search, category);

  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }

  const totalCheckIns = groupedCheckIns?.reduce((sum, group) => sum + group.checkIns.length, 0) || 0;

  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Timeline</h1>
            <p className="text-sm text-muted-foreground">{totalCheckIns} places visited</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/map")}
          >
            <Map className="w-4 h-4" />
            Map
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search timeline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timeline List */}
        <div className="space-y-6 pb-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-3 pl-6 border-l-2 border-border ml-3">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                      <Skeleton className="w-14 h-14 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : groupedCheckIns && groupedCheckIns.length > 0 ? (
            groupedCheckIns.map((group) => (
              <div key={group.date}>
                {/* Date Header */}
                <h2 className="font-bold text-base mb-3">{group.label}</h2>

                {/* Timeline items */}
                <div className="space-y-3 pl-6 border-l-2 border-primary/20 ml-3">
                  {group.checkIns.map((checkIn) => {
                    const catKey = checkIn.activities?.category?.toLowerCase() || "";
                    const icon = categoryIcons[catKey] || "📍";
                    const time = new Date(checkIn.created_at).toLocaleTimeString("en-AU", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return (
                      <Link
                        key={checkIn.id}
                        to={`/activity/${checkIn.activity_id}`}
                        className="relative flex items-start gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary transition-colors"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-[calc(1.5rem+7px)] top-5 w-3.5 h-3.5 rounded-full bg-primary/80 border-2 border-background" />

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                          {icon}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {checkIn.activities?.name || "Unknown venue"}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {checkIn.activities?.category}
                            {checkIn.activities?.address && ` • ${checkIn.activities.address.split(",")[0]}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {checkIn.rating > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-warning">
                                <Star className="w-3 h-3 fill-current" />
                                {checkIn.rating}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {time}
                            </span>
                          </div>
                          {checkIn.comment && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                              "{checkIn.comment}"
                            </p>
                          )}
                        </div>

                        {/* Photo thumbnail */}
                        {(checkIn.photo_url || checkIn.activities?.hero_image_url) && (
                          <img
                            src={checkIn.photo_url || checkIn.activities?.hero_image_url || ""}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No check-ins yet</p>
              <p className="text-sm mt-1">
                Start checking in to build your timeline!
              </p>
              <Button
                variant="link"
                className="mt-2 text-primary"
                onClick={() => navigate("/")}
              >
                Explore activities
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
