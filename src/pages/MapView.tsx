import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Map, { Marker, Popup, GeolocateControl, NavigationControl, MapRef } from "react-map-gl/mapbox";
import { LngLatBounds } from "mapbox-gl";
import { AppLayout } from "@/components/layout/AppLayout";
import { MapPin, Coffee, Waves, TreePine, Utensils, Wine, ShoppingBag, Dumbbell, Landmark, Cake, Star, LayoutList, MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import { useAllActivities, type Activity } from "@/hooks/useActivities";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { VenueList } from "@/components/map/VenueList";
import { MapFilters } from "@/components/map/MapFilters";
import { MobileVenueCard } from "@/components/map/MobileVenueCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { triggerHaptic } from "@/lib/haptics";
import { motion, AnimatePresence } from "framer-motion";

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
  const [searchParams] = useSearchParams();
  const { data: activities, isLoading } = useAllActivities(200);
  const { filters } = useSearchFilters();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const mapRef = useRef<MapRef>(null);
  const isMobile = useIsMobile();

  // Read optional lat/lng/zoom from URL query params (from activity details map click)
  const urlLat = searchParams.get("lat");
  const urlLng = searchParams.get("lng");
  const urlZoom = searchParams.get("zoom");

  const [viewState, setViewState] = useState({
    latitude: urlLat ? parseFloat(urlLat) : -33.8688,
    longitude: urlLng ? parseFloat(urlLng) : 151.2093,
    zoom: urlZoom ? parseFloat(urlZoom) : 12,
  });

  // Get user's location on mount (only if no URL params)
  useEffect(() => {
    if (urlLat && urlLng) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState((prev) => ({ ...prev, latitude, longitude }));
        },
        (error) => {
          console.log("Geolocation error:", error.message);
        }
      );
    }
  }, [urlLat, urlLng]);

  // Auto-fit map bounds when filters change
  const filterKey = JSON.stringify(filters);
  const prevFilterKey = useRef(filterKey);
  const isInitialRender = useRef(true);

  // Apply all filters from shared state
  const filteredActivities = useMemo(() => {
    if (!activities) return [];

    return activities.filter((activity) => {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesQuery =
          activity.name.toLowerCase().includes(query) ||
          activity.category.toLowerCase().includes(query) ||
          (activity.description?.toLowerCase().includes(query) ?? false);
        if (!matchesQuery) return false;
      }
      if (filters.category && activity.category !== filters.category) return false;
      if (filters.isOpen && !activity.is_open) return false;
      if (filters.minRating !== null && (activity.rating ?? 0) < filters.minRating) return false;
      return true;
    });
  }, [activities, filters]);

  useEffect(() => {
    // Skip initial render and URL-param navigations
    if (isInitialRender.current) {
      isInitialRender.current = false;
      prevFilterKey.current = filterKey;
      return;
    }
    if (filterKey === prevFilterKey.current) return;
    prevFilterKey.current = filterKey;
    if (urlLat && urlLng) return;
    if (!mapRef.current || filteredActivities.length === 0) return;

    const bounds = new LngLatBounds();
    filteredActivities.forEach((a) => bounds.extend([a.longitude, a.latitude]));
    mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 });
  }, [filterKey, filteredActivities, urlLat, urlLng]);

  const handleMarkerClick = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
    setViewState((prev) => ({
      ...prev,
      latitude: activity.latitude,
      longitude: activity.longitude,
      zoom: 15,
    }));
    // On mobile, hide filters when a venue is selected
    // filters handled by SearchOverlay
  }, [isMobile]);

  const handleNavigateToDetails = useCallback((activity: Activity) => {
    navigate(`/activity/${activity.id}`);
  }, [navigate]);

  if (!MAPBOX_TOKEN) {
    return (
      <AppLayout fullHeight>
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
      ref={mapRef}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={() => {
        // Deselect on map click (mobile)
        if (isMobile) setSelectedActivity(null);
      }}
    >
      <NavigationControl position="bottom-right" style={{ marginBottom: "20px" }} />
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
        const isSelected = selectedActivity?.id === activity.id;
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
              className={`rounded-full ${colorClass} flex items-center justify-center shadow-lg cursor-pointer transform transition-transform hover:scale-110 ${
                isSelected ? "w-12 h-12 ring-2 ring-white scale-110" : "w-10 h-10"
              }`}
            >
              <IconComponent className={`text-white ${isSelected ? "w-6 h-6" : "w-5 h-5"}`} />
            </div>
          </Marker>
        );
      })}

      {/* Desktop Popup only */}
      {selectedActivity && !isMobile && (
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
                <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">Open</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">Closed</span>
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
      <AppLayout fullHeight>
      <div className="flex h-screen overflow-hidden">
        {/* LEFT COLUMN: SCROLLABLE LIST - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex flex-col w-[400px] border-r border-border bg-background h-full">
          {/* Header with view switch */}
          <div className="p-4 sticky top-0 bg-background z-10 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {isLoading ? "Loading..." : `${filteredActivities.length} places`}
              </span>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <LayoutList className="w-4 h-4" />
                List View
              </Link>
            </div>
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

        {/* RIGHT COLUMN: MAP or LIST (mobile toggle) */}
        <div className="flex-1 h-full relative">
          {/* Mobile list view */}
          {isMobile && mobileView === "list" ? (
            <div className="h-full flex flex-col bg-background">
              <div className="p-3 border-b border-border shrink-0">
                <MapFilters activityCount={filteredActivities.length} isLoading={isLoading} />
              </div>
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
          ) : (
            <>
              {mapContent}
              {/* Mobile-only floating search */}
              <div className="md:hidden" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-4 left-3 right-3 safe-top z-10">
                  <MapFilters activityCount={filteredActivities.length} isLoading={isLoading} />
                </div>
              </div>
              <MobileVenueCard
                activity={selectedActivity}
                onClose={() => setSelectedActivity(null)}
                onNavigate={handleNavigateToDetails}
              />
            </>
          )}

          {/* Floating Map/List toggle button - mobile only */}
          {isMobile && (
            <button
              onClick={() => {
                triggerHaptic("medium");
                setMobileView(mobileView === "map" ? "list" : "map");
              }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-elevated font-semibold text-sm"
            >
              {mobileView === "map" ? (
                <>
                  <LayoutList className="w-4 h-4" />
                  List
                </>
              ) : (
                <>
                  <MapIcon className="w-4 h-4" />
                  Map
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
