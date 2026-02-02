import { Activity, ActivityCard } from "./ActivityCard";

const recommendedActivities: Activity[] = [
  {
    id: "6",
    name: "Bondi to Coogee Walk",
    category: "Hiking",
    rating: 4.9,
    reviewCount: 5672,
    distance: "3.5 km",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    isOpen: true,
  },
  {
    id: "7",
    name: "Art Gallery of NSW",
    category: "Museum",
    rating: 4.7,
    reviewCount: 2134,
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop",
    isOpen: true,
  },
  {
    id: "8",
    name: "Single O Coffee",
    category: "Cafe",
    rating: 4.6,
    reviewCount: 892,
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
    isOpen: true,
  },
  {
    id: "9",
    name: "Taronga Zoo",
    category: "Attraction",
    rating: 4.8,
    reviewCount: 8923,
    distance: "5.8 km",
    image: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&h=400&fit=crop",
    isOpen: true,
  },
  {
    id: "10",
    name: "Luna Park Sydney",
    category: "Theme Park",
    rating: 4.4,
    reviewCount: 3456,
    distance: "4.2 km",
    image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600&h=400&fit=crop",
    isOpen: true,
  },
  {
    id: "11",
    name: "Sydney Fish Market",
    category: "Market",
    rating: 4.5,
    reviewCount: 4123,
    distance: "3.0 km",
    image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&h=400&fit=crop",
    isOpen: true,
  },
];

export function RecommendedSection() {
  return (
    <section className="space-y-4">
      <h2 className="section-header">Recommended For You</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {recommendedActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}
