import { useState, useRef, useEffect, useCallback } from "react";
import { Shield, Trash2, ImagePlus, Pencil, Save, X, Loader2, Link as LinkIcon, ClipboardPaste, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Activity = Tables<"activities">;

interface AdminPanelProps {
  activity: Activity;
}

export function AdminPanel({ activity }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [edits, setEdits] = useState({
    name: activity.name,
    description: activity.description || "",
    category: activity.category,
    address: activity.address || "",
    phone: activity.phone || "",
    website: activity.website || "",
    hours_open: activity.hours_open || "",
    hours_close: activity.hours_close || "",
    wifi: activity.wifi,
    parking: activity.parking,
    wheelchair_accessible: activity.wheelchair_accessible,
    outdoor_seating: activity.outdoor_seating,
    pet_friendly: activity.pet_friendly,
  });

  // Gallery images from photos table
  const [galleryPhotos, setGalleryPhotos] = useState<{ id: string; photo_url: string }[]>([]);

  const fetchGallery = useCallback(async () => {
    const { data } = await supabase
      .from("photos")
      .select("id, photo_url")
      .eq("activity_id", activity.id)
      .order("uploaded_at", { ascending: true });
    setGalleryPhotos(data || []);
  }, [activity.id]);

  useEffect(() => {
    if (isOpen) fetchGallery();
  }, [isOpen, fetchGallery]);

  // Handle paste from clipboard
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await uploadImageFile(file);
          return;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, activity.id]);

  const uploadImageFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    setIsUploading(true);
    try {
      const ext = file.name?.split(".").pop() || "jpg";
      const path = `admin/${activity.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("activity-photos")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("activity-photos")
        .getPublicUrl(path);

      await addPhotoToGallery(urlData.publicUrl);
      toast.success("Image added to gallery");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const addPhotoToGallery = async (url: string) => {
    // If no hero image, set as hero first
    if (!activity.hero_image_url) {
      await supabase.rpc("admin_update_activity", {
        p_activity_id: activity.id,
        p_updates: { hero_image_url: url } as any,
      });
    }
    // Also add to photos table for carousel
    const { data: profile } = await supabase.rpc("get_profile_id_from_auth");
    await supabase.from("photos").insert({
      activity_id: activity.id,
      photo_url: url,
      user_id: profile || undefined,
    });
    queryClient.invalidateQueries({ queryKey: ["activity", activity.id] });
    queryClient.invalidateQueries({ queryKey: ["activity-photos", activity.id] });
    fetchGallery();
  };

  const handleSetAsHero = async (url: string) => {
    try {
      await supabase.rpc("admin_update_activity", {
        p_activity_id: activity.id,
        p_updates: { hero_image_url: url } as any,
      });
      queryClient.invalidateQueries({ queryKey: ["activity", activity.id] });
      toast.success("Hero image updated");
    } catch {
      toast.error("Failed to set hero image");
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const { error } = await supabase.from("photos").delete().eq("id", photoId);
    if (error) {
      toast.error("Failed to delete photo");
      return;
    }
    fetchGallery();
    queryClient.invalidateQueries({ queryKey: ["activity-photos", activity.id] });
    toast.success("Photo removed");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.rpc("admin_update_activity", {
        p_activity_id: activity.id,
        p_updates: edits as any,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["activity", activity.id] });
      toast.success("Activity updated");
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${activity.name}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc("admin_delete_activity", {
        p_activity_id: activity.id,
      });
      if (error) throw error;
      toast.success("Activity deleted");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      navigate(-1);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageUrl = async () => {
    if (!imageUrl.trim()) return;
    await addPhotoToGallery(imageUrl.trim());
    setImageUrl("");
    setShowImageInput(false);
    toast.success("Image added");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 transition-colors"
        title="God Mode"
      >
        <Shield className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 z-50 w-full max-w-sm h-full bg-card border-l border-border shadow-2xl overflow-y-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImageFile(file);
        }}
      />

      {/* Header */}
      <div className="sticky top-0 bg-destructive text-destructive-foreground p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="font-bold text-sm">GOD MODE</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/20">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Image Gallery */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
            <Images className="w-3 h-3" /> Image Gallery
          </h3>

          {/* Current hero */}
          {activity.hero_image_url && (
            <div className="relative">
              <img src={activity.hero_image_url} alt="Hero" className="w-full h-32 rounded-lg object-cover" />
              <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">HERO</span>
            </div>
          )}

          {/* Gallery thumbnails */}
          {galleryPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img src={photo.photo_url} alt="" className="w-full h-20 rounded-lg object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleSetAsHero(photo.photo_url)}
                      className="p-1 bg-white/90 rounded text-[9px] font-bold text-foreground"
                      title="Set as hero"
                    >
                      Hero
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 bg-destructive/90 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add image buttons */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ImagePlus className="w-3 h-3 mr-1" />} Upload
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setShowImageInput(!showImageInput)}>
              <LinkIcon className="w-3 h-3 mr-1" /> URL
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ClipboardPaste className="w-3 h-3" /> Paste an image from clipboard (Ctrl/Cmd+V)
          </p>
          {showImageInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="sm" onClick={handleImageUrl} disabled={!imageUrl.trim()}>
                <Save className="w-3 h-3" />
              </Button>
            </div>
          )}
        </section>

        {/* Edit Fields */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">Details</h3>
            {!isEditing ? (
              <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setIsEditing(true)}>
                <Pencil className="w-3 h-3" /> Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" className="text-xs gap-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Field label="Name" value={edits.name} onChange={(v) => setEdits({ ...edits, name: v })} />
              <Field label="Category" value={edits.category} onChange={(v) => setEdits({ ...edits, category: v })} />
              <Field label="Description" value={edits.description} onChange={(v) => setEdits({ ...edits, description: v })} multiline />
              <Field label="Address" value={edits.address} onChange={(v) => setEdits({ ...edits, address: v })} />
              <Field label="Phone" value={edits.phone} onChange={(v) => setEdits({ ...edits, phone: v })} />
              <Field label="Website" value={edits.website} onChange={(v) => setEdits({ ...edits, website: v })} />
              <Field label="Opens" value={edits.hours_open} onChange={(v) => setEdits({ ...edits, hours_open: v })} />
              <Field label="Closes" value={edits.hours_close} onChange={(v) => setEdits({ ...edits, hours_close: v })} />

              <h4 className="text-xs font-bold uppercase text-muted-foreground pt-2">Amenities</h4>
              <Toggle label="WiFi" checked={edits.wifi} onChange={(v) => setEdits({ ...edits, wifi: v })} />
              <Toggle label="Parking" checked={edits.parking} onChange={(v) => setEdits({ ...edits, parking: v })} />
              <Toggle label="Accessible" checked={edits.wheelchair_accessible} onChange={(v) => setEdits({ ...edits, wheelchair_accessible: v })} />
              <Toggle label="Outdoor Seating" checked={edits.outdoor_seating} onChange={(v) => setEdits({ ...edits, outdoor_seating: v })} />
              <Toggle label="Pet Friendly" checked={edits.pet_friendly} onChange={(v) => setEdits({ ...edits, pet_friendly: v })} />
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <InfoRow label="Name" value={activity.name} />
              <InfoRow label="Category" value={activity.category} />
              <InfoRow label="Address" value={activity.address || "—"} />
              <InfoRow label="Phone" value={activity.phone || "—"} />
              <InfoRow label="Hours" value={activity.hours_open && activity.hours_close ? `${activity.hours_open} – ${activity.hours_close}` : "—"} />
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="border-t border-border pt-4 space-y-2">
          <h3 className="text-xs font-bold uppercase text-destructive">Danger Zone</h3>
          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Activity
          </Button>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-xs font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}