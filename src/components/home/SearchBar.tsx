import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export function SearchBar() {
  const { filters, setQuery, setIsOpen, setMinRating, clearFilters } = useSearchFilters();
  const navigate = useNavigate();
  const location = useLocation();
  const [filterOpen, setFilterOpen] = useState(false);

  const hasActiveFilters = filters.isOpen || filters.minRating !== null;
  
  const handleSearch = (value: string) => {
    setQuery(value);
    // If on map page, search applies there. If on home, it applies to recommendations
  };

  const handleClearFilters = () => {
    clearFilters();
    setFilterOpen(false);
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={filters.query}
        onChange={(e) => handleSearch(e.target.value)}
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
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <button className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
            hasActiveFilters 
              ? "bg-primary text-primary-foreground" 
              : "bg-primary/10 hover:bg-primary/20"
          }`}>
            <SlidersHorizontal className={`w-5 h-5 ${hasActiveFilters ? "" : "text-primary"}`} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="open-now" className="text-sm">Open Now</Label>
              <Switch
                id="open-now"
                checked={filters.isOpen}
                onCheckedChange={setIsOpen}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Minimum Rating</Label>
                <span className="text-sm text-muted-foreground">
                  {filters.minRating ? `${filters.minRating}+` : "Any"}
                </span>
              </div>
              <Slider
                value={[filters.minRating ?? 0]}
                onValueChange={([value]) => setMinRating(value === 0 ? null : value)}
                min={0}
                max={5}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
