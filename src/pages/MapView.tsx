import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Map, { Marker, Popup, GeolocateControl, NavigationControl, MapRef } from "react-map-gl/mapbox";
import { LngLatBounds } from "mapbox-gl";
import { AppLayout } from "@/components/layout/AppLayout";
import { MapPin, Coffee, Waves, TreePine, Utensils, Wine, ShoppingBag, Dumbbell, Landmark, Cake, Star, LayoutList, MapIcon, Search, Database, Cloud, Plus, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import { useAllActivities, type Activity } from "@/hooks/useActivities";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useUserLocation, calculateDistance } from "@/hooks/useUserLocation";
import { useFoursquareSearch, type FoursquareVenue, normalizeFoursquareCategory } from "@/hooks/useFoursquareSearch";
import { useImportFoursquareVenue } from "@/hooks/useImportFoursquareVenue";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { VenueList } from "@/components/map/VenueList";
import { MapFilters } from "@/components/map/MapFilters";
import { MobileVenueCard } from "@/components/map/MobileVenueCard";
import { BulkActionBar } from "@/components/map/BulkActionBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { triggerHaptic } from "@/lib/haptics";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const categoryIcons: Record<string, any> = {
  Cafe: Coffee, Beach: Waves, Park: TreePine, Restaurant: Utensils, Bar: Wine,
  Shopping: ShoppingBag, Gym: Dumbbell, Museum: Landmark, Bakery: Cake,
};

const categoryColors: Record<string, string> = {
  Cafe: "bg-accent", Beach: "bg-secondary", Park: "bg-green-500",
  Restaurant: "bg-red-500", Bar: "bg-purple-500", Shopping: "bg-pink-500",
  Gym: "bg-orange-500", Museum: "bg-indigo-500", Bakery: "bg-amber-500",
};

// Sydney CBD fallback
const SYDNEY_LAT = -33.8688;
const SYDNEY_LNG = 151.2093;

const tagToColumn: Record<string, keyof Activity> = {
  "pet-friendly": "pet_friendly",
  "accessible": "wheelchair_accessible",
  "wifi": "wifi",
  "parking": "parking",
  "outdoor-seating": "outdoor_seating",
};

