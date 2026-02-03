import { Coffee, Waves, TreePine, Utensils, Moon, Baby, Landmark, Wine, ShoppingBag, Dumbbell, Cake } from "lucide-react";
import { useSearchFilters } from "@/hooks/useSearchFilters";

const filters = [
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

export function FilterChips() {
  const { filters: searchFilters, setCategory } = useSearchFilters();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4">
      {filters.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setCategory(searchFilters.category === id ? null : id)}
          className={`filter-chip flex items-center gap-2 whitespace-nowrap shrink-0 ${
            searchFilters.category === id ? "active" : ""
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
