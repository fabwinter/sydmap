import { useState } from "react";
import { Coffee, Waves, TreePine, Utensils, Moon, Users, Baby } from "lucide-react";

const filters = [
  { id: "cafes", label: "Cafes", icon: Coffee },
  { id: "beaches", label: "Beaches", icon: Waves },
  { id: "parks", label: "Parks", icon: TreePine },
  { id: "restaurants", label: "Restaurants", icon: Utensils },
  { id: "nightlife", label: "Nightlife", icon: Moon },
  { id: "family", label: "Family", icon: Baby },
  { id: "groups", label: "Groups", icon: Users },
];

export function FilterChips() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4">
      {filters.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActive(active === id ? null : id)}
          className={`filter-chip flex items-center gap-2 whitespace-nowrap shrink-0 ${
            active === id ? "active" : ""
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
