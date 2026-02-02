import { AppLayout } from "@/components/layout/AppLayout";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MapView() {
  return (
    <AppLayout showHeader={false}>
      <div className="relative h-screen">
        {/* Map Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Map View</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Interactive map coming soon
              </p>
            </div>
          </div>
        </div>
        
        {/* Current Location Button */}
        <Button
          size="icon"
          className="absolute bottom-24 right-4 w-12 h-12 rounded-full bg-card shadow-lg"
        >
          <Navigation className="w-5 h-5 text-primary" />
        </Button>
        
        {/* Search Bar Overlay */}
        <div className="absolute top-4 left-4 right-4 safe-top">
          <div className="bg-card rounded-xl shadow-lg p-3 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <input
              type="text"
              placeholder="Search locations..."
              className="flex-1 bg-transparent focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
