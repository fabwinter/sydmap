import { useState } from "react";
import { MapPin, X, Coffee, Waves, TreePine, Utensils, Wine, Landmark, ShoppingBag, Dumbbell, Cake, SlidersHorizontal, Sun, Home, DollarSign, Baby, Dog, Accessibility, Wifi, Car, Mountain, Heart, Users, Moon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchFilters } from "@/hooks/useSearchFilters";

const categories = [
  { id: "Cafe", label: "Cafes", icon: Coffee },
  { id: "Beach", label: "Beaches", icon: Waves },
  { id: "Park", label: "Parks", icon: TreePine },
  { id: "Restaurant", label: "Restaurants", icon: Utensils },
  { id: "Bar", label: "Bars", icon: Wine },
  { id: "Museum", label: "Museums", icon: Landmark },
  { id: "Shopping", label: "Shopping", icon: ShoppingBag },
  { id: "Gym", label: "Gyms", icon: Dumbbell },
  { id: "Bakery", label: "Bakeries", icon: Cake },
];

const experienceTags = [
  { id: "outdoor", label: "Outdoors", icon: Sun },
  { id: "indoor", label: "Indoor", icon: Home },
  { id: "free", label: "Free", icon: DollarSign },
  { id: "kid-friendly", label: "Kid Friendly", icon: Baby },
  { id: "pet-friendly", label: "Pet Friendly", icon: Dog },
  { id: "accessible", label: "Accessible", icon: Accessibility },
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "outdoor-seating", label: "Outdoor Seating", icon: Mountain },
];

const travellerTags = [
  { id: "date-night", label: "Date Night", icon: Heart },
  { id: "groups", label: "Groups", icon: Users },
  { id: "nightlife", label: "Nightlife", icon: Moon },
  { id: "arts-culture", label: "Arts & Culture", icon: Palette },
];

interface MapFiltersProps {
  activityCount: number;
  isLoading: boolean;
}

export function MapFilters({ activityCount, isLoading }: MapFiltersProps) {
  const { filters, setQuery, setCategory, setIsOpen, toggleTag, setMaxDistance, setMinRating, clearFilters } = useSearchFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeFilterCount =
    filters.tags.length +
    (filters.maxDistance !== null ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    (filters.isOpen ? 1 : 0);

  const hasActiveFilters = filters.query || filters.category || filters.isOpen || filters.minRating !== null || filters.tags.length > 0;

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      {/* Search Input with embedded filter button */}
      <div className="bg-card rounded-xl shadow-lg p-3 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-primary shrink-0" />
        <input
          type="text"
          placeholder="Search locations..."
          value={filters.query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-sm min-w-0"
        />
        {filters.query && (
          <button onClick={() => setQuery("")}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={`p-2 rounded-lg transition-colors relative ${
                activeFilterCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 hover:bg-primary/20"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <SlidersHorizontal className={`w-4 h-4 ${activeFilterCount > 0 ? "" : "text-primary"}`} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
            <SheetHeader className="pb-2">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-bold">Filters</SheetTitle>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm text-muted-foreground">
                    Clear all
                  </Button>
                )}
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(85vh-120px)]">
              <div className="space-y-6 pb-6 pr-2">
                {/* Distance slider */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Travel distance</h3>
                  <div className="px-1">
                    <Slider
                      value={[filters.maxDistance ?? 20]}
                      onValueChange={([val]) => setMaxDistance(val === 20 ? null : val)}
                      min={1}
                      max={20}
                      step={1}
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>1 km</span>
                      <span className="font-medium text-foreground">
                        {filters.maxDistance ? `${filters.maxDistance} km` : "Any distance"}
                      </span>
                      <span>20 km</span>
                    </div>
                  </div>
                </div>

                {/* Rating filter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Minimum rating</h3>
                  <div className="flex gap-2">
                    {[null, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating ?? "any"}
                        onClick={() => setMinRating(rating)}
                        className={`filter-chip text-xs ${
                          filters.minRating === rating ? "active" : ""
                        }`}
                      >
                        {rating ? `${rating}+ ★` : "Any"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience type */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Experience type</h3>
                  <div className="flex flex-wrap gap-2">
                    {experienceTags.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => toggleTag(id)}
                        className={`filter-chip flex items-center gap-1.5 text-xs ${
                          filters.tags.includes(id) ? "active" : ""
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Traveller type */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Traveller type</h3>
                  <div className="flex flex-wrap gap-2">
                    {travellerTags.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => toggleTag(id)}
                        className={`filter-chip flex items-center gap-1.5 text-xs ${
                          filters.tags.includes(id) ? "active" : ""
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category (full list) */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setCategory(filters.category === id ? null : id)}
                        className={`filter-chip flex items-center gap-1.5 text-xs ${
                          filters.category === id ? "active" : ""
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="pt-3 border-t border-border">
              <Button className="w-full" onClick={() => setSheetOpen(false)}>
                Show results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Category chips */}
      <div className="bg-card rounded-xl shadow-lg p-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 min-w-0">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={(e) => {
                e.stopPropagation();
                setCategory(filters.category === id ? null : id);
              }}
              className={`filter-chip flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                filters.category === id ? "active" : ""
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Open Now + Clear */}
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
