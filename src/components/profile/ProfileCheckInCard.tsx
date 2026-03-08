import { useState } from "react";
import { ChevronRight, Share2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { MediaLightbox } from "@/components/ui/MediaLightbox";

interface CategorySticker {
  emoji: string;
  color: string;
}

export function ProfileCheckInCard({ checkIn, categoryStickers }: { checkIn: any; categoryStickers: Record<string, CategorySticker> }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  
  const photos: string[] = checkIn.photo_urls?.length > 0
    ? checkIn.photo_urls
    : checkIn.photo_url ? [checkIn.photo_url] : [];
  const allImages = photos.length > 0 ? photos : checkIn.activities?.hero_image_url ? [checkIn.activities.hero_image_url] : [];
  const displayImg = allImages[photoIndex] || "/placeholder.svg";
  const hasMultiple = allImages.length > 1;
  const cat = checkIn.activities?.category?.toLowerCase() || "";
  const sticker = categoryStickers[cat];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-[4/3] group shadow-sm hover:shadow-lg transition-shadow">
      <img
        src={displayImg}
        alt={checkIn.activities?.name || "Check-in"}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onClick={() => photos.length > 0 ? setLightbox(photoIndex) : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

      {sticker && (
        <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-gradient-to-r ${sticker.color} text-white text-[11px] font-semibold shadow-lg flex items-center gap-1 backdrop-blur-sm`}>
          {sticker.emoji} {checkIn.activities?.category}
        </div>
      )}

      <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 min-w-[44px] min-h-[44px] shadow-md">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {hasMultiple && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); setPhotoIndex((photoIndex - 1 + allImages.length) % allImages.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-md"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setPhotoIndex((photoIndex + 1) % allImages.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {hasMultiple && allImages.length <= 8 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {allImages.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIndex ? "bg-white w-3" : "bg-white/40"}`} />
          ))}
        </div>
      )}

      <Link to={`/activity/${checkIn.activities?.id}`} className="absolute bottom-0 left-0 right-0 z-10 p-4 space-y-1">
        <h3 className="font-bold text-sm text-white leading-tight line-clamp-1 drop-shadow">
          {checkIn.activities?.name || "Activity"}
        </h3>
        <div className="flex items-center gap-3 pt-0.5">
          <span className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < checkIn.rating ? "fill-warning text-warning" : "text-white/25"}`}
              />
            ))}
          </span>
          <span className="text-xs text-white/50 font-medium">
            {new Date(checkIn.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
          </span>
        </div>
        {checkIn.comment && (
          <p className="text-xs text-white/60 italic line-clamp-1 mt-0.5">"{checkIn.comment}"</p>
        )}
      </Link>

      {lightbox !== null && (
        <MediaLightbox urls={photos} initialIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
