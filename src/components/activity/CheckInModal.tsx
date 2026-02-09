import { useState } from "react";
import { X, Star, Camera, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CheckInModalProps {
  activityId: string;
  activityName: string;
  onClose: () => void;
}

export function CheckInModal({ activityId, activityName, onClose }: CheckInModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [shareWithFriends, setShareWithFriends] = useState(true);
  const [addToPublic, setAddToPublic] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async () => {
      // Get profile id first
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { error } = await supabase
        .from("check_ins")
        .insert({
          user_id: profile.id,
          activity_id: activityId,
          rating,
          comment: comment || null,
          photo_url: photo || null,
          share_with_friends: shareWithFriends,
          add_to_public_feed: addToPublic,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["last-check-in"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "🎉 Check-in complete!",
        description: "Thanks for sharing your experience",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error("Check-in error:", error);
      if (error.message?.includes("limit")) {
        toast({
          title: "Daily limit reached",
          description: "Free users can check in 3 times per day. Upgrade to Premium for unlimited check-ins!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check-in failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please add a rating",
        description: "Tap the stars to rate your experience",
        variant: "destructive",
      });
      return;
    }
    
    checkInMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-card rounded-t-3xl slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Check-In</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          <p className="text-center text-muted-foreground">
            Share your experience at <span className="font-semibold text-foreground">{activityName}</span>
          </p>
          
          {/* Rating */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">How was it?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-warning text-warning"
                        : "text-muted stroke-1"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Photo Upload */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Add a photo</p>
            {photo ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <img
                  src={photo}
                  alt="Check-in photo"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setPhoto("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Take photo</span>
                </button>
                <button
                  onClick={() => setPhoto("https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=500&fit=crop")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Comment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Comment</p>
              <span className="text-xs text-muted-foreground">{comment.length}/300</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 300))}
              placeholder="What did you love about this place?"
              rows={3}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          
          {/* Visibility */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Share with friends</p>
                <p className="text-xs text-muted-foreground">Your friends will see this check-in</p>
              </div>
              <Switch
                checked={shareWithFriends}
                onCheckedChange={setShareWithFriends}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Add to public feed</p>
                <p className="text-xs text-muted-foreground">Everyone can see this review</p>
              </div>
              <Switch
                checked={addToPublic}
                onCheckedChange={setAddToPublic}
              />
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 safe-bottom">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={checkInMutation.isPending}
            >
              {checkInMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Check-In"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
