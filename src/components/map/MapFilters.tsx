import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FilterChips } from "@/components/home/FilterChips";
import { useSearchFilters } from "@/hooks/useSearchFilters";

interface MapFiltersProps {
  activityCount: number;
  isLoading: boolean;
}

export function MapFilters({ activityCount, isLoading }: MapFiltersProps) {
  const { filters, setQuery, setIsOpen, clearFilters } = useSearchFilters();

  const hasActiveFilters = filters.query || filters.category || filters.isOpen || filters.minRating !== null;

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="bg-card rounded-xl shadow-lg p-3 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-primary shrink-0" />
        <input
          type="text"
          placeholder="Search locations..."
          value={filters.query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-sm"
        />
        {filters.query && (
          <button onClick={() => setQuery("")}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="bg-card rounded-xl shadow-lg p-3">
        <FilterChips />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Switch
              id="map-open-now"
              checked={filters.isOpen}
              onCheckedChange={setIsOpen}
            />
            <Label htmlFor="map-open-now" className="text-sm">Open Now</Label>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Activity Count - Mobile only */}
      <div className="md:hidden bg-card rounded-full shadow-lg px-4 py-2 flex items-center gap-2 w-fit">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {isLoading ? "Loading..." : `${activityCount} places`}
        </span>
      </div>
    </div>
  );
}
