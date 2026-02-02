import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckInModal } from "@/components/activity/CheckInModal";

const activity = {
  id: "1",
  name: "Bronte Beach",
  category: "Beach",
  rating: 4.8,
  reviewCount: 2341,
  description:
    "Bronte Beach is a small but popular beach located in the Eastern Suburbs of Sydney. Known for its family-friendly atmosphere, ocean pool, and beautiful park area perfect for picnics and BBQs. The beach offers calm waters in the southern corner, ideal for children.",
  address: "Bronte Rd, Bronte NSW 2024",
  distance: "2.3 km",
  phone: "+61 2 9083 8000",
  website: "www.waverley.nsw.gov.au",
  hours: {
    isOpen: true,
    opensAt: "6am",
    closesAt: "6pm",
  },
  amenities: [
    { icon: Car, label: "Parking", available: true },
    { icon: Wifi, label: "WiFi", available: false },
    { icon: Accessibility, label: "Accessible", available: true },
  ],
  photos: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
  ],
  reviews: [
    {
      id: "r1",
      user: { name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
      rating: 5,
      date: "2 days ago",
      text: "Beautiful beach! The ocean pool is amazing and perfect for a morning swim. Highly recommend visiting early to avoid crowds.",
    },
    {
      id: "r2",
      user: { name: "James L.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
      rating: 4,
      date: "1 week ago",
      text: "Great spot for families. The park area is perfect for a BBQ. Can get busy on weekends though.",
    },
  ],
};

export default function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-80">
        <img
          src={activity.photos[0]}
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
      
      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-warning text-warning" />
            <span className="text-lg font-bold">{activity.rating}</span>
          </div>
          <span className="text-muted-foreground">
            out of {activity.reviewCount.toLocaleString()} reviews
          </span>
          <span className="ml-auto text-sm text-primary font-medium">Top rated</span>
        </div>
        
        {/* Quick Info */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          <InfoCard
            icon={MapPin}
            title={activity.distance}
            subtitle={activity.address}
          />
          <InfoCard
            icon={Clock}
            title={activity.hours.isOpen ? "Open Now" : "Closed"}
            subtitle={`Closes at ${activity.hours.closesAt}`}
            highlight={activity.hours.isOpen}
          />
          <InfoCard
            icon={Phone}
            title="Call"
            subtitle={activity.phone}
          />
          <InfoCard
            icon={Globe}
            title="Website"
            subtitle={activity.website}
          />
        </div>
        
        {/* About */}
        <section>
          <h2 className="section-header">About</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {activity.description}
          </p>
        </section>
        
        {/* Amenities */}
        <section>
          <h2 className="section-header">Amenities</h2>
          <div className="flex gap-4">
            {activity.amenities.map(({ icon: Icon, label, available }) => (
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
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-header mb-0">Photos</h2>
            <button className="text-sm text-primary font-medium flex items-center gap-1">
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {activity.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt={`${activity.name} ${i + 1}`}
                className="w-32 h-24 rounded-xl object-cover shrink-0"
              />
            ))}
          </div>
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
            {activity.reviews.map((review) => (
              <div key={review.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{review.user.name}</span>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
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
                    <p className="text-sm text-muted-foreground mt-2">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSaved(!isSaved)}
            className="shrink-0"
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-destructive text-destructive" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" className="shrink-0">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => setShowCheckIn(true)}
          >
            <Check className="w-5 h-5 mr-2" />
            Check-In
          </Button>
        </div>
      </div>
      
      {showCheckIn && (
        <CheckInModal
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
    <div className="shrink-0 w-32 bg-card rounded-xl p-3 border border-border">
      <Icon className={`w-5 h-5 mb-2 ${highlight ? "text-success" : "text-primary"}`} />
      <p className={`font-semibold text-sm ${highlight ? "text-success" : ""}`}>{title}</p>
      <p className="text-xs text-muted-foreground line-clamp-1">{subtitle}</p>
    </div>
  );
}
