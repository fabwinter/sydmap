import { useState } from "react";
import { Search, X, SlidersHorizontal, Coffee, Waves, TreePine, Utensils, Wine, Landmark, ShoppingBag, Dumbbell, Cake, Sun, Home, DollarSign, Baby, Dog, Accessibility, Wifi, Car, Mountain, Heart, Users, Moon, Palette, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { SurpriseButton } from "./SurpriseButton";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function ControlPanel() {
  const { filters, setQuery, setCategory, toggleTag, setMaxDistance, setMinRating, clearFilters } = useSearchFilters();
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount =
    filters.tags.length +
    (filters.maxDistance !== null ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    (filters.isOpen ? 1 : 0);

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm p-4 md:p-5 space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where should I go?"
          className="search-input shadow-soft"
        />
        {filters.query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        {/* Filter icon inside search bar */}
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <button className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
              activeFilterCount > 0
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 hover:bg-primary/20"
            }`}>
              <SlidersHorizontal className={`w-5 h-5 ${activeFilterCount > 0 ? "" : "text-primary"}`} />
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

                {/* Category (in expanded view) */}
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

            {/* Apply button */}
            <div className="pt-3 border-t border-border">
              <Button className="w-full" onClick={() => setFilterOpen(false)}>
                Show results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Category chips row + Filters button inline */}
      <div className="flex gap-2 items-center">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 flex-1">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCategory(filters.category === id ? null : id)}
              className={`filter-chip flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                filters.category === id ? "active" : ""
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Inline Filters button with badge */}
        <button
          onClick={() => setFilterOpen(true)}
          className="filter-chip flex items-center gap-1.5 shrink-0 relative"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Map view switch */}
        <Link
          to="/map"
          className="filter-chip flex items-center gap-1.5 shrink-0 border-primary/30 text-primary"
        >
          <Map className="w-3.5 h-3.5" />
          Map
        </Link>
      </div>

      {/* Surprise Button */}
      <div className="md:max-w-xs">
        <SurpriseButton />
      </div>
    </div>
  );
}
