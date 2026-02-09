import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Clock,
  Phone,
  Globe,
  Car,
  Wifi,
  Accessibility,
  Star,
  ChevronRight,
  Check,
  PawPrint,
  UtensilsCrossed,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckInModal } from "@/components/activity/CheckInModal";
import { ShareMenu } from "@/components/activity/ShareMenu";
import { LocationMap } from "@/components/activity/LocationMap";
import { useActivityById } from "@/hooks/useActivities";
import { useActivityReviews, useActivityPhotos } from "@/hooks/useReviews";
import { useIsActivitySaved, useToggleSavedItem } from "@/hooks/useSavedItems";
import { useLastCheckIn } from "@/hooks/useLastCheckIn";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

export default function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCheckIn, setShowCheckIn] = useState(false);

  const { data: activity, isLoading: activityLoading, error } = useActivityById(id || "");
  const { data: reviews, isLoading: reviewsLoading } = useActivityReviews(id || "");
  const { data: photos } = useActivityPhotos(id || "");
  const { data: isSaved } = useIsActivitySaved(id || "");
  const { data: lastCheckIn } = useLastCheckIn(id || "");
  const toggleSaved = useToggleSavedItem();

  const handleToggleSave = () => {
    if (!user) {
      toast.error("Please sign in to save places");
      navigate("/login");
      return;
    }
    toggleSaved.mutate({ activityId: id!, isSaved: isSaved || false });
  };

  const handleCheckIn = () => {
    if (!user) {
      toast.error("Please sign in to check in");
      navigate("/login");
      return;
    }
    setShowCheckIn(true);
  };

  if (activityLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-72 w-full" />
        <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-32 h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Activity not found</h2>
          <p className="text-muted-foreground mt-2">This activity doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  // Combine hero image with photos
  const allPhotos = [
    activity.hero_image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop",
    ...(photos?.map(p => p.photo_url) || []),
  ];

  const amenities = [
    { icon: Car, label: "Parking", available: activity.parking },
    { icon: Wifi, label: "WiFi", available: activity.wifi },
    { icon: Accessibility, label: "Accessible", available: activity.wheelchair_accessible },
    { icon: UtensilsCrossed, label: "Outdoor", available: activity.outdoor_seating },
    { icon: PawPrint, label: "Pet Friendly", available: activity.pet_friendly },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-80">
        <img
          src={allPhotos[0]}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        {/* Category Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="status-badge open">{activity.category}</span>
          <h1 className="text-2xl font-bold text-white mt-2">{activity.name}</h1>
        </div>
      </div>
      
      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-warning text-warning" />
            <span className="text-lg font-bold">{activity.rating?.toFixed(1) || "N/A"}</span>
          </div>
          <span className="text-muted-foreground">
            out of {activity.review_count.toLocaleString()} reviews
          </span>
          {(activity.rating ?? 0) >= 4.5 && (
            <span className="ml-auto text-sm text-primary font-medium">Top rated</span>
          )}
        </div>
        
        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3">
          <InfoCard
            icon={MapPin}
            title={activity.address?.split(",")[0] || "Sydney"}
            subtitle={activity.address || "Sydney, NSW"}
          />
          <InfoCard
            icon={Clock}
            title={activity.is_open ? "Open Now" : "Closed"}
            subtitle={activity.hours_close ? `Closes at ${activity.hours_close}` : "Hours vary"}
            highlight={activity.is_open}
          />
          {activity.phone && (
            <InfoCard
              icon={Phone}
              title="Call"
              subtitle={activity.phone}
            />
          )}
          {activity.website && (
            <InfoCard
              icon={Globe}
              title="Website"
              subtitle={activity.website}
            />
          )}
        </div>
        
        {/* About */}
        {activity.description && (
          <section>
            <h2 className="section-header">About</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {activity.description}
            </p>
          </section>
        )}
        
        {/* Amenities */}
        <section>
          <h2 className="section-header">Amenities</h2>
          <div className="flex gap-4 flex-wrap">
            {amenities.map(({ icon: Icon, label, available }) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-1 ${
                  available ? "text-foreground" : "text-muted-foreground/50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    available ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </section>
        
        {/* Photos */}
        {allPhotos.length > 1 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-header mb-0">Photos</h2>
              <button className="text-sm text-primary font-medium flex items-center gap-1">
                See all
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {allPhotos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`${activity.name} ${i + 1}`}
                  className="w-32 h-24 rounded-xl object-cover shrink-0"
                />
              ))}
            </div>
          </section>
        )}
        
        {/* Location Map */}
        <section>
          <h2 className="section-header">Location</h2>
          <LocationMap
            latitude={activity.latitude}
            longitude={activity.longitude}
            name={activity.name}
          />
        </section>
        
        {/* Reviews */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-header mb-0">Reviews</h2>
            <button className="text-sm text-primary font-medium flex items-center gap-1">
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {reviewsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            ) : reviews && reviews.length > 0 ? (
              reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <img
                      src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`}
                      alt={review.profiles?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{review.profiles?.name || "Anonymous"}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "fill-warning text-warning"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      {review.review_text && (
                        <p className="text-sm text-muted-foreground mt-2">{review.review_text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </section>
      </div>
      
      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleSave}
            className="shrink-0"
            disabled={toggleSaved.isPending}
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-destructive text-destructive" : ""}`} />
          </Button>
          <ShareMenu activityName={activity.name} activityId={id!} />
          {lastCheckIn ? (
            <Button
              className="flex-1"
              variant="outline"
              disabled
            >
              <CalendarCheck className="w-5 h-5 mr-2 text-primary" />
              <span className="text-sm truncate">
                Checked-in {format(new Date(lastCheckIn.created_at), "EEE d MMM, h:mm a")}
              </span>
            </Button>
          ) : (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleCheckIn}
            >
              <Check className="w-5 h-5 mr-2" />
              Check-In
            </Button>
          )}
        </div>
      </div>
      
      {showCheckIn && (
        <CheckInModal
          activityId={id!}
          activityName={activity.name}
          onClose={() => setShowCheckIn(false)}
        />
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  subtitle,
  highlight,
}: {
  icon: any;
  title: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 bg-card rounded-xl p-3 border border-border">
      <Icon className={`w-5 h-5 mb-2 ${highlight ? "text-success" : "text-primary"}`} />
      <p className={`font-semibold text-sm truncate ${highlight ? "text-success" : ""}`}>{title}</p>
      <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
    </div>
  );
}
