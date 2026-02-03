import { useState, useCallback, useEffect, useMemo } from "react";
import Map, { Marker, Popup, GeolocateControl, NavigationControl } from "react-map-gl/mapbox";
import { AppLayout } from "@/components/layout/AppLayout";
import { MapPin, Coffee, Waves, TreePine, Utensils, Wine, ShoppingBag, Dumbbell, Landmark, Cake, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import { useAllActivities, type Activity } from "@/hooks/useActivities";

const categoryIcons: Record<string, any> = {
  Cafe: Coffee,
  Beach: Waves,
  Park: TreePine,
  Restaurant: Utensils,
  Bar: Wine,
  Shopping: ShoppingBag,
  Gym: Dumbbell,
  Museum: Landmark,
  Bakery: Cake,
};

const categoryColors: Record<string, string> = {
  Cafe: "bg-accent",
  Beach: "bg-secondary",
  Park: "bg-green-500",
  Restaurant: "bg-red-500",
  Bar: "bg-purple-500",
  Shopping: "bg-pink-500",
  Gym: "bg-orange-500",
  Museum: "bg-indigo-500",
  Bakery: "bg-amber-500",
};

export default function MapView() {
  const navigate = useNavigate();
  const { data: activities, isLoading } = useAllActivities(200);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewState, setViewState] = useState({
    latitude: -33.8688,
    longitude: 151.2093,
    zoom: 12,
  });

  // Get user's location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        },
        (error) => {
          console.log("Geolocation error:", error.message);
        }
      );
    }
  }, []);

  const handleMarkerClick = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
    setViewState((prev) => ({
      ...prev,
      latitude: activity.latitude,
      longitude: activity.longitude,
      zoom: 15,
    }));
  }, []);

  const handleNavigateToDetails = () => {
    if (selectedActivity) {
      navigate(`/activity/${selectedActivity.id}`);
    }
  };

  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    return activities.filter((activity) =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  // Get unique categories from data
  const uniqueCategories = useMemo(() => {
    if (!activities) return [];
    const categories = [...new Set(activities.map(a => a.category))];
    return categories.filter(c => categoryColors[c]);
  }, [activities]);

  if (!MAPBOX_TOKEN) {
    return (
      <AppLayout showHeader={false}>
        <div className="relative h-screen flex items-center justify-center bg-muted">
          <div className="text-center space-y-4 p-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Mapbox Token Required</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Please add your VITE_MAPBOX_TOKEN to enable the map
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false}>
      <div className="relative h-screen">
        {/* Map */}
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          {/* Navigation Controls */}
          <NavigationControl position="bottom-right" style={{ marginBottom: "120px" }} />
          
          {/* Geolocate Control */}
          <GeolocateControl
            position="bottom-right"
            style={{ marginBottom: "180px" }}
            trackUserLocation
            showUserHeading
          />

          {/* Activity Markers */}
          {filteredActivities.map((activity) => {
            const IconComponent = categoryIcons[activity.category] || MapPin;
            const colorClass = categoryColors[activity.category] || "bg-primary";
            return (
              <Marker
                key={activity.id}
                latitude={activity.latitude}
                longitude={activity.longitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(activity);
                }}
              >
                <div
                  className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center shadow-lg cursor-pointer transform transition-transform hover:scale-110`}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </Marker>
            );
          })}

          {/* Popup for selected activity */}
          {selectedActivity && (
            <Popup
              latitude={selectedActivity.latitude}
              longitude={selectedActivity.longitude}
              anchor="bottom"
              onClose={() => setSelectedActivity(null)}
              closeButton={true}
              closeOnClick={false}
              offset={45}
            >
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs text-white ${categoryColors[selectedActivity.category] || "bg-primary"}`}
                  >
                    {selectedActivity.category}
                  </span>
                  {selectedActivity.is_open ? (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                      Open
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                      Closed
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-foreground">{selectedActivity.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span>{selectedActivity.rating?.toFixed(1) || "N/A"}</span>
                  <span className="text-xs">({selectedActivity.review_count} reviews)</span>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={handleNavigateToDetails}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          )}
        </Map>

        {/* Search Bar Overlay */}
        <div className="absolute top-4 left-4 right-4 safe-top z-10">
          <div className="bg-card rounded-xl shadow-lg p-3 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-20 left-4 safe-top z-10">
          <div className="bg-card rounded-xl shadow-lg p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {uniqueCategories.slice(0, 6).map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[category]}`} />
                  <span className="text-xs">{category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Count Badge */}
        <div className="absolute bottom-24 left-4 z-10">
          <div className="bg-card rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {isLoading ? "Loading..." : `${filteredActivities.length} places`}
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
