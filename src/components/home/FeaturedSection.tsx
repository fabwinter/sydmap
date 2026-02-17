import { Sparkles, RefreshCw } from "lucide-react";
import { useWhatsOnToday, type WhatsOnItem } from "@/hooks/useWhatsOnToday";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function WhatsOnCard({ item }: { item: WhatsOnItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary/50" />
          </div>
        )}
        {item.category && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-foreground shadow-sm">
            {item.category}
          </div>
        )}
      </div>
      <div className="pt-2.5 space-y-0.5">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2">{item.title}</h3>
        {item.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>
        )}
      </div>
    </a>
  );
}

function CarouselSkeleton() {
  return (
    <div className="flex gap-3 md:gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px]">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="pt-2.5 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturedSection() {
  const { data: items, isLoading, isError, refetch } = useWhatsOnToday(10);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-warning" />
          <h2 className="section-header mb-0">What's On Today</h2>
        </div>
        <Link
          to="/whats-on"
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">Events & happenings in Sydney</p>

      {isLoading ? (
        <CarouselSkeleton />
      ) : isError ? (
        <div className="flex items-center gap-3 py-4">
          <p className="text-sm text-muted-foreground">Couldn't load What's On</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        </div>
      ) : items && items.length > 0 ? (
        <div className="relative group">
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-3 md:-ml-4">
              {items.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="pl-3 md:pl-4 basis-[200px] sm:basis-[220px] md:basis-[240px] lg:basis-[260px]"
                >
                  <WhatsOnCard item={item} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm border-border shadow-lg" />
            <CarouselNext className="hidden md:flex -right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm border-border shadow-lg" />
          </Carousel>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No events found</p>
      )}
    </section>
  );
}