export default function MapView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: activities, isLoading } = useAllActivities(500);
  const { filters, setMapBounds } = useSearchFilters();
  const { location: userLocation } = useUserLocation();
  const importVenue = useImportFoursquareVenue();
  const isAdmin = useIsAdmin();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [showSearchHere, setShowSearchHere] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const mapRef = useRef<MapRef>(null);
  const isMobile = useIsMobile();
  const userMovedMap = useRef(false);
  const queryClient = useQueryClient();

  const toggleBulkSelect = useCallback((id: string) => {
    setBulkSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        const { error } = await supabase.rpc("admin_delete_activity", { p_activity_id: id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success(`Deleted ${bulkSelected.size} activities`);
      setBulkSelected(new Set());
      setBulkMode(false);
    },
    onError: (err: any) => toast.error(err.message || "Bulk delete failed"),
  });

  const userLat = userLocation?.latitude ?? SYDNEY_LAT;
  const userLng = userLocation?.longitude ?? SYDNEY_LNG;

  // Foursquare search: build combined query from all active filters
  const fsQuery = useMemo(() => {
    const parts: string[] = [];
    if (filters.query) parts.push(filters.query);
    if (filters.cuisine) parts.push(filters.cuisine);
    if (filters.category && !filters.cuisine) parts.push(filters.category);
    // If only category is set (e.g. "Restaurant"), use it; if cuisine is set, combine (e.g. "Chinese Restaurant")
    if (filters.cuisine && filters.category) parts.push(filters.category);
    return parts.join(" ") || "";
  }, [filters.query, filters.cuisine, filters.category]);
  const { data: foursquareVenues } = useFoursquareSearch(fsQuery, fsQuery.length >= 2);

  // Convert Foursquare venues to Activity-compatible objects for map display
  const foursquareAsActivities: Activity[] = useMemo(() => {
    if (!foursquareVenues?.length) return [];
    // Exclude venues already in local DB by foursquare_id
    const localFsIds = new Set(activities?.filter(a => a.foursquare_id).map(a => a.foursquare_id) ?? []);
    return foursquareVenues
      .filter(v => !localFsIds.has(v.id))
      .map((v): Activity => {
        const normalizedCategory = normalizeFoursquareCategory(v.category, v.tags, v.name);
        return {
          id: `fs-${v.id}`,
          name: v.name,
          category: normalizedCategory,
          latitude: v.latitude,
          longitude: v.longitude,
          address: v.address || null,
          description: v.description || null,
          rating: v.rating,
          review_count: 0,
          hero_image_url: v.photos?.[0] || null,
          is_open: true,
          phone: v.phone || null,
          website: v.website || null,
          hours_open: null,
          hours_close: null,
          parking: false,
          wheelchair_accessible: false,
          wifi: false,
          outdoor_seating: false,
          pet_friendly: false,
          foursquare_id: v.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
  }, [foursquareVenues, activities]);

  const urlLat = searchParams.get("lat");
  const urlLng = searchParams.get("lng");
  const urlZoom = searchParams.get("zoom");

  const [viewState, setViewState] = useState({
    latitude: urlLat ? parseFloat(urlLat) : SYDNEY_LAT,
    longitude: urlLng ? parseFloat(urlLng) : SYDNEY_LNG,
    zoom: urlZoom ? parseFloat(urlZoom) : 12,
  });

  // Get user's location on mount (only if no URL params)
  useEffect(() => {
    if (urlLat && urlLng) return;
    if (userLocation) {
      setViewState((prev) => ({ ...prev, latitude: userLocation.latitude, longitude: userLocation.longitude }));
    }
  }, [urlLat, urlLng, userLocation]);

  // Apply all filters from shared state
  const filteredActivities = useMemo(() => {
    const allActivities = [...(activities || []), ...foursquareAsActivities];

    return allActivities.filter((activity) => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesQuery =
          activity.name.toLowerCase().includes(query) ||
          activity.category.toLowerCase().includes(query) ||
          (activity.description?.toLowerCase().includes(query) ?? false) ||
          (activity.address?.toLowerCase().includes(query) ?? false);
        if (!matchesQuery) return false;
      }
      // Category
      if (filters.category && activity.category !== filters.category) return false;
      // Cuisine: when a cuisine is selected, only show food-related categories (Restaurant, Cafe, Bakery, Bar)
      if (filters.cuisine && !filters.category) {
        const foodCategories = ["Restaurant", "Cafe", "Bakery", "Bar"];
        if (!foodCategories.includes(activity.category)) return false;
      }
      // Open now
      if (filters.isOpen && !activity.is_open) return false;
      // Min rating
      if (filters.minRating !== null && (activity.rating ?? 0) < filters.minRating) return false;
      // Distance from user
      if (filters.maxDistance !== null) {
        const dist = calculateDistance(userLat, userLng, activity.latitude, activity.longitude);
        if (dist > filters.maxDistance) return false;
      }
      // Tag-based boolean filters
      for (const tag of filters.tags) {
        const column = tagToColumn[tag];
        if (column && !activity[column]) return false;
      }
      // Outdoor/indoor category tags
      if (filters.tags.includes("outdoor") && !["Beach", "Park"].includes(activity.category)) return false;
      if (filters.tags.includes("indoor") && !["Museum", "Gym", "Shopping"].includes(activity.category)) return false;
      // Map bounds (search this area)
      if (filters.mapBounds) {
        const { north, south, east, west } = filters.mapBounds;
        if (
          activity.latitude < south || activity.latitude > north ||
          activity.longitude < west || activity.longitude > east
        ) return false;
      }
      return true;
    });
  }, [activities, foursquareAsActivities, filters, userLat, userLng]);

  // Auto-fit map bounds when filters change (but not mapBounds itself)
  const filterKey = JSON.stringify({ ...filters, mapBounds: null });
  const prevFilterKey = useRef(filterKey);
  const isInitialRender = useRef(true);

  useEffect(() => {
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
    // Clear map bounds when other filters change
    setMapBounds(null);
    setShowSearchHere(false);
  }, [filterKey, filteredActivities, urlLat, urlLng, setMapBounds]);

  const handleMarkerClick = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
    setViewState((prev) => ({
      ...prev, latitude: activity.latitude, longitude: activity.longitude, zoom: 15,
    }));
  }, []);

  const handleNavigateToDetails = useCallback(async (activity: Activity) => {
    // If it's a Foursquare venue (fs- prefix), import it first
    if (activity.id.startsWith("fs-")) {
      const fsId = activity.id.replace("fs-", "");
      const venue = foursquareVenues?.find(v => v.id === fsId);
      if (venue) {
        try {
          const realId = await importVenue.mutateAsync(venue);
          navigate(`/activity/${realId}`);
          return;
        } catch (e) {
          toast.error("Failed to load venue details");
          return;
        }
      }
    }
    navigate(`/activity/${activity.id}`);
  }, [navigate, foursquareVenues, importVenue]);

  const handleSearchHere = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;
    setMapBounds({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
    setShowSearchHere(false);
    triggerHaptic("light");
  }, [setMapBounds]);

  const handleMapMove = useCallback((evt: any) => {
    setViewState(evt.viewState);
    if (userMovedMap.current) {
      setShowSearchHere(true);
    }
  }, []);

  const handleMapMoveStart = useCallback(() => {
    userMovedMap.current = true;
  }, []);

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
              <p className="text-muted-foreground text-sm mt-1">Please add your VITE_MAPBOX_TOKEN to enable the map</p>
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
      onMove={handleMapMove}
      onMoveStart={handleMapMoveStart}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={() => { if (isMobile) setSelectedActivity(null); }}
    >
      <NavigationControl position="bottom-right" style={{ marginBottom: "20px" }} />
      <GeolocateControl position="bottom-right" style={{ marginBottom: "80px" }} trackUserLocation showUserHeading />

      {filteredActivities.map((activity) => {
        const IconComponent = categoryIcons[activity.category] || MapPin;
        const colorClass = categoryColors[activity.category] || "bg-primary";
        const textColor = {
          Cafe: "text-accent", Beach: "text-secondary", Park: "text-green-500",
          Restaurant: "text-red-500", Bar: "text-purple-500", Shopping: "text-pink-500",
          Gym: "text-orange-500", Museum: "text-indigo-500", Bakery: "text-amber-500",
        }[activity.category] || "text-primary";
        const isSelected = selectedActivity?.id === activity.id;
        const isFoursquare = activity.id.startsWith("fs-");
        const isBulkSelected = bulkSelected.has(activity.id);
        return (
          <Marker key={activity.id} latitude={activity.latitude} longitude={activity.longitude} anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              if (bulkMode && !isFoursquare) {
                toggleBulkSelect(activity.id);
              } else {
                handleMarkerClick(activity);
              }
            }}
          >
            <div className="flex flex-col items-center" style={{ transform: 'translateY(0)' }}>
              <span
                className={`${textColor} text-[11px] font-bold leading-tight max-w-[100px] truncate px-1 py-0.5 rounded bg-white/80 backdrop-blur-sm mb-0.5 text-center`}
              >
                {activity.name}
              </span>
              <div className="relative">
                <div className={`rounded-full ${colorClass} flex items-center justify-center shadow-lg cursor-pointer transform transition-transform hover:scale-110 ${isBulkSelected ? "w-12 h-12 ring-3 ring-destructive scale-110" : isSelected ? "w-12 h-12 ring-2 ring-white scale-110" : "w-10 h-10"}`}>
                  {bulkMode && !isFoursquare ? (
                    isBulkSelected ? <CheckSquare className={`text-white ${isSelected ? "w-6 h-6" : "w-5 h-5"}`} /> : <IconComponent className={`text-white ${isSelected ? "w-6 h-6" : "w-5 h-5"}`} />
                  ) : (
                    <IconComponent className={`text-white ${isSelected ? "w-6 h-6" : "w-5 h-5"}`} />
                  )}
                </div>
                {isAdmin && !bulkMode && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${isFoursquare ? "bg-orange-500" : "bg-green-600"}`}>
                    {isFoursquare ? "F" : "DB"}
                  </div>
                )}
              </div>
            </div>
          </Marker>
        );
      })}

      {selectedActivity && !isMobile && (
        <Popup latitude={selectedActivity.latitude} longitude={selectedActivity.longitude} anchor="bottom" onClose={() => setSelectedActivity(null)} closeButton closeOnClick={false} offset={45}>
          <div className="p-2 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${categoryColors[selectedActivity.category] || "bg-primary"}`}>{selectedActivity.category}</span>
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
            {isAdmin && selectedActivity.id.startsWith("fs-") && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2 gap-1 text-xs"
                disabled={importVenue.isPending}
                onClick={async () => {
                  const fsId = selectedActivity.id.replace("fs-", "");
                  const venue = foursquareVenues?.find(v => v.id === fsId);
                  if (venue) {
                    try {
                      await importVenue.mutateAsync(venue);
                      toast.success("Added to database!");
                    } catch { toast.error("Failed to import"); }
                  }
                }}
              >
                <Plus className="w-3 h-3" /> Add to DB
              </Button>
            )}
            <Button size="sm" className="w-full mt-2" onClick={() => handleNavigateToDetails(selectedActivity)}>View Details</Button>
          </div>
        </Popup>
      )}
    </Map>
  );

  return (
    <AppLayout fullHeight>
      <div className="flex h-[100dvh] overflow-hidden">
        {/* LEFT COLUMN: SCROLLABLE LIST - desktop */}
        <div className="hidden md:flex flex-col w-[400px] border-r border-border bg-background h-full">
          <div className="p-4 sticky top-0 bg-background z-10 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {isLoading ? "Loading..." : `${filteredActivities.length} places`}
              </span>
              <div className="flex items-center gap-2">
               {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setBulkMode(!bulkMode); setBulkSelected(new Set()); }}
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${bulkMode ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    >
                      {bulkMode ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                      {bulkMode ? "Selecting" : "Select"}
                    </button>
                    {bulkMode && (
                      <button
                        onClick={() => {
                          const dbIds = filteredActivities.filter(a => !a.id.startsWith("fs-")).map(a => a.id);
                          if (bulkSelected.size === dbIds.length) {
                            setBulkSelected(new Set());
                          } else {
                            setBulkSelected(new Set(dbIds));
                          }
                        }}
                        className="text-xs font-medium px-2 py-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {bulkSelected.size === filteredActivities.filter(a => !a.id.startsWith("fs-")).length ? "Deselect All" : "Select All"}
                      </button>
                    )}
                  </div>
                )}
                <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <LayoutList className="w-4 h-4" />List View
                </Link>
              </div>
            </div>
            <MapFilters activityCount={filteredActivities.length} isLoading={isLoading} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <VenueList activities={filteredActivities} isLoading={isLoading} selectedActivity={selectedActivity} onSelectActivity={handleMarkerClick} onNavigateToDetails={handleNavigateToDetails} bulkMode={bulkMode} selectedIds={bulkSelected} onToggleSelect={toggleBulkSelect} />
          </div>
        </div>

        {/* RIGHT COLUMN: MAP */}
        <div className="flex-1 h-full relative flex flex-col">
          {/* Fixed search bar - mobile */}
          <div className="md:hidden shrink-0 z-30 bg-background/90 backdrop-blur-sm px-3 py-2 safe-top fixed top-0 left-0 right-0 pointer-events-auto" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="pointer-events-auto">
              <MapFilters activityCount={filteredActivities.length} isLoading={isLoading} />
            </div>
          </div>
          <div className="md:hidden shrink-0 h-[88px]" />

          <div className="flex-1 relative min-h-0">
            {mapContent}

            {/* "Search this area" button */}
            <AnimatePresence>
              {showSearchHere && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-1/2 md:top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 z-20"
                >
                  <Button
                    onClick={handleSearchHere}
                    size="sm"
                    className="rounded-full shadow-elevated gap-2 bg-card text-foreground border border-border hover:bg-muted"
                  >
                    <Search className="w-4 h-4 text-primary" />
                    Search this area
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active bounds chip */}
            {filters.mapBounds && !showSearchHere && (
              <div className="absolute top-1/2 md:top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 z-20">
                <button
                  onClick={() => { setMapBounds(null); setShowSearchHere(false); }}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-medium shadow-elevated"
                >
                  Showing this area
                  <span className="ml-1">✕</span>
                </button>
              </div>
            )}

            {mobileView === "map" && (
              <MobileVenueCard
                activity={selectedActivity}
                onClose={() => setSelectedActivity(null)}
                onNavigate={handleNavigateToDetails}
                isImporting={importVenue.isPending}
                onImportToDb={async (activity) => {
                  const fsId = activity.id.replace("fs-", "");
                  const venue = foursquareVenues?.find(v => v.id === fsId);
                  if (venue) {
                    try {
                      await importVenue.mutateAsync(venue);
                      toast.success("Added to database!");
                    } catch { toast.error("Failed to import"); }
                  }
                }}
              />
            )}

            {isMobile && (
              <AnimatePresence>
                {mobileView === "list" && (
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="absolute inset-x-0 bottom-0 top-0 z-10 bg-background/95 backdrop-blur-sm rounded-t-2xl shadow-elevated flex flex-col">
                    <div className="flex justify-center py-2 shrink-0"><div className="w-10 h-1 rounded-full bg-muted-foreground/30" /></div>
                    <div className="flex-1 overflow-y-auto pb-20">
                      <VenueList activities={filteredActivities} isLoading={isLoading} selectedActivity={selectedActivity} onSelectActivity={handleMarkerClick} onNavigateToDetails={handleNavigateToDetails} bulkMode={bulkMode} selectedIds={bulkSelected} onToggleSelect={toggleBulkSelect} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {isMobile && (
            <button
              onClick={() => { triggerHaptic("medium"); setMobileView(mobileView === "map" ? "list" : "map"); }}
              className="fixed bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-elevated font-semibold text-sm touch-none"
              style={{ userSelect: 'none', WebkitUserSelect: 'none', marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {mobileView === "map" ? (<><LayoutList className="w-4 h-4" />List</>) : (<><MapIcon className="w-4 h-4" />Map</>)}
            </button>
          )}
        </div>

        <AnimatePresence>
          {bulkMode && (
            <BulkActionBar
              selectedCount={bulkSelected.size}
              totalCount={filteredActivities.filter(a => !a.id.startsWith("fs-")).length}
              onDelete={() => {
                if (!confirm(`Delete ${bulkSelected.size} activities? This cannot be undone.`)) return;
                bulkDeleteMutation.mutate(Array.from(bulkSelected));
              }}
              onClear={() => { setBulkSelected(new Set()); setBulkMode(false); }}
              onSelectAll={() => {
                const dbIds = filteredActivities.filter(a => !a.id.startsWith("fs-")).map(a => a.id);
                if (bulkSelected.size === dbIds.length) {
                  setBulkSelected(new Set());
                } else {
                  setBulkSelected(new Set(dbIds));
                }
              }}
              isDeleting={bulkDeleteMutation.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
