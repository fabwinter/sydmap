import { useState, useCallback, useEffect, useMemo } from "react";
import Map, { Marker, Popup, GeolocateControl, NavigationControl } from "react-map-gl/mapbox";
import { AppLayout } from "@/components/layout/AppLayout";
import { MapPin, Coffee, Waves, TreePine, Utensils, Wine, ShoppingBag, Dumbbell, Landmark, Cake, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import { useAllActivities, type Activity } from "@/hooks/useActivities";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { VenueList } from "@/components/map/VenueList";
import { MapFilters } from "@/components/map/MapFilters";

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
  const { filters } = useSearchFilters();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
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

  const handleNavigateToDetails = useCallback((activity: Activity) => {
    navigate(`/activity/${activity.id}`);
  }, [navigate]);

  // Apply all filters from shared state
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    
    return activities.filter((activity) => {
      // Search query filter
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesQuery = 
          activity.name.toLowerCase().includes(query) ||
          activity.category.toLowerCase().includes(query) ||
          (activity.description?.toLowerCase().includes(query) ?? false);
        if (!matchesQuery) return false;
      }

      // Category filter
      if (filters.category && activity.category !== filters.category) {
        return false;
      }

      // Open now filter
      if (filters.isOpen && !activity.is_open) {
        return false;
      }

      // Minimum rating filter
      if (filters.minRating !== null && (activity.rating ?? 0) < filters.minRating) {
        return false;
      }

      return true;
    });
  }, [activities, filters]);

  if (!MAPBOX_TOKEN) {
    return (
      <AppLayout showHeader={false} fullHeight>
        <div className="h-full flex items-center justify-center bg-muted">
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

  const mapContent = (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {/* Navigation Controls - Position adjusted with CSS for mobile bottom nav */}
      <NavigationControl position="bottom-right" style={{ marginBottom: "20px" }} />
      
      {/* Geolocate Control */}
      <GeolocateControl
        position="bottom-right"
        style={{ marginBottom: "80px" }}
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
              onClick={() => handleNavigateToDetails(selectedActivity)}
            >
              View Details
            </Button>
          </div>
        </Popup>
      )}
    </Map>
  );

  return (
    <AppLayout showHeader={false} fullHeight>
      <div className="flex h-screen overflow-hidden">
        {/* LEFT COLUMN: SCROLLABLE LIST - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex flex-col w-[400px] border-r border-border bg-background h-full">
          {/* Search Bar & Filters - Sticky header */}
          <div className="p-4 sticky top-0 bg-background z-10 border-b border-border shrink-0">
            <MapFilters activityCount={filteredActivities.length} isLoading={isLoading} />
          </div>
          
          {/* Venue List Cards - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <VenueList
              activities={filteredActivities}
              isLoading={isLoading}
              selectedActivity={selectedActivity}
              onSelectActivity={handleMarkerClick}
              onNavigateToDetails={handleNavigateToDetails}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: MAP */}
        <div className="flex-1 h-full relative">
          {mapContent}
          
          {/* Mobile-only floating search bar */}
          <div className="absolute top-4 left-4 right-4 safe-top z-10 md:hidden">
            <MapFilters activityCount={filteredActivities.length} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
