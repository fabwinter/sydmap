import { SearchBar } from "./SearchBar";
import { FilterChips } from "./FilterChips";
import { SurpriseButton } from "./SurpriseButton";

export function ControlPanel() {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm p-4 md:p-5 space-y-4">
      {/* Search Bar - full width */}
      <SearchBar />
      
      {/* Filter Chips - horizontally scrollable */}
      <FilterChips />
      
      {/* Surprise Button - compact on desktop, full width on mobile */}
      <div className="md:max-w-xs">
        <SurpriseButton />
      </div>
    </div>
  );
}
