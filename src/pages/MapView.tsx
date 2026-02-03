import { useState, useCallback, useEffect } from "react";
import Map, { Marker, Popup, GeolocateControl, NavigationControl } from "react-map-gl/mapbox";
import { AppLayout } from "@/components/layout/AppLayout";
import { MapPin, Navigation, Coffee, Waves, TreePine, Utensils, Music, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/config/mapbox";

// Sample activities with coordinates around Sydney
const sampleActivities = [
  {
    id: "1",
    name: "Bondi Beach",
    category: "Beach",
    icon: Waves,
    latitude: -33.8908,
    longitude: 151.2743,
    rating: 4.8,
    isOpen: true,
  },
  {
    id: "2",
    name: "The Grounds of Alexandria",
    category: "Cafe",
    icon: Coffee,
    latitude: -33.9105,
    longitude: 151.1957,
    rating: 4.6,
    isOpen: true,
  },
  {
    id: "3",
    name: "Royal Botanic Garden",
    category: "Park",
    icon: TreePine,
    latitude: -33.8642,
    longitude: 151.2166,
    rating: 4.7,
    isOpen: true,
  },
  {
    id: "4",
    name: "Quay Restaurant",
    category: "Restaurant",
    icon: Utensils,
    latitude: -33.8568,
    longitude: 151.2093,
    rating: 4.9,
    isOpen: false,
  },
  {
    id: "5",
    name: "Sydney Opera House",
    category: "Entertainment",
    icon: Music,
    latitude: -33.8568,
    longitude: 151.2153,
    rating: 4.8,
    isOpen: true,
  },
  {
    id: "6",
    name: "Taronga Zoo",
    category: "Attraction",
    icon: Camera,
    latitude: -33.8436,
    longitude: 151.2411,
    rating: 4.5,
    isOpen: true,
  },
];

const categoryColors: Record<string, string> = {
  Beach: "bg-secondary",
  Cafe: "bg-accent",
  Park: "bg-green-500",
  Restaurant: "bg-red-500",
  Entertainment: "bg-purple-500",
  Attraction: "bg-yellow-500",
};

export default function MapView() {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<typeof sampleActivities[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
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
          setUserLocation({ latitude, longitude });
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

  const handleMarkerClick = useCallback((activity: typeof sampleActivities[0]) => {
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

  const filteredActivities = sampleActivities.filter((activity) =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            const IconComponent = activity.icon;
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
                  className={`w-10 h-10 rounded-full ${categoryColors[activity.category]} flex items-center justify-center shadow-lg cursor-pointer transform transition-transform hover:scale-110`}
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
                    className={`px-2 py-0.5 rounded-full text-xs text-white ${categoryColors[selectedActivity.category]}`}
                  >
                    {selectedActivity.category}
                  </span>
                  {selectedActivity.isOpen ? (
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
                  <span className="text-yellow-500">★</span>
                  <span>{selectedActivity.rating}</span>
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
              {Object.entries(categoryColors).map(([category, color]) => (
                <div key={category} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
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
            <span className="text-sm font-medium">{filteredActivities.length} places</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
