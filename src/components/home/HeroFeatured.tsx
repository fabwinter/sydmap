import { Link } from "react-router-dom";
import { useWhatsOnToday, type WhatsOnItem } from "@/hooks/useWhatsOnToday";
import { useRecommendedActivities } from "@/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface FeaturedItem {
  id: string;
  name: string;
  imageUrl: string;
  category?: string;
  address?: string;
  linkTo: string;
  isEvent?: boolean;
}

export function HeroFeatured() {
  const { data: whatsOn, isLoading: whatsOnLoading } = useWhatsOnToday(5);
  const { data: recommended, isLoading: recLoading } = useRecommendedActivities(5);

  const isLoading = whatsOnLoading && recLoading;

  // Build featured items: mix of What's On events + top recommended activities
  const items: FeaturedItem[] = [];

  if (whatsOn?.length) {
    whatsOn.slice(0, 3).forEach((item) => {
      if (item.imageUrl) {
        items.push({
          id: item.id,
          name: item.title,
          imageUrl: item.imageUrl,
          category: item.category || undefined,
          linkTo: item.activityId ? `/event/${item.activityId}` : (item.url || "#"),
          isEvent: true,
        });
      }
    });
  }

  if (recommended?.length) {
    recommended.slice(0, 5 - items.length).forEach((a) => {
      if (a.image) {
        items.push({
          id: a.id,
          name: a.name,
          imageUrl: a.image,
          category: a.category,
          address: a.address?.split(",").slice(-2).join(",").trim(),
          linkTo: a.isEvent ? `/event/${a.id}` : `/activity/${a.id}`,
        });
      }
    });
  }

  if (isLoading || items.length === 0) {
    return (
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] bg-muted rounded-none max-h-[45dvh]">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
    );
  }

  return (
    <Carousel opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent className="ml-0">
        {items.map((item) => (
          <CarouselItem key={item.id} className="pl-0 basis-full">
            <Link
              to={item.linkTo}
              className="relative block w-full aspect-[4/5] sm:aspect-[16/9] overflow-hidden group max-h-[45dvh]"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Featured badge */}
              <div className="absolute bottom-28 sm:bottom-24 left-4 z-10">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Featured
                </span>
              </div>

              {/* Title & details */}
              <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1">
                <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight line-clamp-2">
                  {item.name}
                </h2>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  {item.category && <span>{item.category}</span>}
                  {item.address && <span>📍 {item.address}</span>}
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
