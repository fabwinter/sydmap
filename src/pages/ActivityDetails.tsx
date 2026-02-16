import { useState, useCallback, useRef } from "react";
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
  ChevronLeft,
  Check,
  PawPrint,
  UtensilsCrossed,
  CalendarCheck,
  ListPlus,
  Camera,
  Pencil,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckInModal } from "@/components/activity/CheckInModal";
import { ShareMenu } from "@/components/activity/ShareMenu";
import { AddToPlaylistModal } from "@/components/activity/AddToPlaylistModal";
import { LocationMap } from "@/components/activity/LocationMap";
import { useActivityById } from "@/hooks/useActivities";
import { useActivityReviews, useActivityPhotos } from "@/hooks/useReviews";
import { useIsActivitySaved, useToggleSavedItem } from "@/hooks/useSavedItems";
import { useActivityCheckIns } from "@/hooks/useActivityCheckIns";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AdminPanel } from "@/components/activity/AdminPanel";
import { toast } from "sonner";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [visitIndex, setVisitIndex] = useState(0);
  const [editingCheckIn, setEditingCheckIn] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [editExistingPhoto, setEditExistingPhoto] = useState<string | null>(null);
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data: activity, isLoading: activityLoading, error } = useActivityById(id || "");
  const { data: reviews, isLoading: reviewsLoading } = useActivityReviews(id || "");
  const { data: photos } = useActivityPhotos(id || "");
  const { data: isSaved } = useIsActivitySaved(id || "");
  const { data: checkIns } = useActivityCheckIns(id || "");
  const toggleSaved = useToggleSavedItem();

  const visitCount = checkIns?.length || 0;
  const currentVisit = checkIns?.[visitIndex] || null;

  const deleteCheckIn = useMutation({
    mutationFn: async (checkInId: string) => {
      const { error } = await supabase.from("check_ins").delete().eq("id", checkInId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["check-in-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setVisitIndex(0);
      toast.success("Check-in deleted");
    },
    onError: () => toast.error("Failed to delete check-in"),
  });

  const updateCheckIn = useMutation({
    mutationFn: async ({ checkInId, rating, comment, photoUrl }: { checkInId: string; rating: number; comment: string; photoUrl?: string | null }) => {
      const updateData: any = { rating, comment: comment.trim() || null };
      if (photoUrl !== undefined) updateData.photo_url = photoUrl;
      const { error } = await supabase
        .from("check_ins")
        .update(updateData)
        .eq("id", checkInId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["check-in-timeline"] });
      setEditingCheckIn(null);
      toast.success("Check-in updated");
    },
    onError: () => toast.error("Failed to update check-in"),
  });

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

  const heroUrl = activity.hero_image_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop";
  const galleryUrls = (photos?.map(p => p.photo_url) || []).filter(url => url !== heroUrl);
  const allPhotos = [heroUrl, ...galleryUrls];

  const amenities = [
    { icon: Car, label: "Parking", available: activity.parking },
    { icon: Wifi, label: "WiFi", available: activity.wifi },
    { icon: Accessibility, label: "Accessible", available: activity.wheelchair_accessible },
    { icon: UtensilsCrossed, label: "Outdoor", available: activity.outdoor_seating },
    { icon: PawPrint, label: "Pet Friendly", available: activity.pet_friendly },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {isAdmin && <AdminPanel activity={activity} />}
      {/* Hero Image Carousel */}
      <div className="relative h-72 sm:h-80">
        <img src={allPhotos[heroIndex] || allPhotos[0]} alt={activity.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {/* Carousel nav arrows */}
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={() => setHeroIndex((heroIndex - 1 + allPhotos.length) % allPhotos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setHeroIndex((heroIndex + 1) % allPhotos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {/* Photo counter */}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {heroIndex + 1}/{allPhotos.length}
          </div>
        )}
      </div>
      
      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        {/* Title Block */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{activity.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activity.category}
            {activity.address && ` • ${activity.address.split(",").slice(-2).join(",").trim()}`}
          </p>
          <p className={`text-sm mt-0.5 ${activity.is_open ? "text-success" : "text-destructive"}`}>
            {activity.is_open ? "Open" : "Closed"}
            {activity.hours_close && !activity.is_open && ` until ${activity.hours_close}`}
            {activity.hours_close && activity.is_open && ` · Closes at ${activity.hours_close}`}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-5 h-5 fill-warning text-warning" />
            <span className="text-lg font-bold">{activity.rating?.toFixed(1) || "—"}</span>
            <span className="text-sm text-muted-foreground">({activity.review_count.toLocaleString()})</span>
          </div>
        </div>

        
        
        {/* About */}
        <section>
          <h2 className="section-header">About</h2>
          <div className="space-y-4">
            {activity.phone && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <a href={`tel:${activity.phone}`} className="text-sm text-primary hover:underline">{activity.phone}</a>
              </div>
            )}
            {activity.website && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <a href={activity.website.startsWith("http") ? activity.website : `https://${activity.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground truncate">{activity.website}</a>
              </div>
            )}
            {activity.address && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground">{activity.address}</span>
              </div>
            )}
            {(activity.hours_open || activity.hours_close) && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground">
                  {activity.hours_open && activity.hours_close
                    ? `${activity.hours_open} – ${activity.hours_close}`
                    : "Hours not available"}
                </span>
              </div>
            )}
          </div>
          {activity.description && (
            <p className="text-muted-foreground text-sm leading-relaxed mt-4">{activity.description}</p>
          )}
        </section>
        
        {/* Amenities */}
        <section>
          <h2 className="section-header">Amenities</h2>
          <div className="flex gap-4 flex-wrap">
            {amenities.map(({ icon: Icon, label, available }) => (
              <div key={label} className={`flex flex-col items-center gap-1 ${available ? "text-foreground" : "text-muted-foreground/50"}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${available ? "bg-primary/10" : "bg-muted"}`}>
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
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {allPhotos.map((photo, i) => (
                <img key={i} src={photo} alt={`${activity.name} ${i + 1}`} className="w-32 h-24 rounded-xl object-cover shrink-0" />
              ))}
            </div>
          </section>
        )}
        
        {/* Location Map */}
        <section>
          <h2 className="section-header">Location</h2>
          <LocationMap latitude={activity.latitude} longitude={activity.longitude} name={activity.name} />
          {activity.latitude && activity.longitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activity.latitude},${activity.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-sm font-medium text-foreground"
            >
              <MapPin className="w-4 h-4 text-primary" />
              Get Directions
            </a>
          )}
        </section>
        
        {/* Reviews */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-header mb-0">Reviews</h2>
            <button className="text-sm text-primary font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
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
                          {format(new Date(review.created_at), "d MMM yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-warning text-warning" : "text-muted"}`} />
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

        {/* Visits (Check-in History) */}
        {visitCount > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-header mb-0">Visits ({visitCount})</h2>
              <Button size="sm" variant="outline" onClick={handleCheckIn} className="text-xs gap-1">
                <Check className="w-3 h-3" /> Check-In Again
              </Button>
            </div>

            {/* Visit navigator */}
            {visitCount > 1 && (
              <div className="flex items-center justify-center gap-3 mb-3">
                <button
                  onClick={() => setVisitIndex(Math.min(visitIndex + 1, visitCount - 1))}
                  disabled={visitIndex >= visitCount - 1}
                  className="p-1 rounded-full hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground font-medium">
                  Visit {visitCount - visitIndex} of {visitCount}
                </span>
                <button
                  onClick={() => setVisitIndex(Math.max(visitIndex - 1, 0))}
                  disabled={visitIndex <= 0}
                  className="p-1 rounded-full hover:bg-muted disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentVisit && editingCheckIn === currentVisit.id ? (
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setEditRating(star)} className="p-0.5">
                      <Star className={`w-6 h-6 ${star <= editRating ? "fill-warning text-warning" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value.slice(0, 300))}
                  placeholder="Update your comment..."
                  rows={2}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                {/* Photo upload/preview for edit */}
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5MB"); return; }
                    setEditPhotoFile(file);
                    const reader = new FileReader();
                    reader.onload = (ev) => setEditPhotoPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                    setEditExistingPhoto(null);
                  }}
                />
                {(editPhotoPreview || editExistingPhoto) ? (
                  <div className="relative">
                    <img
                      src={editPhotoPreview || editExistingPhoto!}
                      alt="Check-in photo"
                      className="w-full h-32 rounded-lg object-cover"
                    />
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={() => editFileInputRef.current?.click()}
                        className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                        title="Change photo"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => { setEditPhotoFile(null); setEditPhotoPreview(null); setEditExistingPhoto(null); }}
                        className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors text-sm text-muted-foreground"
                  >
                    <Camera className="w-4 h-4" /> Add photo
                  </button>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingCheckIn(null); setEditPhotoFile(null); setEditPhotoPreview(null); setEditExistingPhoto(null); }}>Cancel</Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={updateCheckIn.isPending || isUploadingEditPhoto || editRating === 0}
                    onClick={async () => {
                      let photoUrl: string | null | undefined = undefined;
                      // Upload new photo if selected
                      if (editPhotoFile) {
                        setIsUploadingEditPhoto(true);
                        try {
                          const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user!.id).single();
                          if (!profile) throw new Error("Profile not found");
                          const ext = editPhotoFile.name.split(".").pop() || "jpg";
                          const path = `${profile.id}/${Date.now()}.${ext}`;
                          const { error: uploadError } = await supabase.storage.from("check-in-photos").upload(path, editPhotoFile, { contentType: editPhotoFile.type });
                          if (uploadError) throw uploadError;
                          const { data: urlData } = supabase.storage.from("check-in-photos").getPublicUrl(path);
                          photoUrl = urlData.publicUrl;
                        } catch (err: any) {
                          toast.error(err.message || "Photo upload failed");
                          setIsUploadingEditPhoto(false);
                          return;
                        }
                        setIsUploadingEditPhoto(false);
                      } else if (!editExistingPhoto && currentVisit.photo_url) {
                        // Photo was removed
                        photoUrl = null;
                      }
                      updateCheckIn.mutate({ checkInId: currentVisit.id, rating: editRating, comment: editComment, photoUrl });
                    }}
                  >
                    {(updateCheckIn.isPending || isUploadingEditPhoto) ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            ) : currentVisit ? (
              <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(currentVisit.created_at), "EEE d MMM yyyy, h:mm a")}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < currentVisit.rating ? "fill-warning text-warning" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
                {currentVisit.comment && (
                  <p className="text-sm text-muted-foreground italic">"{currentVisit.comment}"</p>
                )}
                {currentVisit.photo_url && (
                  <img
                    src={currentVisit.photo_url}
                    alt="Check-in photo"
                    className="w-full h-32 rounded-lg object-cover"
                  />
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setEditingCheckIn(currentVisit.id);
                      setEditRating(currentVisit.rating);
                      setEditComment(currentVisit.comment || "");
                      setEditExistingPhoto(currentVisit.photo_url || null);
                      setEditPhotoFile(null);
                      setEditPhotoPreview(null);
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this check-in?")) {
                        deleteCheckIn.mutate(currentVisit.id);
                      }
                    }}
                    disabled={deleteCheckIn.isPending}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        )}
      </div>
      
      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Button variant="outline" size="icon" onClick={handleToggleSave} className="shrink-0" disabled={toggleSaved.isPending}>
            <Heart className={`w-5 h-5 ${isSaved ? "fill-destructive text-destructive" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (!user) { toast.error("Please sign in to save to playlists"); navigate("/login"); return; }
              setShowPlaylistModal(true);
            }}
            className="shrink-0"
          >
            <ListPlus className="w-5 h-5" />
          </Button>
          <ShareMenu activityName={activity.name} activityId={id!} />
          <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleCheckIn}>
            <Check className="w-5 h-5 mr-2" />
            {visitCount > 0 ? `Check-In Again (${visitCount})` : "Check-In"}
          </Button>
        </div>
      </div>
      
      {showCheckIn && (
        <CheckInModal activityId={id!} activityName={activity.name} onClose={() => setShowCheckIn(false)} />
      )}
      {showPlaylistModal && (
        <AddToPlaylistModal activityId={id!} activityName={activity.name} onClose={() => setShowPlaylistModal(false)} />
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const content = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
      {value}
    </a>
  ) : (
    <span className="text-foreground truncate">{value}</span>
  );

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="text-sm truncate flex-1">{content}</div>
    </div>
  );
}
