import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ActivityCard, Activity } from "./ActivityCard";

const featuredActivities: Activity[] = [
  {
    id: "1",
    name: "Bronte Beach",
    category: "Beach",
    rating: 4.8,
    reviewCount: 2341,
    distance: "2.3 km",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    isOpen: true,
    closesAt: "6pm",
  },
  {
    id: "2",
    name: "The Grounds of Alexandria",
    category: "Cafe",
    rating: 4.6,
    reviewCount: 1823,
    distance: "4.1 km",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
    isOpen: true,
    closesAt: "5pm",
  },
  {
    id: "3",
    name: "Royal Botanic Garden",
    category: "Park",
    rating: 4.9,
    reviewCount: 4521,
    distance: "1.8 km",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop",
    isOpen: true,
    closesAt: "5pm",
  },
  {
    id: "4",
    name: "Barangaroo Reserve",
    category: "Park",
    rating: 4.7,
    reviewCount: 892,
    distance: "3.2 km",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    isOpen: true,
    closesAt: "8pm",
  },
  {
    id: "5",
    name: "Opera Bar",
    category: "Bar",
    rating: 4.5,
    reviewCount: 1456,
    distance: "2.0 km",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop",
    isOpen: true,
    closesAt: "12am",
  },
];

export function FeaturedSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-warning" />
          <h2 className="section-header mb-0">What's On Today</h2>
        </div>
        <Link
          to="/search?filter=open"
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <p className="text-sm text-muted-foreground -mt-1">Right now, close to you</p>
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {featuredActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            variant="featured"
          />
        ))}
      </div>
    </section>
  );
}
