import { Bookmark, Plus, Heart, MapPin } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

const savedPlaces = [
  {
    id: "1",
    name: "Bronte Beach",
    category: "Beach",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    distance: "2.3 km",
  },
  {
    id: "2",
    name: "The Grounds of Alexandria",
    category: "Cafe",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
    distance: "4.1 km",
  },
  {
    id: "3",
    name: "Royal Botanic Garden",
    category: "Park",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
    distance: "1.8 km",
  },
];

const playlists = [
  { id: "1", name: "Weekend Vibes", count: 8, emoji: "🌴" },
  { id: "2", name: "Best Cafes", count: 12, emoji: "☕" },
  { id: "3", name: "Date Night", count: 5, emoji: "💕" },
];

export default function Saved() {
  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Saved</h1>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            New Playlist
          </Button>
        </div>
        
        {/* Playlists */}
        <section>
          <h2 className="section-header">Your Playlists</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="shrink-0 w-36 bg-card rounded-xl p-4 border border-border hover:border-primary transition-colors cursor-pointer"
              >
                <span className="text-3xl">{playlist.emoji}</span>
                <h3 className="font-semibold text-sm mt-2">{playlist.name}</h3>
                <p className="text-xs text-muted-foreground">{playlist.count} places</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* All Saved */}
        <section>
          <h2 className="section-header">All Saved Places</h2>
          <div className="space-y-3">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{place.name}</h3>
                  <p className="text-sm text-muted-foreground">{place.category}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {place.distance}
                  </p>
                </div>
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                  <Heart className="w-5 h-5 fill-destructive text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
